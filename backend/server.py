import asyncio
import asyncpg
import aiohttp
import base64
import io
import json
import logging
import os
import sys
import urllib.parse as urlparse
import uuid
from typing import List, Optional

from dotenv import load_dotenv
from openai import AsyncOpenAI
from PIL import Image
from quart import Quart, jsonify, request, send_file, make_response, websocket
from quart_cors import cors

# Global dictionary to track tasks (For demonstration; consider using Redis or a database in production)
processing_tasks = {}

# Configure logging first
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env if it exists
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Add parent directory to Python path to import main.py
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

async def get_db_pool():
    """Get PostgreSQL connection pool from environment variables or URL."""
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        url = urlparse.urlparse(database_url)
        
        # Create connection pool with retries
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
                    server_settings={
                        'client_encoding': 'UTF8'
                    }
                )
                if pool:
                    return pool
            except Exception as e:
                logging.error(f"Database connection attempt {attempt + 1} failed: {str(e)}")
                if attempt == 2:  # Last attempt
                    raise
                await asyncio.sleep(1)  # Wait before retrying
                continue
        
        raise ValueError("Failed to establish database connection after retries")
    except Exception as e:
        logging.error(f"Error creating database pool: {str(e)}")
        raise

# Import configuration first
try:
    from config import UPLOADS_DIR, INVENTORY_IMAGES_DIR, EXPORTS_DIR, DATA_DIR, DOCUMENT_DIRECTORY
except ImportError:
    logger.warning("Unable to import config.py. Falling back to environment variables.")
    DATA_DIR = os.environ.get('DATA_DIR', './data')
    UPLOADS_DIR = os.environ.get('UPLOADS_DIR', os.path.join(DATA_DIR, 'uploads'))
    INVENTORY_IMAGES_DIR = os.environ.get('INVENTORY_IMAGES_DIR', os.path.join(DATA_DIR, 'images', 'inventory'))
    EXPORTS_DIR = os.environ.get('EXPORTS_DIR', os.path.join(DATA_DIR, 'exports'))
    DOCUMENT_DIRECTORY = os.environ.get('DOCUMENT_DIRECTORY', os.path.join(DATA_DIR, 'documents'))

# Import main after config is set up
from main import (
    initialize_database
)

# Initialize app
app = Quart(__name__)
app.config.from_object('config')
app.db_pool = None

def configure_cors_origins() -> List[str]:
    """Configure CORS origins from environment variables and defaults."""
    origins = {
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

    # Get frontend URL from environment
    frontend_url = os.getenv('CORS_ORIGIN')
    if frontend_url:
        origins.add(frontend_url)
    
    # Add environment-specific origins
    for env_var in ['VERCEL_URL', 'CORS_ORIGIN', 'PUBLIC_BACKEND_URL', 'FRONTEND_URL']:
        if value := os.environ.get(env_var):
            if not value.startswith('http'):
                value = f'https://{value}'
            origins.add(value)
    
    return list(filter(None, origins))

# Configure CORS with expanded headers
app = cors(
    app,
    allow_origin=configure_cors_origins(),
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Credentials",
        "Content-Length"
    ],
    allow_credentials=True,
    max_age=86400,
    expose_headers=["Content-Type", "Authorization", "Content-Length"]
)

@app.before_serving
async def startup():
    """Initialize application before serving."""
    try:
        # Ensure directories exist
        for directory in [DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, EXPORTS_DIR, DOCUMENT_DIRECTORY]:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Created directory: {directory}")
        
        # Initialize database connection pool and tables
        app.db_pool = await get_db_pool()
        await initialize_database()
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise


@app.after_request
async def after_request(response):
    """Add CORS headers to all responses."""
    origin = request.headers.get('Origin')
    if origin in configure_cors_origins():
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Content-Length, Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type, Authorization, Content-Length',
            'Vary': 'Origin'
        })
    return response

