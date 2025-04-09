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
from .config.security import CORSConfig, get_security_config
from .config.logging import log_config
from .config.database import (
    get_metadata_pool,
    get_vector_pool,
    DatabaseConfig,
    DatabaseType
)

# Get logger from config
logger = log_config.get_logger(__name__)

# Get security config
security_config = get_security_config()

# Get database config
db_config = DatabaseConfig()

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
DATA_DIR = Path(os.getenv('STORAGE_BASE_DIR', os.path.join(os.path.dirname(__file__), 'data')))
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

# Export instances
task_manager = TaskManager()
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

async def setup_task_cleanup():
    """Periodic cleanup of expired tasks."""
    while True:
        await asyncio.sleep(3600)
        task_manager.cleanup()

async def check_task_status(task_id: str) -> Optional[Dict[str, Any]]:
    """Check the status of a background task."""
    task = task_manager.get_task(task_id)
    if not task:
        return None
    return task
