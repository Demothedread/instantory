# Add these imports at the top with existing imports
from typing import List, Dict, Any, Optional
from quart import Quart, jsonify, request, send_file
from quart_cors import cors
import asyncpg
import subprocess
import logging
import os
import shutil
from datetime import datetime
import csv
import io
import urllib.parse as urlparse
import asyncio
from dotenv import load_dotenv
from config import DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR
from openai import AsyncOpenAI

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Add this after the existing imports but before app initialization
openai_client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    timeout=60.0
)

app = Quart(__name__)

def configure_cors_origins() -> List[str]:
    database_url = os.environ.get('DATABASE_URL', os.getenv('DATABASE_URL'))
    if database_url:
        parsed_url = urlparse.urlparse(database_url)
        db_host = parsed_url.hostname
    else:
        db_host = os.environ.get('DB_HOST', 'localhost')
    vercel_url = os.environ.get('VERCEL_URL')
    if vercel_url:
        if not vercel_url.startswith('https://'):
            vercel_url = f'https://{vercel_url}'

    return [
        vercel_url,
        'https://instantory.vercel.app',
        'https://instantory-api.onrender.com',
        'https://instantory-backend.onrender.com',
        'https://instantory-dhj0hu4yd-demothedreads-projects.vercel.app',  # Added Vercel preview URL
        f'https://{db_host}',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ]

app = cors(app, allow_origin=configure_cors_origins())

# Rest of your code...

# Add this function to your code
async def generate_image_description(image_path: str) -> str:
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this image in detail."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64.b64encode(open(image_path, 'rb').read()).decode()}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=300,
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error generating image description: {e}")
        return ""

# Modify the add_item function to include image description
@app.route('/api/add_item', methods=['POST'])
async def add_item():
    data = await request.form
    item_name = data.get('item_name')
    quantity = data.get('quantity')
    price = data.get('price')
    category = data.get('category')
    image = request.files.get('image')

    if not item_name or not quantity or not price or not category:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        quantity = int(quantity)
        price = float(price)
    except ValueError:
        return jsonify({'error': 'Invalid quantity or price'}), 400

    if image:
        image_path = os.path.join(INVENTORY_IMAGES_DIR, image.filename)
        image.save(image_path)
        image_description = await generate_image_description(image_path)
    else:
        image_path = None
        image_description = ""

    try:
        async with app.db_pool.acquire() as connection:
            await connection.execute(
                'INSERT INTO inventory (item_name, quantity, price, category, image_path, image_description) VALUES ($1, $2, $3, $4, $5, $6)',
                item_name, quantity, price, category, image_path, image_description
            )
        return jsonify({'message': 'Item added successfully'}), 201
    except Exception as e:
        logging.error(f"Error adding item: {e}")
        return jsonify({'error': 'Failed to add item'}), 500

# Rest of your code...

if __name__ == '__main__':
    app.run(debug=True)

    CORS_ORIGIN = [
        'https://instantory.vercel.app',
        'https://instantory-api.onrender.com',
        'https://instantory-backend.onrender.com',
        'https://instantory-dhj0hu4yd-demothedreads-projects.vercel.app',  # Added Vercel preview URL
        f'https://{db_host}',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ]

    # Add any environment-specific origins
    env_vars = ['CORS_ORIGIN', 'PUBLIC_BACKEND_URL', 'REACT_APP_BACKEND_URL', 'VERCEL_URL']
    for var in env_vars:
        if os.environ.get(var):
            value = os.environ.get(var)
            if value and value.startswith('http'):
                if value not in CORS_ORIGIN:
                    CORS_ORIGIN.append(value)
            else:
                # Handle Vercel deployment URLs
                if var == 'VERCEL_URL' not in CORS_ORIGIN:
                        CORS_ORIGIN.append('VERCEL_URL')

    return CORS_ORIGIN

CORS_ORIGIN = configure_cors_origins()

# Apply CORS configuration with expanded settings for production
app = cors(
    app,
    allow_origin=CORS_ORIGIN,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "Access-Control-Allow-Headers"],
    allow_credentials=True,
    max_age=86400,
    expose_headers=["Content-Length", "X-Request-ID", "Access-Control-Allow-Origin"]
)

