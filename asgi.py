"""
ASGI entry point for the Bartleby application.
Used for hypercorn and other ASGI servers.
"""
import os
import logging
from backend.server import app

# Configure logging for ASGI entry point
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("asgi")
logger.info("ASGI application initializing")

# This is the ASGI application to be used by hypercorn
application = app
