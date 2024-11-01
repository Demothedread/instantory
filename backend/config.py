import os

# Set BASE_DIR to the root project directory (one level up from backend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_NAME = os.path.join(BASE_DIR, 'database.sqlite3')
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR = os.path.join(DATA_DIR, 'images', 'uploads')
INVENTORY_IMAGES_DIR = os.path.join(DATA_DIR, 'images', 'inventory')
TEMP_DIR = os.path.join(DATA_DIR, 'temp')
EXPORTS_DIR = os.path.join(DATA_DIR, 'exports')

# Create directories if they don't exist
for directory in [DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR]:
    os.makedirs(directory, exist_ok=True)