logging.basicConfig(level=logging.DEBUG)

# Define User_Instructions with a default value
User_Instructions = os.environ.get("USER_INSTRUCTIONS", "Catalog, categorize and Describe the item.")

async def get_db_pool() -> asyncpg.Pool:
    """Get PostgreSQL connection pool from environment variables or URL."""
    try:
        # Get database configuration from environment variables
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            database_url = os.getenv('DATABASE_URL')
            if not database_url:
                raise ValueError("DATABASE_URL environment variable is required")

        # Parse the database URL
        parsed = urlparse.urlparse(database_url)
        
        # Create the connection pool with proper SSL configuration for Render
        pool = await asyncpg.create_pool(
            user=os.environ.get('DB_USER', parsed.username),
            password=parsed.password,
            database=os.environ.get('DB_NAME', parsed.path[1:] if parsed.path else 'instantory_sql'),
            host=os.environ.get('DB_HOST', parsed.hostname),
            port=int(os.environ.get('DB_PORT', parsed.port or 5432)),
            ssl='require',  # Required for Render PostgreSQL
            command_timeout=100,
            min_size=1,
            max_size=10
        )
        
        # Test the connection
        async with pool.acquire() as conn:
            await conn.execute('SELECT 1')
        return pool
    except Exception as e:
        logging.error(f"Database connection error: {e}")
        raise e

async def create_embedding(text: str) -> Optional[List[float]]:
    """Create an embedding for the given text using OpenAI's API."""
    try:
        response = await openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logging.error(f"Error creating embedding: {e}")
        return None

@app.after_request
async def after_request(response):
    """Add CORS headers to all responses."""
    origin = request.headers.get('Origin')
    if origin and origin in CORS_ORIGIN:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, Origin, X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET, PUT, POST, DELETE, OPTIONS, PATCH'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Length, X-Request-ID'
    return response

@app.route('/cors-preflight', methods=['OPTIONS'])
async def handle_cors_preflight():
    """Handle CORS preflight requests."""
    response = await app.make_default_options_response()
    origin = request.headers.get('Origin')
    if origin and origin in CORS_ORIGIN:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Accept,Origin,X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'
    return response

def convert_to_relative_path(absolute_path: Optional[str]) -> Optional[str]:
    """Convert absolute image path to relative path."""
    if not absolute_path:
        return None
    # Remove any '../' from the path
    path_parts = absolute_path.split('data/images/inventory/')
    if len(path_parts) > 1:
        return path_parts[1]
    return absolute_path

