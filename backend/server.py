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
from whitenoise import WhiteNoise
import urllib.parse as urlparse
import asyncio
from config import DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR

app = Quart(__name__)

# Configure CORS properly
CORS_ORIGIN = os.environ.get('CORS_ORIGIN', 'https://instantory.vercel.app')
app = cors(app, 
          allow_origin=[CORS_ORIGIN],
          allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
          allow_headers=["Content-Type", "Authorization", "Accept"],
          allow_credentials=True,
          max_age=3600)

# Configure static directory relative to the backend folder
static_dir = os.path.join(os.path.dirname(__file__), 'static')
os.makedirs(static_dir, exist_ok=True)
# Add whitenoise for static file serving in production
app.asgi_app = WhiteNoise(app.asgi_app, root=static_dir)

logging.basicConfig(level=logging.DEBUG)

# Define User_Instructions with a default value
User_Instructions = os.environ.get("USER_INSTRUCTIONS", "Catalog, categorize and Describe the item.")

@app.after_request
async def after_request(response):
    """Add CORS headers to all responses."""
    response.headers.add('Access-Control-Allow-Origin', CORS_ORIGIN)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/cors-preflight', methods=['OPTIONS'])
async def handle_cors_preflight():
    """Handle CORS preflight requests."""
    response = await app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', CORS_ORIGIN)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

async def get_db_pool():
    """Get PostgreSQL connection pool from environment variables or URL."""
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Parse the URL
        url = urlparse.urlparse(database_url)
        return await asyncpg.create_pool(
            user=url.username,
            password=url.password,
            database=url.path[1:],
            host=url.hostname,
            port=url.port,
            ssl='require'  # Required for Render PostgreSQL
        )
    else:
        # Fallback to individual environment variables
        return await asyncpg.create_pool(
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            ssl='require'  # Required for Render PostgreSQL
        )

def maintain_inventory_folders(max_folders=10):
    """Keep only the latest N folders in the inventory directory."""
    try:
        folders = [f for f in os.listdir(INVENTORY_IMAGES_DIR) 
                  if os.path.isdir(os.path.join(INVENTORY_IMAGES_DIR, f))]
        folders.sort(reverse=True)  # Sort in descending order (newest first)
        
        # Remove excess folders
        for folder in folders[max_folders:]:
            folder_path = os.path.join(INVENTORY_IMAGES_DIR, folder)
            shutil.rmtree(folder_path)
            app.logger.info(f"Removed old inventory folder: {folder}")
    except Exception as e:
        app.logger.error(f"Error maintaining inventory folders: {e}")

def check_file_exists(filename):
    """Check if a file with the same name exists in uploads directory."""
    return os.path.exists(os.path.join(UPLOADS_DIR, filename))

def convert_to_relative_path(absolute_path):
    """Convert absolute image path to relative path."""
    if not absolute_path:
        return None
    # Remove any '../' from the path
    path_parts = absolute_path.split('data/images/inventory/')
    if len(path_parts) > 1:
        return path_parts[1]
    return absolute_path

@app.route('/api/inventory', methods=['GET'])
async def get_inventory():
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

@app.route('/process-images', methods=['POST', 'OPTIONS'])
async def process_images():
    if request.method == 'OPTIONS':
        return await handle_cors_preflight()

    try:
        files = await request.files
        uploaded_files = []
        for file in files.getlist('images'):
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
            return jsonify({'status': 'error', 'message': 'No valid images uploaded'}), 400

        app.logger.info("Received %d images for processing", len(uploaded_files))

        form = await request.form
        instruction = form.get('instruction', User_Instructions)
        app.logger.debug("Received instruction: %s", instruction)

        main_script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'main.py')
        
        # Run the main.py script with the correct arguments
        process = await asyncio.create_subprocess_exec(
            'python',
            main_script_path,
            '--process-images',
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
            
        return jsonify({'status': 'success', 'message': 'Images processed successfully.'})

    except Exception as e:
        app.logger.error("Unexpected error: %s", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500

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

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'webp'}

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

async def initialize_database():
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

if __name__ == '__main__':
    # Get port from environment variable with a default of 10000
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
