import asyncio
import asyncpg
import aiohttp
import base64
import io
import json
import logging
import os
import re
import sys
from pathlib import Path
import urllib.parse as urlparse
import uuid
from typing import Dict, List, Optional, Any, Tuple
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from openai import AsyncOpenAI
from PIL import Image
from quart import Quart, jsonify, request, send_file, make_response
from quart_cors import cors

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'instantory.log'))
    ]
)
logger = logging.getLogger(__name__)

# Set project root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

try:
    import PyPDF2
except ImportError:
    logger.warning("PyPDF2 not installed. PDF processing will be unavailable.")
    PyPDF2 = None

try:
    from docx import Document
except ImportError:
    logger.warning("python-docx not installed. DOCX processing will be unavailable.")
    Document = None

def load_env_variables():
    """Load environment variables from .env file."""
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)

load_env_variables()

# Directory paths
DATA_DIR = Path(os.getenv('DATA_DIR', os.path.join(os.path.dirname(__file__), 'data')))
PATHS = {
    'UPLOADS_DIR': DATA_DIR / 'uploads',
    'INVENTORY_IMAGES_DIR': DATA_DIR / 'images' / 'inventory',
    'EXPORTS_DIR': DATA_DIR / 'exports',
    'DOCUMENT_DIRECTORY': DATA_DIR / 'documents'
}

for directory in PATHS.values():
    directory.mkdir(parents=True, exist_ok=True)

