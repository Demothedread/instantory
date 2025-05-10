"""Middleware setup for the backend application."""

from typing import Dict, Any
from quart import Quart
from .cors import setup_cors
from .error_handlers import setup_error_handlers
from .request_logger import setup_request_logging
from .security import setup_security


def setup_middleware(app: Quart, settings: Any) -> None:
    """
    Set up all middleware components for the application.

    Args:
        app: The Quart application instance
        settings: Application settings

    Note:
        The order of middleware setup is important:
        1. CORS must be first to handle preflight requests
        2. Security middleware should be next
        3. Error handlers and request logging can come after
    """
    # Configure CORS first to handle preflight requests
    app = setup_cors(app)

    # Configure security with settings from config
    app = setup_security(
        app,
        rate_limit=int(settings.get_env("RATE_LIMIT", "100")),
        rate_window=int(settings.get_env("RATE_WINDOW", "60")),
        max_body_size=settings.get_max_content_length(),
    )

    # Configure error handlers
    setup_error_handlers(app)

    # Configure request logging
    setup_request_logging(app, log_request_body=settings.debug)

    # Register blueprints after middleware setup
    # (Blueprint registration is typically done in the main app file,
    # but if there are auth-specific blueprints, they can be registered here)
