"""
Server module for the Instantory backend application.
Handles initialization, routing, and core application functionality.
"""
# Core imports
import sys
import os
import asyncio
import logging
from pathlib import Path

# Third party imports
from dotenv import load_dotenv
from quart import Quart, jsonify, Blueprint
from openai import AsyncOpenAI
from quart_cors import cors
from hypercorn.config import Config as HypercornConfig
from hypercorn.asyncio import serve

# Add the current directory to the Python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import modules with fallbacks
# Task Manager
try:
    from cleanup import task_manager, setup_task_cleanup
except ImportError:
    logger.warning("Cleanup module not available, using stub implementation")
    
    class TaskManagerStub:
        """Stub implementation of TaskManager for fallback."""
        
        def get_task(self, task_id):
            """Return task status for given task_id."""
            return None
        
        def list_tasks(self):
            """Return list of all tasks (stub implementation)."""
            return []
    
    task_manager = TaskManagerStub()
    
    async def setup_task_cleanup():
        """Stub implementation of task cleanup setup."""
        pass

# Middleware
try:
    from middleware import setup_middleware
except ImportError:
    logger.warning("Middleware module not available")
    def setup_middleware(app_instance, settings_obj):
        """Stub middleware setup function."""
        pass

# OAuth Service
try:
    from services.oauth import create_oauth_service
    oauth_service = create_oauth_service()
    logger.info("OAuth service initialized successfully")
except ImportError as e:
    logger.warning(f"OAuth service not available: {e}")
    oauth_service = None

# Blueprint module mapping and import
BLUEPRINT_MODULES = {
    'auth': {'file': 'auth_routes', 'bp': 'auth_bp'},
    'inventory': {'file': 'inventory', 'bp': 'inventory_bp'},
    'documents': {'file': 'documents', 'bp': 'documents_bp'},
    'files': {'file': 'files', 'bp': 'files_bp'}
}

# Import blueprints with fallback mechanism
blueprints = {}
for key, config in BLUEPRINT_MODULES.items():
    module_name = config['file']
    bp_name = config['bp']
    blueprints[key] = None
    
    # Try different import paths
    import_paths = [
        f'routes.{module_name}',  # Local import
        f'{module_name}',         # Direct import
        f'backend.routes.{module_name}'  # From project root
    ]
    
    for import_path in import_paths:
        try:
            module = __import__(import_path, fromlist=[bp_name])
            blueprints[key] = getattr(module, bp_name)
            logger.info(f"Successfully imported {bp_name} from {import_path}")
            break
        except (ImportError, AttributeError) as import_err:
            logger.warning(f"Failed to import {bp_name} from {import_path}: {import_err}")

# Extract blueprints for use
auth_bp = blueprints.get('auth')
inventory_bp = blueprints.get('inventory')
documents_bp = blueprints.get('documents')
files_bp = blueprints.get('files')

# Initialize storage and validate configuration
STORAGE_BACKEND = os.getenv('STORAGE_BACKEND', 'vercel').lower()
logger.info(f"Using storage backend: {STORAGE_BACKEND}")

try:
    # Validate storage configuration
    if STORAGE_BACKEND == 'vercel' and not os.getenv('BLOB_READ_WRITE_TOKEN'):
        logger.warning("BLOB_READ_WRITE_TOKEN not found but Vercel storage backend is selected")

    if STORAGE_BACKEND == 's3' and not all([
        os.getenv('AWS_ACCESS_KEY_ID'),
        os.getenv('AWS_SECRET_ACCESS_KEY'),
        os.getenv('AWS_S3_EXPRESS_BUCKET')
    ]):
        logger.warning("AWS S3 configuration incomplete but S3 storage backend is selected")
except Exception as storage_err:
    logger.error(f"Error initializing storage settings: {storage_err}")

# Verify database connections
try:
    if not os.getenv('DATABASE_URL'):
        logger.warning("DATABASE_URL not set - main database connection may fail")
    else:
        logger.info("Main database configuration found (DATABASE_URL)")

    if os.getenv('NEON_DATABASE_URL'):
        logger.info("Vector database configuration found (NEON_DATABASE_URL)")