class TableManager:
    """Manages custom table creation and schema."""
    def __init__(self):
        self.reserved_names = {'products', 'document_vault'}
    
    async def create_custom_table(self, conn: asyncpg.Connection, table_name: str, columns: List[Dict[str, str]]) -> bool:
        """Create a new custom table with specified columns."""
        try:
            # Sanitize table name
            table_name = re.sub(r'[^a-zA-Z0-9_]', '', table_name.lower())
            if not table_name or table_name in self.reserved_names:
                raise ValueError("Invalid table name")
            
            # Build column definitions
            column_defs = []
            for col in columns:
                col_name = re.sub(r'[^a-zA-Z0-9_]', '', col['name'].lower())
                col_type = col['type'].upper()
                if col_type not in ('TEXT', 'INTEGER', 'REAL', 'BOOLEAN', 'TIMESTAMP'):
                    col_type = 'TEXT'
                column_defs.append(f"{col_name} {col_type}")
            
            # Add standard columns
            column_defs.extend([
                "id SERIAL PRIMARY KEY",
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ])
            
            # Create table
            query = f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    {', '.join(column_defs)}
                )
            """
            await conn.execute(query)
            
            # Create updated_at trigger
            trigger_query = f"""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';

                DROP TRIGGER IF EXISTS update_updated_at_trigger ON {table_name};
                
                CREATE TRIGGER update_updated_at_trigger
                    BEFORE UPDATE ON {table_name}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            """
            await conn.execute(trigger_query)
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating custom table: {e}")
            return False
    
    async def get_table_schema(self, conn: asyncpg.Connection, table_name: str) -> List[Dict[str, str]]:
        """Get schema information for a table."""
        try:
            query = """
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            """
            rows = await conn.fetch(query, table_name)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting table schema: {e}")
            return []

class TaskManager:
    """Manages background tasks with TTL."""
    def __init__(self, ttl_seconds: int = 86400):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds

    def add_task(self, task_id: str) -> None:
        self.tasks[task_id] = {
            'status': 'queued',
            'progress': 0,
            'message': 'Task queued',
            'created_at': asyncio.get_running_loop().time()
        }

    def update_task(self, task_id: str, **kwargs) -> None:
        if task_id in self.tasks:
            self.tasks[task_id].update(kwargs)

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        task = self.tasks.get(task_id)
        if task and asyncio.get_running_loop().time() - task['created_at'] <= self.ttl_seconds:
            return task
        self.tasks.pop(task_id, None)
        return None

    def cleanup(self) -> None:
        try:
            current_time = asyncio.get_running_loop().time()
            expired_tasks = [task_id for task_id, task in self.tasks.items()
                            if current_time - task['created_at'] > self.ttl_seconds]
            for task_id in expired_tasks:
                del self.tasks[task_id]
        except RuntimeError:
            logger.warning("Task cleanup attempted outside running loop.")

# Create global managers
task_manager = TaskManager()
table_manager = TableManager()

async def initialize_database(pool: asyncpg.Pool) -> None:
    """Initialize database tables and indexes."""
    async with pool.acquire() as conn:
        # Create users table
        # Create users table with enhanced schema
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                picture_url TEXT,
                auth_provider TEXT NOT NULL DEFAULT 'email',
                google_id TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create user_exports table to track exports
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_exports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                file_name TEXT NOT NULL,
                file_url TEXT NOT NULL,
                file_type TEXT NOT NULL,
                export_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user
                    FOREIGN KEY(user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        ''')

        # Create indexes for better query performance
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_user_exports_user_id ON user_exports(user_id)')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)')

        # Create products table with improved schema
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                image_url TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                material TEXT,
                color TEXT,
                dimensions TEXT,
                origin_source TEXT,
                import_cost REAL,
                retail_price REAL,
                key_tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create document_vault table with improved schema
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS document_vault (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT,
                journal_publisher TEXT,
                publication_year INTEGER,
                page_length INTEGER,
                thesis TEXT,
                issue TEXT,
                summary TEXT,
                category TEXT NOT NULL,
                field TEXT,
                hashtags TEXT,
                influenced_by TEXT,
                file_path TEXT UNIQUE NOT NULL,
                file_type TEXT NOT NULL,
                extracted_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create indexes for improved query performance
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_document_title ON document_vault(title)')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_document_category ON document_vault(category)')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_document_content ON document_vault USING gin(to_tsvector(\'english\', extracted_text))')

async def analyze_document(text: str) -> Dict[str, Any]:
    """Analyze document text using GPT-4 model."""
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """
                Analyze this document and provide a JSON object with the following fields:
                1. "title": Document title (required)
                2. "author": Author names if available (required)
                3. "category": Document type (e.g., Research Paper, Technical Report) (required)
                4. "field": Primary field or subject area (required)
                5. "publication_year": Publication year as integer if available
                6. "journal_publisher": Journal or publisher name if available
                7. "thesis": Clear, concise thesis statement (required)
                8. "issue": Main question or problem addressed (required)
                9. "summary": Comprehensive summary in 400 characters or less (required)
                10. "influenced_by": 1-3 relevant persons, papers, cases, institutions, etc.
                11. "hashtags": 3-5 relevant keyword tags for categorization
                
                Focus on accuracy and conciseness. For required fields, provide best inference if not explicitly stated.
                Ensure summary is under 400 characters while capturing key points.
                Provide response in valid JSON format only, no additional text.
                """},
                {"role": "user", "content": text}
            ],
            max_tokens=1600,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        if isinstance(content, str):
            return json.loads(content)
        return content
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        return {
            'title': 'Untitled Document',
            'author': 'Unknown Author',
            'category': 'Document',
            'field': 'General',
            'publication_year': None,
            'journal_publisher': None,
            'thesis': 'Document analysis unavailable',
            'issue': 'Unable to determine',
            'summary': 'Document processing error occurred',
            'influenced_by': [],
            'hashtags': []
        }

class FileValidator:
    """File validation and processing utilities"""
    ALLOWED_EXTENSIONS = {
        'images': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf'}
    }
    
    @classmethod
    def is_allowed_file(cls, filename: str) -> bool:
        """Check if file has allowed extension"""
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        return ext in (cls.ALLOWED_EXTENSIONS['images'] | cls.ALLOWED_EXTENSIONS['documents'])
    
    @classmethod
    def get_file_type(cls, filename: str) -> Optional[str]:
        """Get file type category (image/document) or None if invalid"""
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        if ext in cls.ALLOWED_EXTENSIONS['images']:
            return 'images'
        if ext in cls.ALLOWED_EXTENSIONS['documents']:
            return 'documents'
        return None

class CORSConfig:
    """CORS configuration management"""
    ALLOWED_ORIGINS = {
        'https://bartleby.vercel.app',
        'https://instantory.vercel.app',
        'https://hocomnia.com',
        'https://instantory.onrender.com',
        'https://instantory-backend.onrender.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:10000',
        'http://127.0.0.1:10000'
    }
    
    ALLOWED_HEADERS = {
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials',
        'Content-Length'
    }
    
    @classmethod
    def get_origins(cls) -> List[str]:
        """Get allowed origins including environment-specific ones"""
        origins = cls.ALLOWED_ORIGINS.copy()
        
        # Add environment-specific origins
        env_vars = ['VERCEL_URL', 'CORS_ORIGIN', 'PUBLIC_BACKEND_URL', 'FRONTEND_URL']
        for var in env_vars:
            if value := os.getenv(var):
                origins.add(f"https://{value}" if not value.startswith('http') else value)
        
        return list(filter(None, origins))
    
    @classmethod
    def get_cors_config(cls) -> Dict[str, Any]:
        """Get complete CORS configuration"""
        return {
            'allow_origin': cls.get_origins(),
            'allow_methods': ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
            'allow_headers': list(cls.ALLOWED_HEADERS),
            'allow_credentials': True,
            'max_age': 86400,
            'expose_headers': ['Content-Type', 'Authorization', 'Content-Length']
        }

@asynccontextmanager
async def get_db_pool():
    """Create and manage PostgreSQL connection pool."""
    pool = None
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            logger.critical("DATABASE_URL environment variable is not set. Terminating application. ")
            raise ValueError("DATABASE_URL environment variable is required")
        url = urlparse.urlparse(database_url)
        pool = await asyncpg.create_pool(
            user=url.username,
            password=url.password,
            database=url.path[1:],
            host=url.hostname,
            port=url.port,
            ssl='require',
            min_size=1,
            max_size=10
        )
        yield pool
    finally:
        if pool:
            await pool.close()

client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize Quart app with CORS
app = Quart(__name__)
cors(app, allow_origin=CORSConfig.get_origins(), allow_credentials=True)

@app.before_serving
async def startup():
    try:
        async with get_db_pool() as pool:
            await initialize_database(pool)
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.after_request
async def after_request(response):
    """Add security headers and CORS to all responses."""
    response.headers.update({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Vary': 'Origin'
    })
    origin = request.headers.get('Origin')
    if origin in CORSConfig.get_origins():
        response.headers['Access-Control-Allow-Origin'] = origin
    return response

@app.before_request
async def before_request():
    """Handle preflight requests and basic security checks"""
    if request.method == "OPTIONS":
        response = await make_response()
        origin = request.headers.get('Origin')
        if origin in CORSConfig.get_origins():
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
                'Access-Control-Allow-Headers': ', '.join(CORSConfig.ALLOWED_HEADERS),
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400'
            })
        return response
        
    # Basic security checks
    content_type = request.headers.get('Content-Type', '')
    if request.method == 'POST' and not content_type.startswith(('application/json', 'multipart/form-data')):
        return jsonify({'error': 'Invalid Content-Type'}), 415

class DocumentAPI:
    """Document-related API endpoints"""
    
    @staticmethod
    async def get_documents():
        """Get all documents from Document Vault"""
        async with get_db_pool() as pool:
            try:
                async with pool.acquire() as conn:
                    rows = await conn.fetch("""
                        SELECT id, title, author, journal_publisher, publication_year,
                               page_length, thesis, issue, summary, category, field,
                               hashtags, influenced_by, file_path, file_type, created_at
                        FROM document_vault
                        ORDER BY created_at DESC
                        LIMIT 1000
                    """)
                    
                    return jsonify([{
                        'id': row['id'],
                        'title': row['title'],
                        'author': row['author'],
                        'journal_publisher': row['journal_publisher'],
                        'publication_year': row['publication_year'],
                        'page_length': row['page_length'],
                        'thesis': row['thesis'],
                        'issue': row['issue'],
                        'summary': row['summary'],
                        'category': row['category'],
                        'field': row['field'],
                        'hashtags': row['hashtags'],
                        'influenced_by': row['influenced_by'],
                        'file_type': row['file_type'],
                        'created_at': row['created_at'].isoformat() if row['created_at'] else None
                    } for row in rows])
            except Exception as e:
                logger.error(f"Error fetching documents: {e}")
                return jsonify({'error': 'Failed to fetch documents'}), 500
    
    @staticmethod
    async def get_document_text(doc_id: int):
        """Get full text of a specific document"""
        async with get_db_pool() as pool:
            try:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow("""
                        SELECT extracted_text
                        FROM document_vault
                        WHERE id = $1
                    """, doc_id)
                    
                    if not row:
                        return jsonify({'error': 'Document not found'}), 404
                    
                    return jsonify({'text': row['extracted_text']})
            except Exception as e:
                logger.error(f"Error fetching document text: {e}")
                return jsonify({'error': 'Failed to fetch document text'}), 500
    
    @staticmethod
    async def get_document_file(doc_id: int):
        """Download the original document file"""
        async with get_db_pool() as pool:
            try:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow("""
                        SELECT file_path, file_type
                        FROM document_vault
                        WHERE id = $1
                    """, doc_id)
                    
                    if not row or not row['file_path']:
                        return jsonify({'error': 'Document not found'}), 404
                    
                    file_path = row['file_path']
                    if not os.path.exists(file_path):
                        return jsonify({'error': 'Document file not found'}), 404
                    
                    return await send_file(
                        file_path,
                        mimetype=f'application/{row["file_type"]}',
                        as_attachment=True,
                        attachment_filename=os.path.basename(file_path)
                    )
            except Exception as e:
                logger.error(f"Error serving document file: {e}")
                return jsonify({'error': 'Failed to serve document file'}), 500
    
    @staticmethod
    async def search_documents():
        """Search documents by content or metadata"""
        try:
            data = await request.get_json()
            query = data.get('query', '').strip()
            field = data.get('field', 'all')
            
            if not query:
                return jsonify({'error': 'Search query is required'}), 400
            
            async with get_db_pool() as pool:
                async with pool.acquire() as conn:
                    if field == 'content':
                        where_clause = "extracted_text ILIKE $1"
                    elif field == 'metadata':
                        where_clause = """
                            title ILIKE $1 OR author ILIKE $1 OR summary ILIKE $1 
                            OR thesis ILIKE $1 OR hashtags ILIKE $1
                        """
                    else:
                        where_clause = """
                            title ILIKE $1 OR author ILIKE $1 OR summary ILIKE $1 
                            OR thesis ILIKE $1 OR hashtags ILIKE $1 OR extracted_text ILIKE $1
                        """
                    
                    sql = f"""
                        SELECT id, title, author, summary, extracted_text
                        FROM document_vault
                        WHERE {where_clause}
                        ORDER BY created_at DESC
                        LIMIT 100
                    """
                    
                    rows = await conn.fetch(sql, f'%{query}%')
                    
                    results = [{
                        'id': row['id'],
                        'title': row['title'],
                        'author': row['author'],
                        'summary': row['summary'],
                        'excerpt': extract_matching_excerpt(row['extracted_text'], query)
                    } for row in rows]
                    
                    return jsonify({'results': results})
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return jsonify({'error': 'Search failed'}), 500

def extract_matching_excerpt(text: str, query: str, context_chars: int = 150) -> str:
    """Extract a relevant excerpt from text containing the search query"""
    if not text or not query:
        return ""
    
    query_pos = text.lower().find(query.lower())
    if query_pos == -1:
        return text[:300] + "..."
    
    start = max(0, query_pos - context_chars)
    end = min(len(text), query_pos + len(query) + context_chars)
    
    excerpt = text[start:end]
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(text):
        excerpt = excerpt + "..."
    
    return excerpt

class InventoryAPI:
    """Inventory-related API endpoints"""
    
    @staticmethod
    async def get_inventory():
        """Get all inventory items"""
        async with get_db_pool() as pool:
            try:
                async with pool.acquire() as conn:
                    rows = await conn.fetch("SELECT * FROM products ORDER BY id DESC LIMIT 1000")
                    
                    inventory = [{
                        'id': row['id'],
                        'name': row['name'],
                        'description': row['description'],
                        'image_url': convert_to_relative_path(row['image_url']),
                        'category': row['category'],
                        'material': row['material'],
                        'color': row['color'],
                        'dimensions': row['dimensions'],
                        'origin_source': row['origin_source'],
                        'import_cost': row['import_cost'],
                        'retail_price': row['retail_price'],
                        'key_tags': row['key_tags']
                    } for row in rows]
                    
                    return jsonify(inventory)
            except Exception as e:
                logger.error(f"Error fetching inventory: {e}")
                return jsonify({'error': 'Failed to fetch inventory'}), 500

def convert_to_relative_path(absolute_path: Optional[str]) -> Optional[str]:
    """Convert absolute image path to relative path"""
    if not absolute_path:
        return None
    path_parts = absolute_path.split('data/images/inventory/')
    return path_parts[1] if len(path_parts) > 1 else absolute_path

class FileProcessor:
    """File processing utilities"""
    
    @staticmethod
    async def analyze_image_with_gpt4v(image_url: str, instruction: str) -> dict:
        """Analyze image using GPT-4V"""
        try:
            # Download and process image
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to fetch image: {response.status}")
                    image_data = await response.read()
            
            # Resize image
            img = Image.open(io.BytesIO(image_data))
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.thumbnail((512, 512), Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            # Prepare prompt
            prompt = f"""
            You are an assistant that catalogs and analyzes products for an inventory system.
            {instruction}
            Please respond ONLY with valid JSON containing these fields:
            {{
                "name": "<string>",
                "description": "<string>",
                "category": "<string>",
                "material": "<string>",
                "color": "<string>",
                "dimensions": "<string>",
                "origin_source": "<string>",
                "import_cost": "<number>",
                "retail_price": "<number>",
                "key_tags": "<string>"
            }}
            If a field is unavailable, write "N/A" (not empty or null).
            """
            
            # Call GPT-4V
            response = await client.chat.completions.create(
                model="gpt-4o", 
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }],
                max_tokens=2000
            )
            
            # Parse response
            text_response = response.choices[0].message.content.strip()
            
            try:
                # Attempt to parse JSON response
                result = json.loads(text_response)
                
                # Validate required fields and structure
                required_fields = {
                    "name": str,
                    "description": str,
                    "category": str,
                    "material": str,
                    "color": str,
                    "dimensions": str,
                    "origin_source": str,
                    "import_cost": (int, float),
                    "retail_price": (int, float),
                    "key_tags": str
                }
                
                # Validate and sanitize each field
                sanitized_result = {}
                for field, expected_type in required_fields.items():
                    value = result.get(field)
                    
                    # Handle numeric fields
                    if expected_type in [(int, float), float, int]:
                        try:
                            sanitized_result[field] = float(value if value is not None else 0)
                        except (TypeError, ValueError):
                            sanitized_result[field] = 0.0
                            logger.warning(f"Invalid numeric value for {field}: {value}")
                    # Handle string fields
                    else:
                        if not value or not isinstance(value, str):
                            sanitized_result[field] = "N/A"
                            logger.warning(f"Invalid or missing string value for {field}: {value}")
                        else:
                            sanitized_result[field] = value.strip()
                
                return sanitized_result
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse GPT-4V response as JSON: {e}\nResponse: {text_response}")
                raise Exception("Invalid JSON response from GPT-4V")
            
        except Exception as e:
            logger.error(f"Error analyzing image with GPT-4V: {e}")
            return {
                "name": "Untitled Item",
                "description": "N/A",
                "category": "N/A",
                "material": "N/A",
                "color": "N/A",
                "dimensions": "N/A",
                "origin_source": "N/A",
                "import_cost": 0.0,
                "retail_price": 0.0,
                "key_tags": "unclassified"
            }
    
    @staticmethod
    async def process_image_batch(images: List[Dict[str, str]], instruction: str, conn: asyncpg.Connection) -> None:
        """Process a batch of images efficiently"""
        for image in images:
            try:
                analysis = await FileProcessor.analyze_image_with_gpt4v(image['url'], instruction)
                
                await conn.execute("""
                    INSERT INTO products (
                        name, description, image_url, category, material,
                        color, dimensions, origin_source, import_cost, retail_price,
                        key_tags
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (image_url) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        category = EXCLUDED.category,
                        material = EXCLUDED.material,
                        color = EXCLUDED.color,
                        dimensions = EXCLUDED.dimensions,
                        origin_source = EXCLUDED.origin_source,
                        import_cost = EXCLUDED.import_cost,
                        retail_price = EXCLUDED.retail_price,
                        key_tags = EXCLUDED.key_tags
                """,
                    analysis['name'],
                    analysis['description'],
                    image['url'],
                    analysis['category'],
                    analysis['material'],
                    analysis['color'],
                    analysis['dimensions'],
                    analysis['origin_source'],
                    float(analysis.get('import_cost', 0)),
                    float(analysis.get('retail_price', 0)),
                    analysis.get('key_tags', '')
                )
            except Exception as e:
                logger.error(f"Error processing image {image.get('name', 'unknown')}: {e}")
                raise
    
    @staticmethod
    async def process_document(doc: Dict[str, str], instruction: str, conn: asyncpg.Connection) -> None:
        """Process document from Vercel Blob URL with improved error handling"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(doc['url']) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to fetch document: {response.status}")
                    document_data = await response.read()
            
            # Extract text
            with io.BytesIO(document_data) as doc_buffer:
                file_ext = os.path.splitext(doc['name'])[1].lower()
                
                if file_ext == '.pdf':
                    pdf_reader = PyPDF2.PdfReader(doc_buffer)
                    text = "\n".join(page.extract_text() for page in pdf_reader.pages)
                elif file_ext == '.docx':
                    doc_obj = Document(doc_buffer)
                    text = "\n".join(paragraph.text for paragraph in doc_obj.paragraphs)
                elif file_ext == '.txt':
                    text = document_data.decode('utf-8', errors='ignore')
                else:
                    raise ValueError(f"Unsupported file type: {file_ext}")
            
            # Analyze document
            doc_info = await analyze_document(text)
            
            # Store in database
            await conn.execute("""
                INSERT INTO document_vault (
                    title, author, journal_publisher, publication_year,
                    page_length, thesis, issue, summary, category,
                    field, hashtags, influenced_by, file_path,
                    file_type, extracted_text
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """,
                doc_info.get('title', doc['name']),
                doc_info.get('author', ''),
                doc_info.get('journal_publisher', ''),
                doc_info.get('publication_year'),
                len(text.split('\n')),
                doc_info.get('thesis', ''),
                doc_info.get('issue', ''),
                doc_info.get('summary', '')[:400],
                doc_info.get('category', ''),
                doc_info.get('field', ''),
                ','.join(doc_info.get('hashtags', [])),
                ','.join(doc_info.get('influenced_by', [])),
                doc['url'],
                file_ext[1:],
                text
            )
        except Exception as e:
            logger.error(f"Error processing document {doc['name']}: {e}")
            raise

