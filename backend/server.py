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

# Add parent directory to Python path to import main.py
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from main import (
    initialize_database, 
    get_db_pool,
    process_uploaded_images,
    analyze_document,
    process_document,
    search_documents
)

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Import config after environment variables are loaded
try:
    from config import UPLOADS_DIR, INVENTORY_IMAGES_DIR, EXPORTS_DIR, DATA_DIR
except ImportError:
    # Fallback to direct import if relative import fails
    import config
    UPLOADS_DIR = config.UPLOADS_DIR
    INVENTORY_IMAGES_DIR = config.INVENTORY_IMAGES_DIR
    EXPORTS_DIR = config.EXPORTS_DIR

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize app
app = Quart(__name__)
app.config.from_object('config')
app.db_pool = None  # Initialize db_pool attribute

def configure_cors_origins() -> List[str]:
    """Configure CORS origins from environment variables and defaults."""
    # Default origins
    origins = {
        'https://instantory.vercel.app',
        'https://instantory-api.onrender.com',
        'https://instantory-backend.onrender.com',
        'https://instantory-dhj0hu4yd-demothedreads-projects.vercel.app',
        'https://instantory-6pl2dnzgn-demothedreads-projects.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:10000',
        'http://127.0.0.1:10000'
    }

    # Add Vercel URL if available
    vercel_url = os.environ.get('VERCEL_URL')
    if vercel_url:
        if not vercel_url.startswith('http'):
            vercel_url = f'https://{vercel_url}'
        origins.add(vercel_url)

    # Add CORS_ORIGIN URLs
    cors_origins = os.environ.get('CORS_ORIGIN', '').split(',')
    origins.update(origin.strip() for origin in cors_origins if origin.strip())

    # Add public backend URL
    public_backend = os.environ.get('PUBLIC_BACKEND_URL')
    if public_backend:
        origins.add(public_backend)


    # Add frontend URL if available
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        origins.add(frontend_url)

    # Add any additional origins from environment variables
    additional_origins = os.environ.get('ADDITIONAL_ALLOWED_ORIGINS')
    if additional_origins:
        origins.add([origin.strip() for origin in additional_origins.split(',')])

    # Remove duplicates and empty strings
    return list(set(filter(None, origins)))

# Configure CORS with specific settings
app = cors(
    app,
    allow_origin= configure_cors_origins(),
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    allow_credentials=True,
    max_age=86400,
    expose_headers=["Content-Type", "Authorization"]
)

