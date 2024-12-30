"""
Backend server for Instantory - handles file processing, database operations, and API endpoints.
Uses Quart for async web framework and GPT-4V for image/document analysis.
"""

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

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'instantory.log'))
    ]
)
logger = logging.getLogger(__name__)

# Add parent directory to Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import optional dependencies
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

from dotenv import load_dotenv
from openai import AsyncOpenAI
from PIL import Image
from quart import Quart, jsonify, request, send_file, make_response
from quart_cors import cors

# Import local modules after sys.path is set up
from main import analyze_document, initialize_database

# Initialize paths and environment variables
def setup_environment():
    """Set up environment variables and directory structure"""
    # Load environment variables
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
    
    # Set up directory paths
    data_dir = Path(os.getenv('DATA_DIR', os.path.join(os.path.dirname(__file__), 'data')))
    paths = {
        'DATA_DIR': data_dir,
        'UPLOADS_DIR': data_dir / 'uploads',
        'INVENTORY_IMAGES_DIR': data_dir / 'images' / 'inventory',
        'EXPORTS_DIR': data_dir / 'exports',
        'DOCUMENT_DIRECTORY': data_dir / 'documents'
    }
    
    # Create directories
    for directory in paths.values():
        directory.mkdir(parents=True, exist_ok=True)
    
    return paths

# Initialize paths
PATHS = setup_environment()
DATA_DIR = PATHS['DATA_DIR']
UPLOADS_DIR = PATHS['UPLOADS_DIR']
INVENTORY_IMAGES_DIR = PATHS['INVENTORY_IMAGES_DIR']
EXPORTS_DIR = PATHS['EXPORTS_DIR']
DOCUMENT_DIRECTORY = PATHS['DOCUMENT_DIRECTORY']

class TaskManager:
    """Manages background tasks with TTL"""
    def __init__(self, ttl_seconds: int = 86400):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds
        
    def add_task(self, task_id: str) -> None:
        self.tasks[task_id] = {
            'status': 'queued',
            'progress': 0,
            'message': 'Task queued',
            'created_at': asyncio.get_event_loop().time()
        }
        
    def update_task(self, task_id: str, **kwargs) -> None:
        if task_id in self.tasks:
            self.tasks[task_id].update(kwargs)
            
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        if task_id in self.tasks:
            task = self.tasks[task_id]
            if asyncio.get_event_loop().time() - task['created_at'] > self.ttl_seconds:
                del self.tasks[task_id]
                return None
            return task
        return None
        
    def cleanup(self) -> None:
        current_time = asyncio.get_event_loop().time()
        expired = [
            task_id for task_id, task in self.tasks.items()
            if current_time - task['created_at'] > self.ttl_seconds
        ]
        for task_id in expired:
            del self.tasks[task_id]

task_manager = TaskManager()

class FileValidator:
    """File validation and processing utilities"""
    ALLOWED_EXTENSIONS = {
        'images': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf'}
    }
    
    @classmethod
    def is_allowed_file(cls, filename: str) -> bool:
        """Check if file has allowed extension"""
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
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
    """Create and manage PostgreSQL connection pool with retries"""
    pool = None
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        url = urlparse.urlparse(database_url)
        
        for attempt in range(3):
            try:
                pool = await asyncpg.create_pool(
                    user=url.username,
                    password=url.password,
                    database=url.path[1:],
                    host=url.hostname,
                    port=url.port,
                    ssl='require',
                    min_size=1,
                    max_size=10,
                    command_timeout=60,
                    server_settings={'client_encoding': 'UTF8'},
                    statement_cache_size=0  # Disable statement cache for better memory usage
                )
                break
            except Exception as e:
                if attempt == 2:
                    raise
                logger.warning(f"Database connection attempt {attempt + 1} failed: {e}")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        yield pool
    finally:
        if pool:
            await pool.close()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize Quart app with CORS
app = Quart(__name__)
app = cors(app, **CORSConfig.get_cors_config())

