import asyncpg
import asyncio
import aiohttp
import base64
import io
import json
import logging
import os
import re
import sys
import time
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image
from quart import Quart, jsonify, request, send_file, make_response
from quart_cors import cors
from auth_routes import auth_bp
from db import get_db_pool

# Load environment variables
load_dotenv()

# Required environment variables
REQUIRED_ENV_VARS = {
    'DATABASE_URL': 'Database connection string is required',
    'OPENAI_API_KEY': 'OpenAI API key is required',
    'BLOB_READ_WRITE_TOKEN': 'Vercel Blob token is required'
}

# Validate required environment variables
for var, message in REQUIRED_ENV_VARS.items():
    if not os.getenv(var):
        raise RuntimeError(f"Environment variable {var} is not set. {message}")

# Configure logging with proper error handling
try:
    log_dir = Path(os.getenv('LOG_DIR', 'logs'))
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'instantory.log'
    
    logging.basicConfig(
        level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(str(log_file))
        ]
    )
except Exception as e:
    print(f"Failed to configure logging: {e}")
    logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

# Set project root directory with error handling
try:
    ROOT_DIR = Path(os.getenv('PROJECT_ROOT', Path(__file__).parent.parent))
    sys.path.append(str(ROOT_DIR))
except Exception as e:
    logger.error(f"Failed to set project root: {e}")
    ROOT_DIR = Path.cwd()

# Get port with fallback
PORT = int(os.getenv("PORT", 5000))

# Import optional dependencies with fallbacks
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

# Directory paths with proper error handling
try:
    DATA_DIR = Path(os.getenv('DATA_DIR', '/data'))
    PATHS = {
        'UPLOADS_DIR': DATA_DIR / 'uploads',
        'INVENTORY_IMAGES_DIR': DATA_DIR / 'images' / 'inventory',
        'EXPORTS_DIR': DATA_DIR / 'exports',
        'DOCUMENT_DIRECTORY': DATA_DIR / 'documents'
    }

    # Create directories with proper permissions
    for directory in PATHS.values():
        directory.mkdir(parents=True, exist_ok=True, mode=0o755)
except Exception as e:
    logger.error(f"Failed to create data directories: {e}")
    raise RuntimeError("Unable to initialize required directories")

