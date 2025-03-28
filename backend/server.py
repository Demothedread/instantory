# Core imports
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import asyncio
import logging

# Configure basic logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the project root and backend directory to sys.path to enable imports
# .''''''
#current_dir = Path(__file__).resolve().parent
#parent_dir = current_dir.parent
# Make project root first in path (higher priority)
#if str(parent_dir) not in sys.path:
#   sys.path.insert(0, str(parent_dir))
# Make backend dir second in path
# str(current_dir) not in sys.path:
#   sys.path.insert(0, str#(current_dir))
# Also add the absolute paths to make sure imports work in all execution contexts
#sys.path.insert(0, str(current_dir.absolute()))
#sys.path.insert(0, str(parent_dir.absolute()))

#Load environment variables (.env file is optional)
load_dotenv(verbose=True)
# ''''''
# Import local modules with fallbacks for each module
try:
    from cleanup import task_manager, setup_task_cleanup
except ImportError:
    logger.warning("Cleanup module not available, using stub implementation")
    
    class TaskManagerStub:
        def get_task(self, task_id):
            return None
    
    task_manager = TaskManagerStub()
    
    async def setup_task_cleanup():
        pass

# Third party imports
from quart import Quart, jsonify, Blueprint
from openai import AsyncOpenAI
from quart_cors import cors
from hypercorn.config import Config as HypercornConfig
from hypercorn.asyncio import serve
from types import SimpleNamespace

# Import config with fallback
try:
    from config.settings import settings
    app_config = SimpleNamespace(settings=settings)
except ImportError:
    logger.error("Unable to import settings module")
    app_config = SimpleNamespace()
    app_config.settings = SimpleNamespace(testing=False)

# Import middleware with fallback
try:
    from middleware import setup_middleware
except ImportError:
    logger.warning("Middleware module not available")
    def setup_middleware(app, settings):
        pass

# Import processor factory with fallback
try:
    from services.processor import create_processor_factory
except ImportError:
    logger.warning("Processor factory not available")
    def create_processor_factory(db, client):
        return None

# Blueprint module mapping (module_name: bp_variable)
blueprint_modules = {
    'auth': {'file': 'auth_routes', 'bp': 'auth_bp'},
    'inventory': {'file': 'inventory', 'bp': 'inventory_bp'},
    'documents': {'file': 'documents', 'bp': 'documents_bp'},
    'files': {'file': 'files', 'bp': 'files_bp'}
}
# Import blueprints with multiple fallback paths to handle different execution contexts
blueprints = {}
for key, config in blueprint_modules.items():
    module_name = config['file']
    bp_name = config['bp']
    blueprints[key] = None
    
    # Try different import paths to handle both deployment and local development
    import_paths = [
        f'backend.routes.{module_name}',  # For when running as module (Render deployment)
        f'routes.{module_name}',          # For local development
    ]
    
    imported = False
    for import_path in import_paths:
        try:
            module = __import__(import_path, fromlist=[bp_name])
            blueprints[key] = getattr(module, bp_name)
            logger.info(f"Loaded blueprint '{key}' from {import_path}")
            imported = True
            break
        except (ImportError, AttributeError) as e:
            # Use info level for first failure, debug for subsequent ones
            if import_path == import_paths[0]:
                logger.info(f"Primary import path failed for {key}: {e}")
            else:
                logger.debug(f"Alternative import attempt for {import_path}: {e}")
    
    # Create fallback blueprint if all import attempts failed
    if not imported:
        logger.warning(f"{key} routes not available after all import attempts")
        blueprints[key] = Blueprint(key, __name__)

# Get route blueprints
auth_bp = blueprints['auth']
inventory_bp = blueprints['inventory'] 
documents_bp = blueprints['documents']
files_bp = blueprints['files']

# Initialize storage-related variables
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
except Exception as e:
    logger.error(f"Error initializing storage settings: {e}")

# Verify database connections (database.py will handle the actual connections)
try:
    if not os.getenv('DATABASE_URL'):
        logger.warning("DATABASE_URL not set - main database connection may fail")
    else:
        logger.info("Main database configuration found (DATABASE_URL)")

    if os.getenv('NEON_DATABASE_URL'):
        logger.info("Vector database configuration found (NEON_DATABASE_URL)")
    else:
        logger.info("Vector database not configured - vector search will be unavailable")
except Exception as e:
    logger.error(f"Error checking database settings: {e}")

    # Initialize OpenAI client with error handling
# Import OAuth service with fallback
try:
    from services.oauth import create_oauth_service
    oauth_service = create_oauth_service()
    logger.info("OAuth service initialized successfully")
except ImportError as e:
    logger.warning(f"OAuth service not available: {e}")
    oauth_service = None
