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
    from backend.server import app
    logger.info("Successfully imported app from backend.server")
    
    # This is the ASGI application to be used by hypercorn
    application = app
except Exception as e:
    logger.error(f"Failed to import app: {e}")
    raise