class TableManager:
    """Manages custom table creation and schema."""
    def __init__(self):
        self.reserved_names = {'products', 'document_vault', 'users', 'user_inventory'}
    
    async def create_custom_table(self, conn: asyncpg.Connection, table_name: str, columns: List[Dict[str, str]], instruction: Optional[str] = None) -> bool:
        """Create a new custom table with specified columns and optional instruction."""
        try:
            # Sanitize table name
            table_name = re.sub(r'[^a-zA-Z0-9_]', '', table_name.lower())
            if not table_name or table_name in self.reserved_names:
                raise ValueError("Invalid table name")
            
            # Build column definitions with proper SQL injection prevention
            column_defs = []
            for col in columns:
                col_name = re.sub(r'[^a-zA-Z0-9_]', '', col['name'].lower())
                col_type = col['type'].upper()
                if col_type not in ('TEXT', 'INTEGER', 'REAL', 'BOOLEAN', 'TIMESTAMP'):
                    col_type = 'TEXT'
                column_defs.append(f"{col_name} {col_type} NOT NULL DEFAULT ''")
            
            # Add standard columns and instruction
            column_defs.extend([
                "id SERIAL PRIMARY KEY",
                "user_id INTEGER REFERENCES users(id) ON DELETE CASCADE",
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "instruction TEXT"
            ])
            
            # Create table with instruction using parameterized query
            query = f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    {', '.join(column_defs)}
                );
            """
            await conn.execute(query)
            
            # Add table comment
            await conn.execute(
                f"COMMENT ON TABLE {table_name} IS $1",
                instruction or 'Custom inventory table'
            )
            
            # Create updated_at trigger
            trigger_query = f"""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';

                DROP TRIGGER IF EXISTS update_updated_at_trigger ON {table_name};
                
                CREATE TRIGGER update_updated_at_trigger
                    BEFORE UPDATE ON {table_name}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            """
            await conn.execute(trigger_query)
            
            # Create indexes for better performance
            await conn.execute(f"""
                CREATE INDEX IF NOT EXISTS idx_{table_name}_user_id ON {table_name}(user_id);
                CREATE INDEX IF NOT EXISTS idx_{table_name}_created_at ON {table_name}(created_at DESC);
            """)
            
            return True
            
        except asyncpg.PostgresError as e:
            logger.error(f"Database error creating custom table: {e}")
            return False
        except ValueError as e:
            logger.error(f"Value error creating custom table: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error creating custom table: {e}")
            return False

class TaskManager:
    """Manages background tasks with TTL and memory limits."""
    def __init__(self, ttl_seconds: int = 86400, max_tasks: int = 1000):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds
        self.max_tasks = max_tasks
        self._lock = asyncio.Lock()

    async def add_task(self, task_id: str) -> None:
        async with self._lock:
            # Remove oldest tasks if limit is reached
            if len(self.tasks) >= self.max_tasks:
                oldest_task = min(self.tasks.items(), key=lambda x: x[1]['created_at'])
                del self.tasks[oldest_task[0]]
            
            self.tasks[task_id] = {
                'status': 'queued',
                'progress': 0,
                'message': 'Task queued',
                'created_at': asyncio.get_running_loop().time()
            }

    async def update_task(self, task_id: str, **kwargs) -> None:
        async with self._lock:
            if task_id in self.tasks:
                self.tasks[task_id].update(kwargs)

    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            task = self.tasks.get(task_id)
            if task and asyncio.get_running_loop().time() - task['created_at'] <= self.ttl_seconds:
                return task
            self.tasks.pop(task_id, None)
            return None

    async def cleanup(self) -> None:
        try:
            async with self._lock:
                current_time = asyncio.get_running_loop().time()
                expired_tasks = [task_id for task_id, task in self.tasks.items()
                                if current_time - task['created_at'] > self.ttl_seconds]
                for task_id in expired_tasks:
                    del self.tasks[task_id]
        except Exception as e:
            logger.error(f"Error in task cleanup: {e}")

# Create global managers with proper initialization
task_manager = TaskManager(
    ttl_seconds=int(os.getenv('TASK_TTL_SECONDS', 86400)),
    max_tasks=int(os.getenv('MAX_TASKS', 1000))
)

table_manager = TableManager()

# Initialize OpenAI client with proper error handling
try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise RuntimeError("OpenAI client initialization failed")

# Initialize Quart app with proper configuration
app = Quart(__name__)
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB default

# Configure CORS with secure defaults
cors_config = {
    'allow_origins': os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','),
    'allow_credentials': True,
    'allow_methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': ['Content-Type', 'Authorization'],
    'max_age': 3600
}
cors(app, **cors_config)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# Initialize database connection pool
@app.before_serving
async def startup():
    """Initialize application resources."""
    try:
        # Initialize database
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                await conn.execute('SELECT 1')  # Test connection
                logger.info("Database connection successful")
        
        # Start task cleanup loop
        asyncio.create_task(cleanup_loop())
        
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

async def cleanup_loop():
    """Periodic cleanup of expired tasks and temporary files."""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            await task_manager.cleanup()
            
            # Cleanup temporary files older than 24 hours
            temp_dir = PATHS['UPLOADS_DIR']
            current_time = time.time()
            for file_path in temp_dir.glob('*'):
                if current_time - file_path.stat().st_mtime > 86400:
                    try:
                        if file_path.is_file():
                            file_path.unlink()
                        elif file_path.is_dir():
                            shutil.rmtree(file_path)
                    except Exception as e:
                        logger.error(f"Failed to delete temporary file {file_path}: {e}")
        except Exception as e:
            logger.error(f"Error in cleanup loop: {e}")
            await asyncio.sleep(60)  # Wait before retrying

# Health check endpoint
@app.route('/health')
async def health_check():
    """Health check endpoint for Render."""
    try:
        # Test database connection
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                await conn.execute('SELECT 1')
        
        # Check data directories
        for path in PATHS.values():
            if not path.exists() or not os.access(path, os.W_OK):
                raise RuntimeError(f"Data directory {path} is not accessible")
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'storage': 'accessible',
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# Error handlers
@app.errorhandler(400)
async def bad_request(e):
    return jsonify({'error': 'Bad request', 'message': str(e)}), 400

@app.errorhandler(401)
async def unauthorized(e):
    return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

@app.errorhandler(403)
async def forbidden(e):
    return jsonify({'error': 'Forbidden', 'message': str(e)}), 403

@app.errorhandler(404)
async def not_found(e):
    return jsonify({'error': 'Not found', 'message': str(e)}), 404

@app.errorhandler(500)
async def server_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({'error': 'Internal server error'}), 500

# Security headers middleware
@app.after_request
async def add_security_headers(response):
    """Add security headers to all responses."""
    response.headers.update({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': "default-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    })
    return response

# API Routes
from routes.inventory import inventory_bp
from routes.documents import documents_bp
from routes.files import files_bp

app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(documents_bp, url_prefix="/api/documents")
app.register_blueprint(files_bp, url_prefix="/api/files")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=PORT)