@app.after_request
async def after_request(response):
    """Add CORS headers to all responses."""
    origin = request.headers.get('Origin')
    if origin and origin in configure_cors_origins():
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/api/documents', methods=['GET'])
async def get_documents():
    """Get all documents."""
    try:
        async with app.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, title, author, journal_publisher, publication_year,
                       page_length, word_count, thesis, issue, summary,
                       category, field, influences, hashtags, file_path,
                       file_type, created_at
                FROM documents
                ORDER BY created_at DESC
            """)

        documents = [{
            'id': row['id'],
            'title': row['title'],
            'author': row['author'],
            'journal_publisher': row['journal_publisher'],
            'publication_year': row['publication_year'],
            'page_length': row['page_length'],
            'word_count': row['word_count'],
            'thesis': row['thesis'],
            'issue': row['issue'],
            'summary': row['summary'],
            'category': row['category'],
            'field': row['field'],
            'influences': row['influences'],
            'hashtags': row['hashtags'],
            'file_path': row['file_path'],
            'file_type': row['file_type'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None
        } for row in rows]

        return jsonify(documents)
    except asyncpg.PostgresError as e:
        logger.error("Database error fetching documents: %s", str(e))
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error("Error fetching documents: %s", str(e))
        return jsonify({'error': 'Failed to fetch documents'}), 500

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
    except asyncpg.PostgresError as e:
        logger.error("Database error fetching inventory: %s", str(e))
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error("Error fetching inventory: %s", str(e))
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
        'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt', 'rtf'
    }

@app.route('/process-files', methods=['POST'])
async def process_files():
    """Process uploaded files."""
    try:
        files = await request.files
        uploaded_files = {'images': [], 'documents': []}
        
        for file in files.getlist('files'):
            if not file or not allowed_file(file.filename):
                return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400

            # Determine file type
            ext = os.path.splitext(file.filename)[1].lower()
            file_type = 'images' if ext in {'.png', '.jpg', '.jpeg', '.gif', '.webp'} else 'documents'
            
            if os.path.exists(os.path.join(UPLOADS_DIR, file.filename)):
                return jsonify({
                    'status': 'error',
                    'message': f'File {file.filename} already exists'
                }), 400
            
            filename = os.path.join(UPLOADS_DIR, file.filename)
            await file.save(filename)
            uploaded_files[file_type].append(filename)

        if not uploaded_files['images'] and not uploaded_files['documents']:
            return jsonify({'status': 'error', 'message': 'No valid files uploaded'}), 400

        form = await request.form
        instruction = form.get('instruction', os.getenv("USER_INSTRUCTIONS", "Catalog, categorize and Describe the item."))
        
        async with app.db_pool.acquire() as conn:
            # Process images if any
            if uploaded_files['images']:
                await process_uploaded_images(instruction, conn)
            
            # Process documents if any
            if uploaded_files['documents']:
                batch_dir = os.path.join(DATA_DIR, 'documents', datetime.now().strftime("%Y%m%d-%H%M%S"))
                os.makedirs(batch_dir, exist_ok=True)
                for doc_path in uploaded_files['documents']:
                    await process_document(doc_path, batch_dir, conn)
            
        return jsonify({'status': 'success', 'message': 'Files processed successfully.'})
    except IOError as e:
        logger.error("File system error: %s", str(e))
        return jsonify({'status': 'error', 'message': 'File system error'}, 500)
    except Exception as e:
        logger.error("Error processing files: %s", str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500

def maintain_inventory_folders(max_folders: int = 10) -> bool:
    """Maintain inventory folders, keeping only the latest N folders."""
    try:
        folders = [f for f in os.listdir(INVENTORY_IMAGES_DIR) 
                  if os.path.isdir(os.path.join(INVENTORY_IMAGES_DIR, f))]
        folders.sort(reverse=True)
        
        for folder in folders[max_folders:]:
            shutil.rmtree(os.path.join(INVENTORY_IMAGES_DIR, folder))
            logger.info("Removed old inventory folder: %s", folder)
        return True
    except OSError as e:
        logger.error("Error maintaining inventory folders: %s", str(e))
        return False

@app.route('/export-inventory', methods=['GET'])
async def export_inventory():
    """Export inventory to CSV."""
    try:
        async with app.db_pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM products")

        output = io.StringIO()
        writer = csv.writer(output)
        headers = ['id', 'name', 'description', 'image_url', 'category', 
                  'material', 'color', 'dimensions', 'origin_source', 
                  'import_cost', 'retail_price', 'key_tags']
        
        writer.writerow(headers)
        for row in rows:
            writer.writerow([row[header] for header in headers])

        os.makedirs(EXPORTS_DIR, exist_ok=True)
        export_path = os.path.join(EXPORTS_DIR, 
                                 f'inventory_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
        
        with open(export_path, 'w', encoding='utf-8', newline='') as f:
            f.write(output.getvalue())

        return jsonify({'status': 'success', 'message': f'Inventory exported to {export_path}'})
    except asyncpg.PostgresError as e:
        logger.error("Database error exporting inventory: %s", str(e))
        return jsonify({'error': 'Database error'}), 500
    except IOError as e:
        logger.error("File system error: %s", str(e))
        return jsonify({'error': 'File system error'}), 500
    except Exception as e:
        logger.error("Error exporting inventory: %s", str(e))
        return jsonify({'error': 'Failed to export inventory'}), 500

@app.route('/images/<path:filename>')
async def serve_image(filename):
    """Serve image files."""
    try:
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        ext = os.path.splitext(filename)[1].lower()
        mime_type = mime_types.get(ext, 'image/jpeg')

        image_path = os.path.join(INVENTORY_IMAGES_DIR, filename)
        if not os.path.abspath(image_path).startswith(os.path.abspath(INVENTORY_IMAGES_DIR)):
            return jsonify({"error": "Invalid path"}), 400

        return await send_file(image_path, mimetype=mime_type)
    except FileNotFoundError:
        logger.error("Image not found: %s", filename)
        return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        logger.error("Error serving image %s: %s", filename, str(e))
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/api/inventory/reset', methods=['POST'])
async def reset_inventory():
    """Reset inventory database and clean up associated files."""
    try:
        data = await request.get_json()
        table_name = data.get('table_name', 'products')
        
        table_uploads_dir = os.path.join(UPLOADS_DIR, f'{table_name}_images')
        os.makedirs(table_uploads_dir, exist_ok=True)
        
        async with app.db_pool.acquire() as conn:
            await conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
            await initialize_database()  # Use main.py's initialize_database function
        
        if os.path.exists(INVENTORY_IMAGES_DIR):
            shutil.rmtree(INVENTORY_IMAGES_DIR)
            os.makedirs(INVENTORY_IMAGES_DIR)
        
        return jsonify({
            'status': 'success',
            'message': f'Inventory reset successful. New table "{table_name}" created.'
        })
    except asyncpg.PostgresError as e:
        logger.error("Database error resetting inventory: %s", str(e))
        return jsonify({'error': 'Database error'}), 500
    except OSError as e:
        logger.error("File system error: %s", str(e))
        return jsonify({'error': 'File system error'}), 500
    except Exception as e:
        logger.error("Error resetting inventory: %s", str(e))
        return jsonify({'error': 'Failed to reset inventory'}), 500

@app.route('/api/search', methods=['POST'])
async def search():
    """Search documents using vector similarity."""
    try:
        data = await request.get_json()
        query = data.get('query')
        limit = data.get('limit', 5)

        if not query:
            return jsonify({"error": "Search query is required"}), 400

        async with app.db_pool.acquire() as conn:
            results = await search_documents(query, conn, limit)
            return jsonify({"results": results})
    except Exception as e:
        logger.error("Error searching documents: %s", str(e))
        return jsonify({"error": "Search failed"}), 500

@app.before_serving
async def startup():
    """Initialize application before serving."""
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        os.makedirs(INVENTORY_IMAGES_DIR, exist_ok=True)
        os.makedirs(EXPORTS_DIR, exist_ok=True)
        
        app.db_pool = await get_db_pool()
        await initialize_database()
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error("Error during startup: %s", str(e))
        raise

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)