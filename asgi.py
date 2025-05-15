"""
ASGI entry point for the Bartleby application.
Used for hypercorn and other ASGI servers.
"""
import os
import logging
import sys

# Add the project root directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging for ASGI entry point
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("asgi")
logger.info("ASGI application initializing")

# Import the app from the module
try:
    # Try to import the application using different approaches
    try:
        # First, try direct import of the app instance
        from backend.server import app
        logger.info("Successfully imported app directly from backend.server")
        application = app
    except (ImportError, AttributeError):
        # If direct import fails, try using the factory function
        from backend.server import create_app
        logger.info("Using create_app factory function from backend.server")
        application = create_app()
    
    # Log successful initialization
    logger.info("ASGI application initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize ASGI application: {e}")
    raise