# Auth routes
@app.route('/api/auth/google', methods=['POST'])
async def google_auth():
    """Handle Google OAuth authentication"""
    try:
        data = await request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({'success': False, 'message': 'Google token is required'}), 400
            
        # Verify Google token and get user info
        async with aiohttp.ClientSession() as session:
            async with session.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {google_token}'}
            ) as resp:
                if resp.status != 200:
                    return jsonify({'success': False, 'message': 'Invalid Google token'}), 401
                google_user = await resp.json()
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Check if user exists
                user = await conn.fetchrow(
                    'SELECT * FROM users WHERE google_id = $1 OR email = $2',
                    google_user['sub'], google_user['email']
                )
                
                if not user:
                    # Create new user
                    user = await conn.fetchrow('''
                        INSERT INTO users (
                            email, name, picture_url, auth_provider, google_id
                        ) VALUES ($1, $2, $3, 'google', $4)
                        RETURNING id, email, name, picture_url, created_at
                    ''', google_user['email'], google_user['name'],
                        google_user['picture'], google_user['sub'])
                else:
                    # Update existing user
                    user = await conn.fetchrow('''
                        UPDATE users 
                        SET name = $2, picture_url = $3, last_login = CURRENT_TIMESTAMP,
                            google_id = COALESCE(google_id, $4)
                        WHERE id = $1
                        RETURNING id, email, name, picture_url, created_at
                    ''', user['id'], google_user['name'],
                        google_user['picture'], google_user['sub'])
                
                return jsonify({
                    'success': True,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'picture_url': user['picture_url'],
                        'created_at': user['created_at'].isoformat() if user['created_at'] else None
                    }
                })
                
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during Google authentication'
        }), 500

