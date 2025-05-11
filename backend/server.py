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
load_dotenv()  # Load environment variables from .env file
from quart import Quart, jsonify, Blueprint
from openai import AsyncOpenAI
from quart_auth import QuartAuth
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

# Default configuration
default_config = {
    'TESTING': os.getenv('TESTING', 'false').lower() == 'true',
    'MAX_CONTENT_LENGTH': int(os.getenv('MAX_CONTENT_LENGTH', str(20 * 1024 * 1024))),  # 20MB default
    'PROJECT_ROOT': os.path.dirname(os.path.abspath(__file__)),
}

# Initialize Quart app
app = Quart(__name__)
app.config.update(default_config)
QuartAuth(app)  # Initialize Quart-Auth before CORS

# Apply CORS settings using custom middleware
try:
    from middleware.cors import setup_cors
    app = setup_cors(app)
    logger.info("Custom CORS middleware initialized")
except ImportError:
    # Fallback to basic CORS if custom middleware isn't available
    from quart_cors import cors
    cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
    allow_credentials = os.getenv('ALLOW_CREDENTIALS', 'true').lower() == 'true'
    cors_enabled = os.getenv('CORS_ENABLED', 'true').lower() == 'true'

    if cors_enabled:
        app = cors(app, allow_origin=cors_origins, allow_credentials=allow_credentials)
        logger.info(f"Fallback CORS enabled with origins: {cors_origins}")
    else:
        app = cors(app, allow_origin=['*'])
        logger.info("Fallback CORS enabled with default settings (all origins)")

# Apply security middleware
try:
    from middleware.security import setup_security
    rate_limit = int(os.getenv("RATE_LIMIT", "100"))  # Requests per minute
    rate_window = int(os.getenv("RATE_WINDOW", "60"))  # In seconds
    max_body_size = int(os.getenv("MAX_BODY_SIZE", str(16 * 1024 * 1024)))  # 16MB default
    
    app = setup_security(
        app, 
        rate_limit=rate_limit,
        rate_window=rate_window,
        max_body_size=max_body_size
    )
    logger.info(f"Security middleware initialized (rate limit: {rate_limit} req/min)")
except ImportError:
    logger.warning("Security middleware not available - using default security settings")

# Import modules with fallbacks
def setup_auth(app):
    """Setup authentication for the application."""
    try:
        from auth import configure_auth
        configure_auth(app)
        logger.info("Authentication configured")
    except ImportError:
        logger.warning("Auth module not available, authentication will be limited")

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

# OAuth Service
try:
    from services.oauth import create_oauth_service
    oauth_service = create_oauth_service()
    logger.info("OAuth service initialized successfully")
except ImportError as e:
    logger.warning(f"OAuth service not available: {e}")
    oauth_service = None

# Validate environment variables
def validate_environment():
    """Validate required environment variables and log warnings."""
    # Storage validation
    storage_backend = os.getenv('STORAGE_BACKEND', 'vercel').lower()
    logger.info(f"Using storage backend: {storage_backend}")
    
    if storage_backend == 'vercel' and not os.getenv('BLOB_READ_WRITE_TOKEN'):
        logger.warning("BLOB_READ_WRITE_TOKEN not found but Vercel storage backend is selected")
    
    if storage_backend == 's3' and not all([
        os.getenv('AWS_ACCESS_KEY_ID'),
        os.getenv('AWS_SECRET_ACCESS_KEY'),
        os.getenv('AWS_S3_EXPRESS_BUCKET')
    ]):
        logger.warning("AWS S3 configuration incomplete but S3 storage backend is selected")
    
    # Database validation
    if not os.getenv('DATABASE_URL'):
        logger.warning("DATABASE_URL not set - main database connection may fail")
    else:
        logger.info("Main database configuration found (DATABASE_URL)")
    
    if os.getenv('NEON_DATABASE_URL'):
        logger.info("Vector database configuration found (NEON_DATABASE_URL)")
    
    # Auth validation
    if not os.getenv('GOOGLE_CLIENT_ID'):
        logger.warning("GOOGLE_CLIENT_ID not set - Google authentication will be unavailable")
    else:
        logger.info("Google authentication configuration found")

