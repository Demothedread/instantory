from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'

# Specific data directories
UPLOADS_DIR = DATA_DIR / 'uploads'
INVENTORY_IMAGES_DIR = DATA_DIR / 'images' / 'inventory'
TEMP_DIR = DATA_DIR / 'temp'
EXPORTS_DIR = DATA_DIR / 'exports'
DOCUMENT_DIRECTORY = DATA_DIR / 'documents'

# Create directories if they don't exist
for directory in [DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR, DOCUMENT_DIRECTORY]:
    directory.mkdir(parents=True, exist_ok=True)
    
# Additional configuration
PROVIDE_AUTOMATIC_OPTIONS = True  # Add this line
