"""Middleware components for the backend application."""

from .cors import setup_cors
from .error_handlers import setup_error_handlers
from .request_logger import setup_request_logging as setup_request_logger
from .security import setup_security
from .setup import setup_middleware

__all__ = [
    'setup_cors',
    'setup_error_handlers',
    'setup_request_logger',
    'setup_security',
    'setup_middleware'
]