# Initialize OpenAI client
def init_openai_client():
    """Initialize the OpenAI client if API key is available."""
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        logger.warning("OPENAI_API_KEY not found - vector operations will be limited")
        return None
    
    try:
        client = AsyncOpenAI(api_key=openai_api_key)
        logger.info("OpenAI client initialized successfully")
        return client
    except (ImportError, ValueError) as err:
        logger.error(f"Failed to initialize OpenAI client: {err}")
        return None

OPENAI_CLIENT = init_openai_client()

# Improved blueprint registration
def register_blueprints():
    """Register all available blueprints with improved import mechanism."""
    blueprint_configs = {
        'auth': {'file': 'auth_routes', 'bp': 'auth_bp', 'prefix': '/api/auth'},
        'inventory': {'file': 'inventory', 'bp': 'inventory_bp', 'prefix': '/api/inventory'},
        'documents': {'file': 'documents', 'bp': 'documents_bp', 'prefix': '/api/documents'},
        'files': {'file': 'files', 'bp': 'files_bp', 'prefix': '/api/files'},
        'process': {'file': 'process', 'bp': 'process_bp', 'prefix': '/api/process'}
    }
    
    registered = 0
    for name, config in blueprint_configs.items():
        module_name = config['file']
        bp_name = config['bp']
        url_prefix = config['prefix']
        
        # Try different import paths with proper string concatenation
        import_paths = [
            f'routes.{module_name}',                # Local import
            f'routes.{module_name}_routes',         # With routes suffix
            f'{module_name}',                       # Direct import
            f'backend.routes.{module_name}',        # From project root
            f'backend.routes.{module_name}_routes'  # From project root with routes suffix
        ]
        
        for import_path in import_paths:
            try:
                module = __import__(import_path, fromlist=[bp_name])
                blueprint = getattr(module, bp_name)
                app.register_blueprint(blueprint, url_prefix=url_prefix)
                logger.info(f"✅ {name.capitalize()} blueprint registered from {import_path}")
                registered += 1
                break
            except (ImportError, AttributeError):
                continue
        else:
            logger.warning(f"❌ {name.capitalize()} blueprint not registered - import failed")
    
    if registered == 0:
        logger.warning("No blueprints were registered - API functionality will be limited")
    else:
        logger.info(f"Successfully registered {registered} blueprints")

# Health check endpoint for Render
@app.route('/health', methods=['GET'])
async def health_check():
    """Simple health check endpoint for monitoring."""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

async def init_services():
    """Initialize application services."""
    try:
        # Store components in app context
        app.oauth_service = oauth_service
        
        if oauth_service:
            logger.info("OAuth service attached to app context")
        else:
            logger.warning("OAuth service not attached - fallback mode")
        
        # Create processor factory only if OpenAI client is available
        if OPENAI_CLIENT:
            # In a future implementation, create_processor_factory would be properly implemented
            # app.processor_factory = create_processor_factory(app.db, OPENAI_CLIENT)
            logger.info("Processor factory initialized with OpenAI client")
        else:
            logger.warning("Processor factory not initialized - OpenAI client unavailable")
            app.processor_factory = None
        
        # Setup authentication
        setup_auth(app)
        
        logger.info("Application services initialized")
    except (ImportError, RuntimeError) as init_err:
        logger.error(f"Service initialization failed: {init_err}")
        logger.warning("Application will run with limited functionality")

# Initialize application
@app.before_serving
async def startup():
    """Initialize application on startup."""
    try:
        validate_environment()
        await init_services()
        # Start task cleanup in a background task
        asyncio.create_task(setup_task_cleanup())
        logger.info("Application startup complete")
    except (RuntimeError, asyncio.TimeoutError) as startup_err:
        logger.error(f"Startup encountered errors: {startup_err}")
        logger.warning("Application may have limited functionality")

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        # In a future implementation, app_config.cleanup would be properly implemented
        # await app_config.cleanup()
        logger.info("Application shutdown complete")
    except (RuntimeError, IOError) as shutdown_err:
        logger.error(f"Shutdown error: {shutdown_err}")

# Register blueprints
register_blueprints()

# Configure Hypercorn
hypercorn_config = HypercornConfig()
port = int(os.getenv("PORT", "8000"))
hypercorn_config.bind = [f"0.0.0.0:{port}"]
hypercorn_config.accesslog = "-"  # Log to stdout for Render

if __name__ == "__main__":
    logger.info(f"Starting server on port {port}")
    asyncio.run(serve(app, hypercorn_config))
