"""Backend application package."""

# Import app using a try-except pattern for different environments
try:
    # Direct import when used as a package
    from .server import app
except ImportError:
    try:
        # Absolute import when run from different contexts
        from backend.server import app
    except ImportError:
        # Fallback with warning - will be caught by caller
        import logging
        logging.warning("Could not import app from server.py - module may not be properly initialized")
        app = None

__version__ = '0.1.0'
__all__ = ['app']