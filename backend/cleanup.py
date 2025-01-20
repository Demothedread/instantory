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
from dotenv import load_dotenv
from openai import AsyncOpenAI
from PIL import Image
from quart import Quart, jsonify, request, send_file, make_response
from quart_cors import cors

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'instantory.log'))
    ]
)
logger = logging.getLogger(__name__)

# Set project root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

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

def load_env_variables():
    """Load environment variables from .env file."""
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)

load_env_variables()

# Directory paths
DATA_DIR = Path(os.getenv('DATA_DIR', os.path.join(os.path.dirname(__file__), 'data')))
PATHS = {
    'UPLOADS_DIR': DATA_DIR / 'uploads',
    'INVENTORY_IMAGES_DIR': DATA_DIR / 'images' / 'inventory',
    'EXPORTS_DIR': DATA_DIR / 'exports',
    'DOCUMENT_DIRECTORY': DATA_DIR / 'documents'
}

for directory in PATHS.values():
    directory.mkdir(parents=True, exist_ok=True)

class TaskManager:
    """Manages background tasks with TTL."""
    def __init__(self, ttl_seconds: int = 86400):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds

    def add_task(self, task_id: str) -> None:
        self.tasks[task_id] = {
            'status': 'queued',
            'progress': 0,
            'message': 'Task queued',
            'created_at': asyncio.get_running_loop().time()
        }

    def update_task(self, task_id: str, **kwargs) -> None:
        if task_id in self.tasks:
            self.tasks[task_id].update(kwargs)

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        task = self.tasks.get(task_id)
        if task and asyncio.get_running_loop().time() - task['created_at'] <= self.ttl_seconds:
            return task
        self.tasks.pop(task_id, None)
        return None

    def cleanup(self) -> None:
        current_time = asyncio.get_running_loop().time()
        expired_tasks = [task_id for task_id, task in self.tasks.items()
                         if current_time - task['created_at'] > self.ttl_seconds]
        for task_id in expired_tasks:
            del self.tasks[task_id]

task_manager = TaskManager()

@asynccontextmanager
async def get_db_pool():
    """Create and manage PostgreSQL connection pool."""
    pool = None
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        url = urlparse.urlparse(database_url)
        pool = await asyncpg.create_pool(
            user=url.username,
            password=url.password,
            database=url.path[1:],
            host=url.hostname,
            port=url.port,
            ssl='require',
            min_size=1,
            max_size=10
        )
        yield pool
    finally:
        if pool:
            await pool.close()

client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize Quart app with CORS
app = Quart(__name__)
cors(app, allow_origin=CORSConfig.get_origins(), allow_credentials=True)

@app.before_serving
async def startup():
    try:
        async with get_db_pool() as pool:
            await initialize_database(pool)
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.after_request
async def after_request(response):
    """Add security headers and CORS to all responses."""
    response.headers.update({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Vary': 'Origin'
    })
    origin = request.headers.get('Origin')
    if origin in CORSConfig.get_origins():
        response.headers['Access-Control-Allow-Origin'] = origin
    return response

@app.route('/processing-status/<task_id>', methods=['GET'])
async def processing_status(task_id: str):
    """Check the status of a background task."""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Invalid task ID'}), 404
    return jsonify(task)

@app.before_serving
async def setup_task_cleanup():
    """Periodic cleanup of expired tasks."""
    async def cleanup_loop():
        while True:
            await asyncio.sleep(3600)
            task_manager.cleanup()
    asyncio.create_task(cleanup_loop())