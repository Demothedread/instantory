# Core imports
import os
from dotenv import load_dotenv
# from server import app

# Third party imports
from quart import Quart, jsonify
from openai import AsyncOpenAI
from quart_cors import cors
from hypercorn.config import Config
from hypercorn.asyncio import serve
import asyncio

# Task management
from .cleanup import task_manager, setup_task_cleanup

# Local imports
from config import config
from middleware import setup_middleware
from services.processor import create_processor_factory
from routes.auth_routes import auth_bp
from routes.inventory import inventory_bp
from routes.documents import documents_bp
from routes.files import files_bp

# Load environment variables
load_dotenv()

# Initialize logging
logger = config.logging.get_logger(__name__)

# Initialize OpenAI client
try:
    openai_client = AsyncOpenAI(api_key=config.settings.get_api_key('openai'))
    logger.info("OpenAI client initialized")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise RuntimeError("OpenAI client initialization failed")

# Initialize Quart app
app = Quart(__name__)

# Configure app
app.config.update({
    'TESTING': config.settings.testing,
    'MAX_CONTENT_LENGTH': config.settings.get_max_content_length(),
    'PROJECT_ROOT': config.settings.paths.BASE_DIR,
    'CORS_CONFIG': config.settings.get_cors_config()
})

# Enable CORS with configuration
app = cors(app, **config.settings.get_cors_config())

if config.settings.is_production():
    app.config.update({
        'PROPAGATE_EXCEPTIONS': True,
        'PREFERRED_URL_SCHEME': 'https'
    })

# Initialize services
async def init_services():
    """Initialize application services."""
    try:
        # Initialize configuration components
        await config.initialize()
        
        # Store components in app context
        app.db = config.db
        app.storage = config.storage
        
        # Create processor factory
        app.processor_factory = create_processor_factory(config.db, openai_client)
        
        logger.info("Application services initialized")
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        raise

# Set up middleware
setup_middleware(app, config.settings)

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
        raise

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        await config.cleanup()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")
     
# Start the server
config = Config()
config.bind = [f"0.0.0.0:{os.getenv('PORT', 8000)}"]

if __name__ == "__main__":
    logger.info("Starting server")
    import asyncio
    asyncio.run(serve(app,config))  