@app.before_request
async def before_request():
    """Handle preflight requests."""
    if request.method == "OPTIONS":
        origin = request.headers.get('Origin')
        if origin in configure_cors_origins():
            response = await make_response()
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Content-Length, Access-Control-Allow-Origin',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400'
            })
            return response
    return None

@app.route('/process-files', methods=['OPTIONS'])
async def handle_options():
    """Handle OPTIONS requests for the process-files endpoint."""
    response = jsonify({'status': 'ok'})
    origin = request.headers.get('Origin')
    if origin in configure_cors_origins():
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Content-Length',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type, Authorization, Content-Length',
            'Vary': 'Origin'
        })
    return response

@app.route('/api/documents', methods=['GET'])
async def get_documents():
    """Get all documents from Document Vault."""
    try:
        async with app.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, title, author, journal_publisher, publication_year,
                       page_length, thesis, issue, summary, category, field,
                       hashtags, influenced_by, file_path, file_type, created_at
                FROM document_vault
                ORDER BY created_at DESC
            """)

            documents = [{
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
            } for row in rows]

            return jsonify(documents)
    except Exception as e:
        logger.error(f"Error fetching documents: {str(e)}")
        return jsonify({'error': 'Failed to fetch documents'}), 500

@app.route('/api/documents/<int:doc_id>/text', methods=['GET'])
async def get_document_text(doc_id: int):
    """Get full text of a specific document."""
    try:
        async with app.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT extracted_text
                FROM document_vault
                WHERE id = $1
            """, doc_id)

            if not row:
                return jsonify({'error': 'Document not found'}), 404

            return jsonify({'text': row['extracted_text']})
    except Exception as e:
        logger.error(f"Error fetching document text: {str(e)}")
        return jsonify({'error': 'Failed to fetch document text'}), 500

@app.route('/api/documents/<int:doc_id>/file', methods=['GET'])
async def get_document_file(doc_id: int):
    """Download the original document file."""
    try:
        async with app.db_pool.acquire() as conn:
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
        logger.error(f"Error serving document file: {str(e)}")
        return jsonify({'error': 'Failed to serve document file'}), 500

@app.route('/api/documents/search', methods=['POST'])
async def search_documents():
    """Search documents by content or metadata."""
    try:
        data = await request.get_json()
        query = data.get('query', '').strip()
        field = data.get('field', 'all')  # all, metadata, content

        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        async with app.db_pool.acquire() as conn:
            if field == 'content':
                # Search only in extracted_text
                rows = await conn.fetch("""
                    SELECT id, title, author, summary, extracted_text
                    FROM document_vault
                    WHERE extracted_text ILIKE $1
                    ORDER BY created_at DESC
                """, f'%{query}%')
            elif field == 'metadata':
                # Search in metadata fields
                rows = await conn.fetch("""
                    SELECT id, title, author, summary, extracted_text
                    FROM document_vault
                    WHERE title ILIKE $1
                       OR author ILIKE $1
                       OR summary ILIKE $1
                       OR thesis ILIKE $1
                       OR hashtags ILIKE $1
                    ORDER BY created_at DESC
                """, f'%{query}%')
            else:
                # Search all fields
                rows = await conn.fetch("""
                    SELECT id, title, author, summary, extracted_text
                    FROM document_vault
                    WHERE title ILIKE $1
                       OR author ILIKE $1
                       OR summary ILIKE $1
                       OR thesis ILIKE $1
                       OR hashtags ILIKE $1
                       OR extracted_text ILIKE $1
                    ORDER BY created_at DESC
                """, f'%{query}%')

            results = [{
                'id': row['id'],
                'title': row['title'],
                'author': row['author'],
                'summary': row['summary'],
                'excerpt': extract_matching_excerpt(row['extracted_text'], query)
            } for row in rows]

            return jsonify({'results': results})
    except Exception as e:
        logger.error(f"Error searching documents: {str(e)}")
        return jsonify({'error': 'Search failed'}), 500

