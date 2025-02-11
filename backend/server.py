"""Main application server."""
import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv
from quart import Quart
from openai import AsyncOpenAI

from .config.database import get_db_pool
from .config.storage import get_storage_config
from .config.security import get_security_config
from .config.logging import log_config

from .middleware import setup_middleware
from .services.processor import create_processor_factory

from .auth_routes import auth_bp
from .routes.inventory import inventory_bp
from .routes.documents import documents_bp
from .routes.files import files_bp

# Load environment variables
load_dotenv()

# Initialize logging
logger = log_config.get_logger(__name__)

# Initialize OpenAI client
try:
    openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    logger.info("OpenAI client initialized")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise RuntimeError("OpenAI client initialization failed")

# Initialize Quart app
app = Quart(__name__)

# Set testing mode if environment variable is set
if os.getenv('TESTING', '').lower() == 'true':
    app.config['TESTING'] = True

# Load configuration
try:
    # Validate required environment variables
    required_vars = {
        'DATABASE_URL': 'Database connection string is required',
        'OPENAI_API_KEY': 'OpenAI API key is required',
        'BLOB_READ_WRITE_TOKEN': 'Blob token is required'
    }
    
    # In test mode, use default values if environment variables are not set
    is_testing = os.getenv('TESTING', '').lower() == 'true'
    
    for var, message in required_vars.items():
        if not os.getenv(var):
            if is_testing:
                os.environ[var] = f'test-{var.lower()}'
                logger.warning(f"{var} not set - using test value")
            else:
                raise RuntimeError(f"Environment variable {var} is not set. {message}")
    
    # Configure app
    app.config.update({
        'MAX_CONTENT_LENGTH': int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)),
        'PROJECT_ROOT': Path(os.getenv('PROJECT_ROOT', Path(__file__).parent.parent))
    })
    
    logger.info("Application configuration loaded")
except Exception as e:
    logger.error(f"Configuration error: {e}")
    raise

# Initialize services
async def init_services():
    """Initialize application services."""
    try:
        # Initialize database pool
        db_pool = await get_db_pool()
        
        # Test database connection
        async with db_pool.acquire() as conn:
            await conn.execute('SELECT 1')
        logger.info("Database connection successful")
        
        # Create processor factory
        processor_factory = create_processor_factory(db_pool, openai_client)
        app.processor_factory = processor_factory
        
        logger.info("Application services initialized")
        return db_pool
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        raise

# Set up middleware
middleware_config = {
    'rate_limit': int(os.getenv('RATE_LIMIT', '100')),
    'rate_window': int(os.getenv('RATE_WINDOW', '60')),
    'max_body_size': int(os.getenv('MAX_BODY_SIZE', 16 * 1024 * 1024)),
    'log_request_body': os.getenv('LOG_REQUEST_BODY', '').lower() == 'true'
}
setup_middleware(app, middleware_config)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(documents_bp, url_prefix="/api/documents")
app.register_blueprint(files_bp, url_prefix="/api/files")

# Initialize application
@app.before_serving
async def startup():
    """Initialize application on startup."""
    try:
        app.db_pool = await init_services()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        if hasattr(app, 'db_pool'):
            await app.db_pool.close()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port)
