"""Middleware setup for the backend application."""
from typing import Dict, Any
from quart import Quart
from .cors import setup_cors
from .error_handlers import setup_error_handlers
from .request_logger import setup_request_logging
from .security import setup_security
from ..routes.auth_routes import auth_bp

def setup_middleware(app: Quart, settings: Any) -> None:
    """Set up all middleware components for the application."""
    # Configure CORS
    setup_cors( app )
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Configure error handlers
    setup_error_handlers(app)
    
    # Configure request logging
    setup_request_logging(
        app,
        log_request_body=settings.debug
    )
    
    # Configure security
    setup_security(
        app,
        rate_limit=int(settings.get_env('RATE_LIMIT', '100')),
        rate_window=int(settings.get_env('RATE_WINDOW', '60')),
        max_body_size=settings.get_max_content_length()
    )