def extract_matching_excerpt(text: str, query: str, context_chars: int = 150) -> str:
    """Extract a relevant excerpt from text containing the search query."""
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

@app.route('/api/inventory', methods=['GET'])
async def get_inventory():
    """Get all inventory items."""
    try:
        async with app.db_pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM products")

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
        logger.error(f"Error fetching inventory: {str(e)}")
        return jsonify({'error': 'Failed to fetch inventory'}), 500

def convert_to_relative_path(absolute_path: Optional[str]) -> Optional[str]:
    """Convert absolute image path to relative path."""
    if not absolute_path:
        return None
    path_parts = absolute_path.split('data/images/inventory/')
    return path_parts[1] if len(path_parts) > 1 else absolute_path

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {
        'png', 'jpg', 'jpeg', 'gif', 'webp',  # Images
        'pdf', 'doc', 'docx', 'txt', 'rtf'    # Documents
    }


client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

async def analyze_image_with_gpt4v(image_url: str, instruction: str) -> dict:
    """Analyze image using GPT-4V."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(image_url) as response:
                if response.status != 200:
                    raise Exception(f"Failed to fetch image: {response.status}")
                
                # Get the image content
                image_data = await response.read()
                
                # Process and resize image before base64 conversion
                from PIL import Image
                import io
                
                # Convert bytes to PIL Image
                img = Image.open(io.BytesIO(image_data))
                
                # Convert RGBA to RGB if needed
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                
                # Resize image while maintaining aspect ratio
                max_size = (512, 512)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Convert processed image to base64
                buffered = io.BytesIO()
                img.save(buffered, format="JPEG", quality=85)
                base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                # Call GPT-4V
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"""You are an assistant that helps catalog and analyze both products and documents for inventory.

{instruction}

Analyze this image and provide a detailed inventory entry in JSON format with the following fields:
{{
  'name': 'Brief, descriptive product name',
  'description': 'Detailed description broken into key points with periods',
  'category': 'One of: Technology, Artwork, Food & Beverage, Travel, Housewares, Fashion, Entertainment, Health & Beauty, Sports & Fitness, Education, or Other',
  'material': 'Primary materials used in construction',
  'color': 'Primary and secondary colors',
  'dimensions': 'Approximate dimensions or size',
  'origin_source': 'Cultural origin or manufacturing source',
  'import_cost': 'Estimated import cost in USD (numeric only)',
  'retail_price': 'Suggested retail price in USD (numeric only)',
  'key_tags': 'Comma-separated keywords for search and categorization'
}}

Ensure all fields are filled with appropriate values based on the image analysis."""
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}",
                                        "detail": "high"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=1000
                )
                
                # Parse the response
                import json
                try:
                    result = json.loads(response.choices[0].message.content)
                except:
                    # If JSON parsing fails, create a structured response
                    text_response = response.choices[0].message.content
                    result = {
                        'name': 'Untitled Item',
                        'description': text_response[:500],
                        'category': 'Other',
                        'material': 'Unknown',
                        'color': 'Various',
                        'dimensions': 'Not specified',
                        'origin_source': 'Unknown',
                        'import_cost': 0.0,
                        'retail_price': 0.0,
                        'key_tags': 'unclassified'
                    }
                
                return result
    except Exception as e:
        logger.error(f"Error analyzing image with GPT-4o: {str(e)}")
        raise

async def process_blob_images(images, instruction, conn):
    """Process images from Vercel Blob URLs."""
    for image in images:
        try:
            # Analyze image with GPT-4V
            analysis = await analyze_image_with_gpt4v(image['url'], instruction)
            
            # Store the results in the database
            await conn.execute(
                """
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
            logger.error(f"Error processing image {image['name']}: {str(e)}")
            raise