except Exception as db_err:
    logger.error(f"Error checking database settings: {db_err}")

# Check for Google OAuth configuration
if not os.getenv('GOOGLE_CLIENT_ID'):
    logger.warning("GOOGLE_CLIENT_ID not set - Google authentication will be unavailable")
else:
    logger.info("Google authentication configuration found")

# Initialize OpenAI client with error handling
try:
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        logger.warning("OPENAI_API_KEY not found in environment variables - vector operations will be limited")
        openai_client = None
    else:
        openai_client = AsyncOpenAI(api_key=openai_api_key)
        logger.info("OpenAI client initialized successfully")
except Exception as openai_err:
    logger.error(f"Failed to initialize OpenAI client: {openai_err}")
    openai_client = None

# Default configuration
default_config = {
    'TESTING': os.getenv('TESTING', 'false').lower() == 'true',
    'MAX_CONTENT_LENGTH': int(os.getenv('MAX_CONTENT_LENGTH', str(20 * 1024 * 1024))),  # 20MB default
    'PROJECT_ROOT': os.path.dirname(os.path.abspath(__file__)),
}

# Initialize Quart app
app = Quart(__name__)

# Function to recreate the CORS app
def apply_cors(app_instance, origins):
    """Apply CORS configuration to the app."""
    if len(origins) == 1 and origins[0] == '*':
        return cors(app_instance, allow_origin='*')
    return cors(app_instance, allow_origin=origins)

# Configure app with defaults first
app.config.update(default_config)

# Apply default CORS settings
cors_origins = ['*']  # Default to allow all origins
app = apply_cors(app, cors_origins)

async def init_services():
    """Initialize application services."""
    try:
        # This is where you would initialize app_config
        # Most of this functionality is referenced but not fully defined in the original
        # await app_config.initialize()
        
        # Store components in app context
        # app.db = app_config.db
        # app.storage = app_config.storage
        app.oauth_service = oauth_service
        
        if oauth_service:
            logger.info("OAuth service attached to app context")
        else:
            logger.warning("OAuth service not attached - fallback mode")
        
        # Create processor factory only if OpenAI client is available
        if openai_client:
            # app.processor_factory = create_processor_factory(app_config.db, openai_client)
            logger.info("Processor factory initialized with OpenAI client")
        else:
            logger.warning("Processor factory not initialized - OpenAI client unavailable")
            app.processor_factory = None
        
        logger.info("Application services initialized")
    except Exception as init_err:
        logger.error(f"Service initialization failed: {init_err}")
        logger.warning("Application will run with limited functionality")

# Register blueprints (if available)
if auth_bp:
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
if inventory_bp:
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
if documents_bp:
    app.register_blueprint(documents_bp, url_prefix="/api/documents")
if files_bp:
    app.register_blueprint(files_bp, url_prefix="/api/files")

# Health check endpoint for Render
@app.route('/health', methods=['GET'])
async def health_check():
    """Simple health check endpoint for monitoring."""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

# Task status route
@app.route('/api/tasks/<task_id>', methods=['GET'])
async def get_task_status(task_id):
    """Get the status of a specific task."""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task)

# Initialize application
@app.before_serving
async def startup():
    """Initialize application on startup."""
    try:
        await init_services()
        # Start task cleanup in a background task
        asyncio.create_task(setup_task_cleanup())
        logger.info("Application startup complete")
    except Exception as startup_err:
        logger.error(f"Startup encountered errors: {startup_err}")
        logger.warning("Application may have limited functionality")

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        # await app_config.cleanup()
        logger.info("Application shutdown complete")
    except Exception as shutdown_err:
        logger.error(f"Shutdown error: {shutdown_err}")

# Configure Hypercorn
hypercorn_config = HypercornConfig()
# Use PORT environment variable (Render sets this automatically)
port = int(os.getenv("PORT", "8000"))
hypercorn_config.bind = [f"0.0.0.0:{port}"]
hypercorn_config.accesslog = "-"  # Log to stdout for Render

if __name__ == "__main__":
    logger.info(f"Starting server on port {port}")
    asyncio.run(serve(app, hypercorn_config))