@app.before_serving
async def startup():
    """Initialize application before serving"""
    try:
        async with get_db_pool() as pool:
            await initialize_database(pool)
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.after_request
async def after_request(response):
    """Add security headers and CORS to all responses"""
    response.headers.update({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Vary': 'Origin'
    })
    
    origin = request.headers.get('Origin')
    if origin in CORSConfig.get_origins():
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': ', '.join(CORSConfig.ALLOWED_HEADERS),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type, Authorization, Content-Length'
        })
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
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }],
                max_tokens=2000,
                temperature=0.0
            )
            
            # Parse response
            text_response = response.choices[0].message.content.strip()
            result = json.loads(text_response)
            
            # Sanitize fields
            for key in ["name", "description", "category", "material", "color", 
                       "dimensions", "origin_source", "key_tags"]:
                if not result.get(key):
                    result[key] = "N/A"
            
            for num_key in ["import_cost", "retail_price"]:
                try:
                    result[num_key] = float(result.get(num_key, 0.0))
                except:
                    result[num_key] = 0.0
            
            return result
            
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
    async def process_blob_images(images: List[Dict[str, str]], instruction: str, conn: asyncpg.Connection) -> None:
        """Process images from Vercel Blob URLs"""
        for image in images:
            try:
                analysis = await FileProcessor.analyze_image_with_gpt4v(image['url'], instruction)
                
                await conn.execute("""
                    INSERT INTO products (
                        name, description, image_url, category, material,
                        color, dimensions, origin_source, import_cost, retail_price,
                        key_tags
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
                logger.error(f"Error processing image {image['name']}: {e}")
                raise
    
    @staticmethod
    async def process_blob_document(doc: Dict[str, str], instruction: str, conn: asyncpg.Connection) -> None:
        """Process document from Vercel Blob URL"""
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

# Register routes
app.route('/api/documents', methods=['GET'])(DocumentAPI.get_documents)
app.route('/api/documents/<int:doc_id>/text', methods=['GET'])(DocumentAPI.get_document_text)
app.route('/api/documents/<int:doc_id>/file', methods=['GET'])(DocumentAPI.get_document_file)
app.route('/api/documents/search', methods=['POST'])(DocumentAPI.search_documents)
app.route('/api/inventory', methods=['GET'])(InventoryAPI.get_inventory)

@app.route('/process-files', methods=['POST'])
async def process_files():
    """Process files from Vercel Blob URLs"""
    try:
        logger.info("Received file processing request")
        
        data = await request.get_json()
        if not data or 'files' not in data:
            logger.error("No files found in request")
            return jsonify({'error': 'No files provided'}), 400
        
        files = data['files']
        instruction = data.get('instruction', "Catalog, categorize and Describe the item.")
        logger.info(f"Processing {len(files)} files with instruction: {instruction}")
        
        # Sort files by type
        uploaded_files = {'images': [], 'documents': []}
        for file_data in files:
            if not FileValidator.is_allowed_file(file_data['originalName']):
                logger.error(f"Invalid file type: {file_data['originalName']}")
                continue
            
            file_type = FileValidator.get_file_type(file_data['originalName'])
            if file_type:
                uploaded_files[file_type].append({
                    'url': file_data['blobUrl'],
                    'name': file_data['originalName']
                })
        
        if not any(uploaded_files.values()):
            logger.error("No valid files were provided")
            return jsonify({'error': 'No valid files provided'}), 400
        
        # Create task
        task_id = str(uuid.uuid4())
        task_manager.add_task(task_id)
        
        # Process files
        asyncio.create_task(process_files_async(uploaded_files, instruction, task_id))
        
        return jsonify({'status': 'success', 'task_id': task_id}), 202
        
    except Exception as e:
        logger.error(f"Error processing files: {e}")
        return jsonify({'error': str(e)}), 500

async def process_files_async(uploaded_files: Dict[str, List[Dict[str, str]]], instruction: str, task_id: str) -> None:
    """Process files asynchronously"""
    task = task_manager.get_task(task_id)
    if not task:
        logger.error(f"Task {task_id} not found")
        return
    
    try:
        task_manager.update_task(task_id, status='processing', progress=10)
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Process images
                if uploaded_files['images']:
                    task_manager.update_task(task_id, message='Processing images...', progress=20)
                    await FileProcessor.process_blob_images(uploaded_files['images'], instruction, conn)
                    task_manager.update_task(task_id, progress=50)
                
                # Process documents
                if uploaded_files['documents']:
                    task_manager.update_task(task_id, message='Processing documents...', progress=60)
                    for doc in uploaded_files['documents']:
                        await FileProcessor.process_blob_document(doc, instruction, conn)
                    task_manager.update_task(task_id, progress=80)
        
        task_manager.update_task(task_id, status='completed', message='Processing complete!', progress=100)
        
    except Exception as e:
        logger.error(f"Error in background processing task {task_id}: {e}")
        task_manager.update_task(task_id, status='failed', message=f'Error: {str(e)}', progress=100)

@app.route('/processing-status/<task_id>', methods=['GET'])
async def processing_status(task_id: str):
    """Get status of a processing task"""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Invalid task ID'}), 404
    
    return jsonify({
        'status': task['status'],
        'progress': task['progress'],
        'message': task['message']
    })

# Cleanup expired tasks periodically
@app.before_serving
async def setup_task_cleanup():
    """Set up periodic task cleanup"""
    async def cleanup_loop():
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                task_manager.cleanup()
            except Exception as e:
                logger.error(f"Error in task cleanup: {e}")
                await asyncio.sleep(60)  # Wait before retrying
    
    # Start the cleanup loop
    asyncio.create_task(cleanup_loop())