async def process_blob_document(doc, instruction, conn):
    """Process document from Vercel Blob URL."""
    try:
        # Store the blob URL directly in the database
        await conn.execute(
            """
            INSERT INTO document_vault (
                title, file_path, file_type
            ) VALUES ($1, $2, $3)
            """,
            doc['name'],
            doc['url'],  # Store the Blob URL directly
            os.path.splitext(doc['name'])[1][1:]  # Get file extension without dot
        )
    except Exception as e:
        logger.error(f"Error processing document {doc['name']}: {str(e)}")
        raise

@app.route('/process-files', methods=['POST'])
async def process_files():
    """Process files from Vercel Blob URLs."""
    try:
        # Log request details
        logger.info("Received file processing request")
        
        # Get request data
        data = await request.get_json()
        if not data or 'files' not in data:
            logger.error("No files found in request")
            return jsonify({'error': 'No files provided'}), 400

        files = data['files']
        instruction = data.get('instruction', "Catalog, categorize and Describe the item.")
        logger.info(f"Processing {len(files)} files with instruction: {instruction}")

        uploaded_files = {'images': [], 'documents': []}
        
        # Process each file
        for file_data in files:
            blob_url = file_data['blobUrl']
            original_name = file_data['originalName']
            
            if not allowed_file(original_name):
                logger.error(f"Invalid file type: {original_name}")
                continue

            ext = os.path.splitext(original_name)[1].lower()
            file_type = 'images' if ext in {'.png', '.jpg', '.jpeg', '.gif', '.webp'} else 'documents'
            
            # Add blob URL to appropriate list
            uploaded_files[file_type].append({
                'url': blob_url,
                'name': original_name
            })

        if not uploaded_files['images'] and not uploaded_files['documents']:
            logger.error("No valid files were provided")
            return jsonify({'error': 'No valid files provided'}), 400

        # Generate a unique task ID
        task_id = str(uuid.uuid4())
        processing_tasks[task_id] = {
            'status': 'queued',
            'progress': 0,
            'message': 'Task queued'
        }

        # Start the processing in the background
        asyncio.create_task(process_files_async(uploaded_files, instruction, task_id))

        return jsonify({'status': 'success', 'task_id': task_id}), 202

    except Exception as e:
        logger.error(f"Error processing files: {str(e)}")
        return jsonify({'error': str(e)}), 500


async def process_files_async(uploaded_files: dict, instruction: str, task_id: str) -> None:
    """Process files asynchronously."""
    # Get task info at the start and keep it in scope
    task_info = processing_tasks.get(task_id)
    if not task_info:
        logger.error(f"Task {task_id} not found in processing_tasks")
        return

    try:
        # Update initial status
        task_info.update({
            'status': 'processing',
            'message': 'Processing files...',
            'progress': 10
        })

        async with app.db_pool.acquire() as conn:
            # Process images
            if uploaded_files['images']:
                task_info.update({
                    'message': 'Processing images...',
                    'progress': 20
                })
                await process_blob_images(uploaded_files['images'], instruction, conn)
                task_info['progress'] = 50

            # Process documents
            if uploaded_files['documents']:
                task_info.update({
                    'message': 'Processing documents...',
                    'progress': 60
                })
                for doc in uploaded_files['documents']:
                    await process_blob_document(doc, instruction, conn)
                task_info['progress'] = 80

        # Update final success status
        task_info.update({
            'status': 'completed',
            'message': 'Processing complete!',
            'progress': 100
        })

    except Exception as e:
        logger.error(f"Error in background processing task {task_id}: {str(e)}")
        # Update error status
        task_info.update({
            'status': 'failed',
            'message': f'Error: {str(e)}',
            'progress': 100
        })

@app.route('/processing-status/<task_id>', methods=['GET'])
async def processing_status(task_id):
    task_info = processing_tasks.get(task_id)
    if not task_info:
        return jsonify({'error': 'Invalid task ID'}), 404

    return jsonify({
        'status': task_info['status'],
        'progress': task_info['progress'],
        'message': task_info['message']
    })
