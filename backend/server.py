# Core imports
import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Third party imports
from quart import Quart, jsonify
from openai import AsyncOpenAI
from quart_cors import cors

# Task management
from .cleanup import task_manager, setup_task_cleanup

# Local imports
from .config.logging import log_config
from .config.database import (
    get_metadata_pool,
    get_vector_pool,
)
from .middleware import setup_middleware
from .services.processor import create_processor_factory
from .services.storage import storage_manager
from .routes.auth_routes import auth_bp
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

# Enable CORS
app = cors(app, allow_origin="*")

# Get port from environment (required by Render, defaults to 10000 for local development)
try:
    port = int(os.getenv("PORT", "10000"))
    logger.info(f"Using port {port}")
except ValueError as e:
    logger.error(f"Invalid PORT value: {os.getenv('PORT')}")
    raise RuntimeError(f"Invalid PORT environment variable: {e}")

# Set testing mode if environment variable is set
if os.getenv('TESTING', '').lower() == 'true':
    app.config['TESTING'] = True

# Load configuration
try:
    # Validate required environment variables
    required_vars = {
        'DATABASE_URL': 'Render database connection string is required',
        'NEON_DATABASE_URL': 'Neon database connection string is required',
        'OPENAI_API_KEY': 'OpenAI API key is required',
        'BLOB_READ_WRITE_TOKEN': 'Vercel Blob token is required',
        'AWS_S3_EXPRESS_BUCKET': 'S3 bucket name is required',
        'AWS_ACCESS_KEY_ID': 'AWS access key is required',
        'AWS_SECRET_ACCESS_KEY': 'AWS secret key is required'
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
        # Initialize metadata database
        metadata_pool = await get_metadata_pool()
        async with metadata_pool.acquire() as conn:
            await conn.execute('SELECT 1')
        logger.info("Metadata database connection successful")
        
        # Initialize vector database
        vector_pool = await get_vector_pool()
        async with vector_pool.acquire() as conn:
            await conn.execute('SELECT 1')
        logger.info("Vector database connection successful")
        
        # Store pools in app context
        app.metadata_pool = metadata_pool
        app.vector_pool = vector_pool
        
        # Create processor factory with metadata pool
        processor_factory = create_processor_factory(metadata_pool, openai_client)
        app.processor_factory = processor_factory
        
        # Initialize storage manager
        app.storage_manager = storage_manager
        logger.info("Storage manager initialized")
        
        logger.info("Application services initialized")
        
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

# Task status route
@app.route('/api/tasks/<task_id>', methods=['GET'])
async def get_task_status(task_id: str):
    """Get the status of a background task."""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task)

# Initialize application
@app.before_serving
async def startup():
    """Initialize application on startup."""
    try:
        # Initialize services
        await init_services()
        
        # Start task cleanup loop
        asyncio.create_task(setup_task_cleanup())
        logger.info("Task cleanup loop started")
        
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        # Close database pools
        if hasattr(app, 'metadata_pool'):
            await app.metadata_pool.close()
        if hasattr(app, 'vector_pool'):
            await app.vector_pool.close()
            
        # Clean up storage manager resources
        if hasattr(app, 'storage_manager'):
            await app.storage_manager.cleanup()
            
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")
    
# Configure hypercorn for production
if os.getenv('ENVIRONMENT') == 'production':
    # Production settings
    app.config.update({
        'PROPAGATE_EXCEPTIONS': True,
        'PREFERRED_URL_SCHEME': 'https'
    })

# Start the server
if __name__ == "__main__":
    logger.info("Starting server")
    if os.getenv('ENVIRONMENT') == 'production':
        # Use hypercorn in production (render.com)
        import hypercorn.asyncio
        config = hypercorn.Config()
        config.bind = [f"0.0.0.0:{port}"]
        config.use_reloader = False
        config.workers = int(os.getenv('WORKERS', '1'))
        asyncio.run(hypercorn.asyncio.serve(app, config))
    else:
        # Development server
        app.run(
            host="0.0.0.0",
            port=port,
            debug=os.getenv('DEBUG', 'false').lower() == 'true',
            use_reloader=False  # Disable reloader to prevent conflicts
        )
