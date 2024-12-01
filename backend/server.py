from typing import List, Optional
from quart import Quart, jsonify, request, send_file
from quart_cors import cors
import asyncpg
import logging
import os
import sys
import shutil
from datetime import datetime
import csv
import io
import urllib.parse as urlparse
import asyncio
from dotenv import load_dotenv
import base64

# Configure logging first
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env if it exists
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Add parent directory to Python path to import main.py
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

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
    initialize_database, 
    process_uploaded_images,
    process_document
)

# Initialize app
app = Quart(__name__)
app.config.from_object('config')
app.db_pool = None

def configure_cors_origins() -> List[str]:
    """Configure CORS origins from environment variables and defaults."""
    origins = {
        'https://instantory.vercel.app',
        'https://instantory-api.onrender.com',
        'https://instantory-backend.onrender.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:10000',
        'http://127.0.0.1:10000'
    }
    
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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Content-Length',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type, Authorization, Content-Length',
            'Vary': 'Origin'
        })
    return response

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

@app.route('/api/document-vault', methods=['GET'])
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

@app.route('/api/document-vault/<int:doc_id>/text', methods=['GET'])
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

@app.route('/api/document-vault/<int:doc_id>/file', methods=['GET'])
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

@app.route('/api/document-vault/search', methods=['POST'])
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

@app.route('/process-files', methods=['POST'])
async def process_files():
    """Process uploaded files (both images and documents)."""
    try:
        # Log request details
        logger.info("Received file upload request")
        logger.debug(f"Request headers: {dict(request.headers)}")

        # Check if files are present in request
        files = await request.files
        if not files:
            logger.error("No files found in request")
            return jsonify({'error': 'No files uploaded'}), 400

        uploaded_files = {'images': [], 'documents': []}
        
        # Process each file
        for file in files.getlist('files'):
            if not file:
                logger.error("Empty file object received")
                continue

            if not file.filename:
                logger.error("File has no filename")
                continue

            if not allowed_file(file.filename):
                logger.error(f"Invalid file type: {file.filename}")
                continue

            try:
                ext = os.path.splitext(file.filename)[1].lower()
                file_type = 'images' if ext in {'.png', '.jpg', '.jpeg', '.gif', '.webp'} else 'documents'
                
                # Create unique filename to prevent collisions
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                safe_filename = f"{timestamp}_{file.filename}"
                filename = os.path.join(UPLOADS_DIR, safe_filename)
                
                # Ensure upload directory exists
                os.makedirs(UPLOADS_DIR, exist_ok=True)
                
                # Save file
                logger.info(f"Saving file: {safe_filename}")
                await file.save(filename)
                uploaded_files[file_type].append(filename)
                logger.info(f"Successfully saved file: {safe_filename}")
            except Exception as file_error:
                logger.error(f"Error saving file {file.filename}: {str(file_error)}")
                continue

        if not uploaded_files['images'] and not uploaded_files['documents']:
            logger.error("No valid files were uploaded")
            return jsonify({'error': 'No valid files uploaded'}), 400

        # Get instruction from form data
        form = await request.form
        instruction = form.get('instruction', "Catalog, categorize and Describe the item.")
        logger.info(f"Processing files with instruction: {instruction}")
        
        try:
            async with app.db_pool.acquire() as conn:
                # Process images
                if uploaded_files['images']:
                    logger.info(f"Processing {len(uploaded_files['images'])} images")
                    await process_uploaded_images(instruction, conn)
                
                # Process documents
                if uploaded_files['documents']:
                    logger.info(f"Processing {len(uploaded_files['documents'])} documents")
                    batch_dir = os.path.join(DOCUMENT_DIRECTORY, datetime.now().strftime("%Y%m%d-%H%M%S"))
                    os.makedirs(batch_dir, exist_ok=True)
                    for doc_path in uploaded_files['documents']:
                        try:
                            logger.info(f"Processing document: {os.path.basename(doc_path)}")
                            await process_document(doc_path, batch_dir, conn)
                            logger.info(f"Successfully processed document: {os.path.basename(doc_path)}")
                        except Exception as doc_error:
                            logger.error(f"Error processing document {doc_path}: {str(doc_error)}")
                            return jsonify({'error': f'Error processing document: {str(doc_error)}'}), 500
                
            logger.info("All files processed successfully")
            return jsonify({'status': 'success', 'message': 'Files processed successfully'})
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            return jsonify({'error': f'Database error: {str(db_error)}'}), 500
    except Exception as e:
        logger.error(f"Error processing files: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up uploaded files
        for file_list in uploaded_files.values():
            for file_path in file_list:
                try:
                    if os.path.exists(file_path):
                        logger.info(f"Cleaning up file: {os.path.basename(file_path)}")
                        os.remove(file_path)
                except Exception as cleanup_error:
                    logger.error(f"Error cleaning up file {file_path}: {str(cleanup_error)}")

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
