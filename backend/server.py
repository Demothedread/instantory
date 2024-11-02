from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import sqlite3
import subprocess
import logging
import os
import shutil
from datetime import datetime
import pandas as pd
from whitenoise import WhiteNoise  # Add for static file serving
from config import DB_NAME, DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR

app = Flask(__name__)
# Configure static directory relative to the backend folder
static_dir = os.path.join(os.path.dirname(__file__), 'static')
os.makedirs(static_dir, exist_ok=True)
# Add whitenoise for static file serving in production
app.wsgi_app = WhiteNoise(app.wsgi_app, root=static_dir)

# Enable CORS for all routes with proper configuration
CORS_ORIGIN = os.environ.get('CORS_ORIGIN', 'https://instatory.vercel.app')
CORS(app, resources={
    r"/*": {
        "origins": [CORS_ORIGIN],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

logging.basicConfig(level=logging.DEBUG)

# Define User_Instructions with a default value
User_Instructions =os.environ.get("USER_INSTRUCTIONS", "Catalog, categorize and Describe the item.")

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
def get_inventory():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products")
        rows = cursor.fetchall()
        conn.close()

        inventory = []
        for row in rows:
            inventory.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'image_url': convert_to_relative_path(row[3]),
                'category': row[4],
                'material': row[5],
                'color': row[6],
                'dimensions': row[7],
                'origin_source': row[8],
                'import_cost': row[9],
                'retail_price': row[10],
                'key_tags': row[11]
            })

        app.logger.info("Fetched %d items from the database", len(inventory))
        return jsonify(inventory)
    except sqlite3.Error as e:
        app.logger.error("Database error: %s", e)
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/process-images', methods=['POST'])
def process_images():
    try:
        # Save uploaded files and validate
        uploaded_files = []
        for file in request.files.getlist('images'):
            if file and allowed_file(file.filename):
                # Check if file already exists
                if check_file_exists(file.filename):
                    return jsonify({
                        'status': 'error', 
                        'message': f'File {file.filename} already exists in uploads directory'
                    }), 400
                
                filename = os.path.join(UPLOADS_DIR, file.filename)
                file.save(filename)
                uploaded_files.append(filename)
            else:
                return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400

        if not uploaded_files:
            return jsonify({'status': 'error', 'message': 'No valid images uploaded'}), 400

        app.logger.info("Received %d images for processing", len(uploaded_files))

        instruction = request.form.get('instruction', User_Instructions)
        app.logger.debug("Received instruction: %s", instruction)

        # Get the absolute path to main.py
        main_script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'main.py')
        
        # Run the main.py script with the correct arguments
        result = subprocess.run(
            [
                'python',
                main_script_path,
                '--process-images',
                '--instruction', instruction
            ],
            check=True,
            capture_output=True,
            text=True
        )
        
        maintain_inventory_folders()
        
        app.logger.info("Main script output: %s", result.stdout)
        if result.stderr:
            app.logger.warning("Main script stderr: %s", result.stderr)
            
        return jsonify({'status': 'success', 'message': 'Images processed successfully.'})

    except subprocess.CalledProcessError as e:
        app.logger.error("Error processing images: %s", e)
        app.logger.error("Error output: %s", e.stderr)
        return jsonify({'status': 'error', 'message': str(e)}), 500
    except Exception as e:
        app.logger.error("Unexpected error: %s", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/inventory/reset', methods=['POST'])
def reset_inventory():
    """Reset the inventory by clearing the database and optionally creating a new table."""
    try:
        table_name = request.json.get('table_name', 'products')
        
        # Create new uploads folder for the table
        table_uploads_dir = os.path.join(UPLOADS_DIR, f'{table_name}_images')
        os.makedirs(table_uploads_dir, exist_ok=True)
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        # Drop existing table if it exists
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        
        cursor.execute(f'''
            CREATE TABLE {table_name} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        
        conn.commit()
        conn.close()
        
        # Clear inventory images
        if os.path.exists(INVENTORY_IMAGES_DIR):
            shutil.rmtree(INVENTORY_IMAGES_DIR)
            os.makedirs(INVENTORY_IMAGES_DIR)
        
        return jsonify({
            'status': 'success',
            'message': f'Inventory reset successful. New table "{table_name}" created.'
        })
        
    except sqlite3.Error as e:
        app.logger.error("Database error during reset: %s", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500
    except Exception as e:
        app.logger.error("Error during inventory reset: %s", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'webp'}

@app.route('/export-inventory', methods=['GET'])
def export_inventory():
    try:
        conn = sqlite3.connect(DB_NAME)
        df = pd.read_sql_query("SELECT * FROM products", conn)
        conn.close()

        os.makedirs(EXPORTS_DIR, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        export_path = os.path.join(EXPORTS_DIR, f'inventory_export_{timestamp}.csv')
        df.to_csv(export_path, index=False)

        return jsonify({'status': 'success', 'message': f'Inventory exported to {export_path}'})
    except sqlite3.Error as e:
        app.logger.error("Database error: %s", e)
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/images/<path:filename>')
def serve_image(filename):
    try:
        # Provide the correct MIME type based on the file extension
        mime_type = 'image/jpeg'  # Default MIME type
        if filename.endswith('.png'):
            mime_type = 'image/png'
        elif filename.endswith('.gif'):
            mime_type = 'image/gif'
        elif filename.endswith('.webp'):
            mime_type = 'image/webp'

        # Construct the full path to the image
        image_path = os.path.join(INVENTORY_IMAGES_DIR, filename)
        
        # Ensure the path is within the allowed directory
        if not os.path.abspath(image_path).startswith(os.path.abspath(INVENTORY_IMAGES_DIR)):
            app.logger.error("Attempted path traversal: %s", filename)
            return jsonify({"error": "Invalid path"}), 400

        return send_file(image_path, mimetype=mime_type)
    except FileNotFoundError:
        app.logger.error("Image not found: %s", filename)
        return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        app.logger.error("Error serving image %s: %s", filename, str(e))
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    # Create required directories if they don't exist
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(INVENTORY_IMAGES_DIR, exist_ok=True)
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    
    # Initialize database
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    conn.commit()
    conn.close()
    
    # Get port from environment variable with a default of 10000
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