@app.route('/api/auth/login', methods=['POST'])
async def login():
    """Handle email login/registration"""
    try:
        data = await request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Check if user exists
                user = await conn.fetchrow(
                    'SELECT * FROM users WHERE email = $1 AND auth_provider = \'email\'',
                    email.lower()
                )
                
                if not user:
                    # Create new user
                    user = await conn.fetchrow('''
                        INSERT INTO users (email, auth_provider)
                        VALUES ($1, 'email')
                        RETURNING id, email, name, picture_url, created_at
                    ''', email.lower())
                else:
                    # Update last login
                    user = await conn.fetchrow('''
                        UPDATE users 
                        SET last_login = CURRENT_TIMESTAMP 
                        WHERE id = $1
                        RETURNING id, email, name, picture_url, created_at
                    ''', user['id'])
                
                return jsonify({
                    'success': True,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'picture_url': user['picture_url'],
                        'created_at': user['created_at'].isoformat() if user['created_at'] else None
                    }
                })
                
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

@app.route('/api/user/exports', methods=['GET'])
async def get_user_exports():
    """Get user's export history"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                exports = await conn.fetch('''
                    SELECT * FROM user_exports
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                ''', int(user_id))
                
                return jsonify([{
                    'id': export['id'],
                    'file_name': export['file_name'],
                    'file_url': export['file_url'],
                    'file_type': export['file_type'],
                    'export_type': export['export_type'],
                    'created_at': export['created_at'].isoformat()
                } for export in exports])
                
    except Exception as e:
        logger.error(f"Error fetching user exports: {e}")
        return jsonify({'error': 'Failed to fetch exports'}), 500

@app.route('/api/user/exports', methods=['POST'])
async def add_user_export():
    """Add a new export to user's history"""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        file_name = data.get('file_name')
        file_url = data.get('file_url')
        file_type = data.get('file_type')
        export_type = data.get('export_type')
        
        if not all([user_id, file_name, file_url, file_type, export_type]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                export = await conn.fetchrow('''
                    INSERT INTO user_exports (
                        user_id, file_name, file_url, file_type, export_type
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, created_at
                ''', int(user_id), file_name, file_url, file_type, export_type)
                
                return jsonify({
                    'success': True,
                    'export': {
                        'id': export['id'],
                        'created_at': export['created_at'].isoformat()
                    }
                })
                
    except Exception as e:
        logger.error(f"Error adding user export: {e}")
        return jsonify({'error': 'Failed to add export'}), 500
                
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

# Register routes
app.route('/api/documents', methods=['GET'])(DocumentAPI.get_documents)
app.route('/api/documents/<int:doc_id>/text', methods=['GET'])(DocumentAPI.get_document_text)
app.route('/api/documents/<int:doc_id>/file', methods=['GET'])(DocumentAPI.get_document_file)
app.route('/api/documents/search', methods=['POST'])(DocumentAPI.search_documents)
app.route('/api/inventory', methods=['GET'])(InventoryAPI.get_inventory)

@app.route('/api/process-inventory', methods=['POST'])
async def process_inventory():
    """Process inventory images from Vercel Blob URLs"""
    try:
        logger.info("Received inventory processing request")
        
        data = await request.get_json()
        if not data or 'files' not in data:
            logger.error("No files found in request")
            return jsonify({'error': 'No files provided'}), 400
        
        files = data['files']
        instruction = data.get('instruction', "Catalog, categorize and describe the inventory item.")
        logger.info(f"Processing {len(files)} inventory items with instruction: {instruction}")
        
        # Validate files are images
        image_files = []
        for file_data in files:
            if not FileValidator.is_allowed_file(file_data['originalName']):
                logger.error(f"Invalid file type: {file_data['originalName']}")
                continue
            
            if FileValidator.get_file_type(file_data['originalName']) == 'images':
                image_files.append({
                    'url': file_data['blobUrl'],
                    'name': file_data['originalName']
                })
        
        if not image_files:
            logger.error("No valid image files provided")
            return jsonify({'error': 'No valid image files provided'}), 400
        
        # Create task
        task_id = str(uuid.uuid4())
        task_manager.add_task(task_id)
        
        # Process images in batches
        asyncio.create_task(process_inventory_async(image_files, instruction, task_id))
        
        return jsonify({'status': 'success', 'task_id': task_id}), 202
        
    except Exception as e:
        logger.error(f"Error processing inventory: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/process-documents', methods=['POST'])
async def process_documents():
    """Process documents from Vercel Blob URLs"""
    try:
        logger.info("Received document processing request")
        
        data = await request.get_json()
        if not data or 'files' not in data:
            logger.error("No files found in request")
            return jsonify({'error': 'No files provided'}), 400
        
        files = data['files']
        instruction = data.get('instruction', "Analyze and catalog the document.")
        logger.info(f"Processing {len(files)} documents with instruction: {instruction}")
        
        # Validate files are documents
        doc_files = []
        for file_data in files:
            if not FileValidator.is_allowed_file(file_data['originalName']):
                logger.error(f"Invalid file type: {file_data['originalName']}")
                continue
            
            if FileValidator.get_file_type(file_data['originalName']) == 'documents':
                doc_files.append({
                    'url': file_data['blobUrl'],
                    'name': file_data['originalName']
                })
        
        if not doc_files:
            logger.error("No valid document files provided")
            return jsonify({'error': 'No valid document files provided'}), 400
        
        # Create task
        task_id = str(uuid.uuid4())
        task_manager.add_task(task_id)
        
        # Process documents
        asyncio.create_task(process_documents_async(doc_files, instruction, task_id))
        return jsonify({'status': 'success', 'task_id': task_id}), 202
        
    except Exception as e:
        logger.error(f"Error processing documents: {e}")
        return jsonify({'error': str(e)}), 500

async def process_inventory_async(images: List[Dict[str, str]], instruction: str, task_id: str) -> None:
    """Process inventory images asynchronously in batches"""
    task = task_manager.get_task(task_id)
    if not task:
        logger.error(f"Task {task_id} not found, cancelling execution.")
        return
    
    try:
        task_manager.update_task(task_id, status='processing', progress=10)
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                total_images = len(images)
                processed = 0
                batch_size = 5  # Process 5 images at a time
                
                for i in range(0, total_images, batch_size):
                    batch = images[i:i + batch_size]
                    try:
                        await FileProcessor.process_image_batch(batch, instruction, conn)
                        processed += len(batch)
                        progress = 10 + (90 * processed / total_images)
                        task_manager.update_task(
                            task_id, 
                            progress=int(progress),
                            message=f'Processed {processed}/{total_images} images'
                        )
                    except Exception as batch_error:
                        logger.error(f"Error processing batch {i//batch_size + 1}: {batch_error}")
                        task_manager.update_task(task_id, error=f"Batch {i//batch_size + 1} failed: {str(batch_error)}")
                        continue
        
        final_status = 'completed' if processed == total_images else 'completed_with_errors'
        task_manager.update_task(
            task_id, 
            status=final_status,
            message=f'Processing complete! {processed}/{total_images} images processed successfully.',
            progress=100
        )
        
    except Exception as e:
        logger.error(f"Error in inventory processing task {task_id}: {e}")
        task_manager.update_task(task_id, status='failed', message=f'Error: {str(e)}', progress=100)

async def process_documents_async(documents: List[Dict[str, str]], instruction: str, task_id: str) -> None:
    """Process documents asynchronously with improved error handling"""
    task = task_manager.get_task(task_id)
    if not task:
        logger.error(f"Task {task_id} not found, cancelling execution.")
        return
    
    try:
        task_manager.update_task(task_id, status='processing', progress=10)
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                total_docs = len(documents)
                processed = 0
                
                for doc in documents:
                    try:
                        await FileProcessor.process_document(doc, instruction, conn)
                        processed += 1
                        progress = 10 + (90 * processed / total_docs)
                        task_manager.update_task(
                            task_id, 
                            progress=int(progress),
                            message=f'Processed {processed}/{total_docs} documents'
                        )
                    except Exception as doc_error:
                        logger.error(f"Error processing document {doc['name']}: {doc_error}")
                        task_manager.update_task(task_id, error=f"Document {doc['name']} failed: {str(doc_error)}")
                        continue
        
        final_status = 'completed' if processed == total_docs else 'completed_with_errors'
        task_manager.update_task(
            task_id, 
            status=final_status,
            message=f'Processing complete! {processed}/{total_docs} documents processed successfully.',
            progress=100
        )
        
    except Exception as e:
        logger.error(f"Error in document processing task {task_id}: {e}")
        task_manager.update_task(task_id, status='failed', message=f'Error: {str(e)}', progress=100)

@app.route('/processing-status/<task_id>', methods=['GET'])
async def processing_status(task_id: str):
    """Check the status of a background task."""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Invalid task ID'}), 404
    return jsonify(task)

@app.before_serving
async def setup_task_cleanup():
    """Periodic cleanup of expired tasks."""
    async def cleanup_loop():
        while True:
            await asyncio.sleep(3600)
            task_manager.cleanup()
    asyncio.create_task(cleanup_loop())
