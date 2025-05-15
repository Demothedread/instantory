"""Backend application package."""

import logging
import importlib.util
import os

# Set up basic logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define server module path
SERVER_MODULE = 'backend.server'

# Check environment for debugging
is_debug = os.getenv('DEBUG', 'false').lower() == 'true'
if is_debug:
    logger.setLevel(logging.DEBUG)
    logger.debug("Debug logging enabled")

# Don't import server here to avoid circular imports
# When this package is imported directly for deployment
# Instead, make app importable from backend.server

# Check for required modules
try:
    # Check if auth routes are loadable but don't import directly
    auth_routes_spec = importlib.util.find_spec('backend.routes.auth_routes')
    if auth_routes_spec is None:
        logger.warning("Auth routes module not found - authentication may not work properly")
    else:
        try:
            from .routes.auth_routes import auth_bp, setup_auth
            logger.info("Auth module loaded successfully")
        except ImportError as e:
            logger.warning(f"Could not import auth components: {e}")
        
except ImportError as e:
    try:
        # Absolute import when run from different contexts
        import sys
        if 'backend' not in sys.modules:
            logger.info("Trying absolute import for server module")
        
        # Try absolute import
        server_module = importlib.import_module('backend.server')
        app = server_module.app
        logger.info("Server module loaded via absolute import")
    except ImportError as ie:
        # Fallback with detailed warning
        logger.warning(f"Could not import app from server.py: {ie}")
        logger.warning("Module may not be properly initialized or PYTHONPATH might be incorrect")
        app = None

__version__ = '0.1.0'
__all__ = ['app', 'logger']