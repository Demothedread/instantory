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
    process_document,
    DOCUMENT_DIRECTORY
)

# Load environment variables from .env if it exists
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Import configuration
try:
    from config import UPLOADS_DIR, INVENTORY_IMAGES_DIR, EXPORTS_DIR, DATA_DIR
except ImportError:
    print("Warning: Unable to import config.py. Falling back to environment variables.")
    UPLOADS_DIR = os.environ.get('UPLOADS_DIR', './uploads')
    INVENTORY_IMAGES_DIR = os.environ.get('INVENTORY_IMAGES_DIR', './inventory_images')
    EXPORTS_DIR = os.environ.get('EXPORTS_DIR', './exports')
    DATA_DIR = os.environ.get('DATA_DIR', './data')

# Ensure directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(INVENTORY_IMAGES_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DOCUMENT_DIRECTORY, exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
        "Content-Length"  # Added Content-Length header
    ],
    allow_credentials=True,
    max_age=86400,
    expose_headers=["Content-Type", "Authorization", "Content-Length"]  # Added Content-Length
)

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

[Rest of the file content remains the same]
