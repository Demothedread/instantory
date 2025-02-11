"""Middleware setup for the backend application."""

from typing import Dict, Any
from quart import Quart

from .cors import setup_cors
from .error_handlers import setup_error_handlers
from .request_logger import setup_request_logging
from .security import setup_security

def setup_middleware(app: Quart, config: Dict[str, Any]) -> None:
    """Set up all middleware components for the application."""
    # Configure CORS
    setup_cors(app)
    
    # Configure error handlers
    setup_error_handlers(app)
    
    # Configure request logging
    setup_request_logging(
        app,
        log_request_body=config.get('log_request_body', False)
    )
    
    # Configure security
    setup_security(
        app,
        rate_limit=config.get('rate_limit', 100),
        rate_window=config.get('rate_window', 60),
        max_body_size=config.get('max_body_size', 16 * 1024 * 1024)
    )