try:
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        logger.warning("OPENAI_API_KEY not found in environment variables - vector operations will be limited")
    
    openai_client = AsyncOpenAI(api_key=openai_api_key)
    logger.info("OpenAI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    # Allow the app to start without OpenAI initially
    openai_client = None

# Initialize Quart app
app = Quart(__name__)

# Function to recreate the CORS app
def apply_cors(app_instance, origins):
    """Apply CORS configuration to the app."""
    if len(origins) == 1 and origins[0] == '*':
        return cors(app_instance, allow_origin='*')
    else:
        return cors(app_instance, allow_origin=origins)

# Set default configuration
default_config = {
    'TESTING': os.getenv('TESTING', 'false').lower() == 'true',
    'MAX_CONTENT_LENGTH': int(os.getenv('MAX_CONTENT_LENGTH', 20 * 1024 * 1024)),  # 20MB default
    'PROJECT_ROOT': os.path.dirname(os.path.abspath(__file__)),
}

# Configure app with defaults first
app.config.update(default_config)

# CORS configuration - use parameter names compatible with quart-cors
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
app = apply_cors(app, cors_origins)

# Production settings
if os.getenv('ENVIRONMENT', '').lower() == 'production':
    app.config.update({
        'PROPAGATE_EXCEPTIONS': True,
        'PREFERRED_URL_SCHEME': 'https'
    })

# Initialize services
async def init_services():
    """Initialize application services."""
    global app  # Using global to reference the app
    
    try:
        # Initialize configuration components
        await app_config.initialize()
        
        # Update app configuration with initialized config values
        try:
            app.config.update({
                'TESTING': app_config.settings.testing,
                'MAX_CONTENT_LENGTH': app_config.settings.get_max_content_length(),
                'PROJECT_ROOT': app_config.settings.paths.BASE_DIR,
            })
            
            # Re-enable CORS with updated configuration if available
            try:
                cors_config = app_config.settings.get_cors_config()
                if cors_config and 'allow_origins' in cors_config:
                    origins = cors_config.get('allow_origins', ['*'])
                    app = apply_cors(app, origins)
            except Exception as cors_error:
                logger.warning(f"Using default CORS configuration due to error: {cors_error}")
        except Exception as config_error:
            logger.warning(f"Using default config values due to error: {config_error}")
        
        # Store components in app context
        app.db = app_config.db
        app.storage = app_config.storage
        app.oauth_service = oauth_service
        if oauth_service:
            logger.info("OAuth service attached to app context")
        else:
            logger.warning("OAuth service not attached - fallback mode")
        
        # Create processor factory only if OpenAI client is available
        if openai_client:
            app.processor_factory = create_processor_factory(app_config.db, openai_client)
            logger.info("Processor factory initialized with OpenAI client")
        else:
            logger.warning("Processor factory not initialized - OpenAI client unavailable")
            app.processor_factory = None
        
        logger.info("Application services initialized")
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        # Log the error but continue - allow partial functionality
        logger.warning("Application will run with limited functionality")

# Set up middleware with error handling
try:
    setup_middleware(app, app_config.settings)
except Exception as e:
    logger.error(f"Middleware setup error: {e}")
    # Continue without complete middleware setup

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(documents_bp, url_prefix="/api/documents")
app.register_blueprint(files_bp, url_prefix="/api/files")

# Health check endpoint for Render
@app.route('/health', methods=['GET'])
async def health_check():
    """Simple health check endpoint for monitoring."""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

# Task status route
@app.route('/api/tasks/<task_id>', methods=['GET'])
async def get_task_status(task_id: str):
    """Get the status of a background task."""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task)

# Auth0 Integration Endpoints
from urllib.parse import quote_plus, urlencode
import json
from os import environ as env
from quart import session, render_template, redirect, url_for

@auth_bp.route("/home", methods=["GET"])
async def home():
    return await render_template(
        "home.html",
        session=session.get("user"),
        pretty=json.dumps(session.get("user"), indent=4),
    )

@auth_bp.route("/login", methods=["GET"])
async def login():
    redirect_uri = url_for("auth.callback", _external=True)
    # Initiate Auth0 login via the OAuth service
    return await app.oauth_service.auth0.authorize_redirect(redirect_uri)

@auth_bp.route("/callback", methods=["GET", "POST"])
async def callback():
    # Handle Auth0 callback and retrieve token
    token = await app.oauth_service.auth0.authorize_access_token()
    session["user"] = token
    return redirect(url_for("auth.home"))

@auth_bp.route("/logout", methods=["GET"])
async def logout():
    # Clear user session and redirect to Auth0 logout URL
    session.clear()
    logout_url = (
        "https://" + env.get("AUTH0_DOMAIN") + "/v2/logout?" + urlencode({
            "returnTo": url_for("auth.home", _external=True),
            "client_id": env.get("AUTH0_CLIENT_ID"),
        }, quote_via=quote_plus)
    )
    return redirect(logout_url)

# Initialize application
@app.before_serving
async def startup():
    """Initialize application on startup."""
    try:
        await init_services()
        # Start task cleanup in a background task
        asyncio.create_task(setup_task_cleanup())
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Startup encountered errors: {e}")
        logger.warning("Application may have limited functionality")
        # Don't re-raise - allow app to start with limited functionality

@app.after_serving
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        await app_config.cleanup()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")
        # Not re-raising as we're shutting down anyway

# Configure Hypercorn
hypercorn_config = HypercornConfig()
# Use PORT environment variable (Render sets this automatically)
port = int(os.getenv("PORT", "8000"))
hypercorn_config.bind = [f"0.0.0.0:{port}"]
hypercorn_config.accesslog = "-"  # Log to stdout for Render

if __name__ == "__main__":
    logger.info(f"Starting server on port {port}")
    asyncio.run(serve(app, hypercorn_config))