@app.route('/api/documents', methods=['GET', 'OPTIONS'])
async def get_documents():
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, title, author, journal_publisher, publication_year,
                       page_length, word_count, thesis, issue, summary,
                       category, field, influences, hashtags, file_path,
                       file_type, created_at
                FROM documents
                ORDER BY created_at DESC
            """)

        documents = []
        for row in rows:
            documents.append({
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
            })

        await pool.close()
        app.logger.info("Fetched %d documents from the database", len(documents))
        return jsonify(documents)
    except Exception as e:
        app.logger.error("Database error: %s", e)
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/api/inventory', methods=['GET', 'OPTIONS'])
async def get_inventory():
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM products")

        inventory = []
        for row in rows:
            inventory.append({
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
            })

        await pool.close()
        app.logger.info("Fetched %d items from the database", len(inventory))
        return jsonify(inventory)
    except Exception as e:
        app.logger.error("Database error: %s", e)
        return jsonify({"error": "Internal Server Error"}), 500   
                                 
################################

@app.route('/process-files', methods=['POST', 'OPTIONS'])
async def process_files():
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        files = await request.files
        uploaded_files = []
        for file in files.getlist('files'):
            if file and allowed_file(file.filename):
                if check_file_exists(file.filename):
                    return jsonify({
                        'status': 'error', 
                        'message': f'File {file.filename} already exists in uploads directory'
                    }), 400
                
                filename = os.path.join(UPLOADS_DIR, file.filename)
                await file.save(filename)
                uploaded_files.append(filename)
            else:
                return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400

        if not uploaded_files:
            return jsonify({'status': 'error', 'message': 'No valid files uploaded'}), 400

        app.logger.info("Received %d files for processing", len(uploaded_files))

        form = await request.form
        instruction = form.get('instruction', User_Instructions)
        app.logger.debug("Received instruction: %s", instruction)

        main_script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'main.py')
        
        # Run the main.py script with the correct arguments
        process = await asyncio.create_subprocess_exec(
            'python',
            main_script_path,
            '--process-files',
            '--instruction', instruction,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        maintain_inventory_folders()
        
        if stdout:
            app.logger.info("Main script output: %s", stdout.decode())
        if stderr:
            app.logger.warning("Main script stderr: %s", stderr.decode())
            
        return jsonify({'status': 'success', 'message': 'Files processed successfully.'})

    except Exception as e:
        app.logger.error("Unexpected error: %s", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500

def maintain_inventory_folders(max_folders: int = 10) -> bool:
    """Keep only the latest N folders in the inventory directory."""
    try:
        folders = [f for f in os.listdir(INVENTORY_IMAGES_DIR) 
                  if os.path.isdir(os.path.join(INVENTORY_IMAGES_DIR, f))]
        folders.sort(reverse=True)
        
        for folder in folders[max_folders:]:
            folder_path = os.path.join(INVENTORY_IMAGES_DIR, folder)
            shutil.rmtree(folder_path)
            app.logger.info(f"Removed old inventory folder: {folder}")
    except Exception as e:
        app.logger.error(f"Error maintaining inventory folders: {e}")
        return False
    return True

def check_file_exists(filename: str) -> bool:
    """Check if a file with the same name exists in uploads directory."""
    return os.path.exists(os.path.join(UPLOADS_DIR, filename))

def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt', 'rtf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

async def add_vector_support() -> None:
    """Add vector support to documents table if needed."""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # First create the extension if it doesn't exist
            await conn.execute('CREATE EXTENSION IF NOT EXISTS vector')
            
            # Create documents table with vector support if it doesn't exist
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    title TEXT,
                    author TEXT,
                    journal_publisher TEXT,
                    publication_year INTEGER,
                    page_length INTEGER,
                    word_count INTEGER,
                    thesis TEXT,
                    issue TEXT,
                    summary TEXT,
                    category TEXT,
                    field TEXT,
                    influences TEXT,
                    hashtags TEXT,
                    file_path TEXT UNIQUE,
                    file_type TEXT,
                    full_text TEXT,
                    content_embedding vector(1536),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Create document chunks table for granular search
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
                    chunk_text TEXT,
                    chunk_index INTEGER,
                    chunk_embedding vector(1536),
                    context TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

        await pool.close()
    except Exception as e:
        logging.error(f"Error adding vector support: {e}")
        raise

@app.route('/api/documents/search', methods=['POST', 'OPTIONS'])
async def search_documents():
    """Search documents using vector similarity."""
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        data = await request.get_json()
        query = data.get('query')
        
        if not query:
            return jsonify({"error": "Search query is required"}), 400

        # Create embedding for the search query
        query_embedding = await create_embedding(query)
        if not query_embedding:
            return jsonify({"error": "Failed to create search embedding"}), 500

        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Search both document-level and chunk-level matches
            results = await conn.fetch('''
                WITH document_scores AS (
                    SELECT 
                        d.id,
                        d.title,
                        d.summary,
                        d.category,
                        d.field,
                        1 - (d.content_embedding <=> $1::vector) as doc_similarity,
                        array_agg(json_build_object(
                            'text', dc.chunk_text,
                            'context', dc.context,
                            'similarity', 1 - (dc.chunk_embedding <=> $1::vector)
                        )) as chunks
                    FROM documents d
                    LEFT JOIN document_chunks dc ON d.id = dc.document_id
                    WHERE d.content_embedding IS NOT NULL
                    GROUP BY d.id, d.title, d.summary, d.category, d.field, d.content_embedding
                    ORDER BY doc_similarity DESC
                    LIMIT $2
                )
                SELECT 
                    id, title, summary, category, field,
                    doc_similarity as similarity,
                    chunks
                FROM document_scores
            ''', query_embedding, 5)

            # Format the results
            search_results = []
            for row in results:
                search_results.append({
                    'id': row['id'],
                    'title': row['title'],
                    'summary': row['summary'],
                    'category': row['category'],
                    'field': row['field'],
                    'similarity': float(row['similarity']),
                    'relevant_chunks': row['chunks']
                })

        await pool.close()
        return jsonify({"results": search_results})

    except Exception as e:
        logging.error(f"Error searching documents: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/export-inventory', methods=['GET', 'OPTIONS'])
async def export_inventory():
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM products")
        await pool.close()

        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = ['id', 'name', 'description', 'image_url', 'category', 
                  'material', 'color', 'dimensions', 'origin_source', 
                  'import_cost', 'retail_price', 'key_tags']
        writer.writerow(headers)
        
        # Write data
        for row in rows:
            writer.writerow([row[header] for header in headers])

        os.makedirs(EXPORTS_DIR, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        export_path = os.path.join(EXPORTS_DIR, f'inventory_export_{timestamp}.csv')
        
        with open(export_path, 'w', newline='') as f:
            f.write(output.getvalue())

        return jsonify({'status': 'success', 'message': f'Inventory exported to {export_path}'})
    except Exception as e:
        app.logger.error("Database error: %s", e)
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/images/<path:filename>', methods=['GET', 'OPTIONS'])
async def serve_image(filename):
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        # Provide the correct MIME type based on the file extension
        mime_type = 'image/jpeg'  # Default MIME type
        if filename.endswith('.png'):
            mime_type = 'image/png'
        elif filename.endswith('.gif'):
            mime_type = 'image/gif'
        elif filename.endswith('.webp'):
            mime_type = 'image/webp'

        image_path = os.path.join(INVENTORY_IMAGES_DIR, filename)
        
        if not os.path.abspath(image_path).startswith(os.path.abspath(INVENTORY_IMAGES_DIR)):
            app.logger.error("Attempted path traversal: %s", filename)
            return jsonify({"error": "Invalid path"}), 400

        return await send_file(image_path, mimetype=mime_type)
    except FileNotFoundError:
        app.logger.error("Image not found: %s", filename)
        return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        app.logger.error("Error serving image %s: %s", filename, str(e))
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/api/inventory/reset', methods=['POST', 'OPTIONS'])
async def reset_inventory():
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        data = await request.get_json()
        table_name = data.get('table_name', 'products')
        
        table_uploads_dir = os.path.join(UPLOADS_DIR, f'{table_name}_images')
        os.makedirs(table_uploads_dir, exist_ok=True)
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
            
            await conn.execute(f'''
                CREATE TABLE "{table_name}" (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    image_url TEXT UNIQUE,
                    category TEXT,
                    material TEXT,
                    color TEXT,
                    dimensions TEXT,
                    origin_source TEXT,
                    import_cost REAL,
                    retail_price REAL,
                    key_tags TEXT
                )
            ''')
        
        await pool.close()
        
        if os.path.exists(INVENTORY_IMAGES_DIR):
            shutil.rmtree(INVENTORY_IMAGES_DIR)
            os.makedirs(INVENTORY_IMAGES_DIR)
        
        return jsonify({
            'status': 'success',
            'message': f'Inventory reset successful. New table "{table_name}" created.'
        })
        
    except Exception as e:
        app.logger.error("Error during inventory reset: %s", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500

async def initialize_database() -> None:
    """Initialize the database and create required tables."""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    image_url TEXT UNIQUE,
                    category TEXT,
                    material TEXT,
                    color TEXT,
                    dimensions TEXT,
                    origin_source TEXT,
                    import_cost REAL,
                    retail_price REAL,
                    key_tags TEXT
                )
            ''')
        await pool.close()
        app.logger.info("Database initialized successfully")
    except Exception as e:
        app.logger.error("Error initializing database: %s", e)
        raise

@app.before_serving
async def startup():
    """Initialize required directories and database before serving."""
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(INVENTORY_IMAGES_DIR, exist_ok=True)
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    
    await initialize_database()
    await add_vector_support()  # Add vector support during startup

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
