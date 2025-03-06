# Core imports
import os
from dotenv import load_dotenv
# This comment ensures app is properly exported for hypercorn

# Third party imports
from quart import Quart, jsonify
from openai import AsyncOpenAI
from quart_cors import cors
from hypercorn.config import Config as HypercornConfig
from hypercorn.asyncio import serve
import asyncio

# Task management
from .cleanup import task_manager, setup_task_cleanup

# Local imports
from .config import config as app_config
from .middleware import setup_middleware
from .services.processor import create_processor_factory
from .routes.auth_routes import auth_bp
from .routes.inventory import inventory_bp
from .routes.documents import documents_bp
from .routes.files import files_bp

# Load environment variables
load_dotenv()

# Initialize logging
logger = app_config.logging.get_logger(__name__)

# Initialize OpenAI client
try:
    openai_client = AsyncOpenAI(api_key=app_config.settings.get_api_key('openai'))
    logger.info("OpenAI client initialized")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise RuntimeError("OpenAI client initialization failed") from e

# Initialize Quart app
app = Quart(__name__)

# Configure app
app.config.update({
    'TESTING': app_config.settings.testing,
    'MAX_CONTENT_LENGTH': app_config.settings.get_max_content_length(),
    'PROJECT_ROOT': app_config.settings.paths.BASE_DIR,
    'CORS_CONFIG': app_config.settings.get_cors_config()
})

# Enable CORS with configuration
app = cors(app, **app_config.settings.get_cors_config())

if app_config.settings.is_production():
    app.config.update({
        'PROPAGATE_EXCEPTIONS': True,
        'PREFERRED_URL_SCHEME': 'https'
    })

# Initialize services
async def init_services():
    """Initialize application services."""
    try:
        # Initialize configuration components
        await app_config.initialize()
        
        # Store components in app context
        app.db = app_config.db
        app.storage = app_config.storage
        
        # Create processor factory
        app.processor_factory = create_processor_factory(app_config.db, openai_client)
        
        logger.info("Application services initialized")
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        raise RuntimeError(f"Service initialization failed: {str(e)}") from e

# Set up middleware
setup_middleware(app, app_config.settings)

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
        await init_services()
        asyncio.create_task(setup_task_cleanup())
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise RuntimeError(f"Startup failed: {str(e)}") from e

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        await app_config.cleanup()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")
        # Not re-raising here as we're shutting down anyway
     
# Start the server
hypercorn_config = HypercornConfig()
hypercorn_config.bind = [f"0.0.0.0:{str(os.getenv('PORT', '8000'))}"]

if __name__ == "__main__":
    logger.info("Starting server")
    asyncio.run(serve(app, hypercorn_config))
