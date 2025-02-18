"""Route handlers for the backend application."""

from .inventory import inventory_bp
from .documents import documents_bp
from .files import files_bp
from .auth_routes import auth_bp

__all__ = ['inventory_bp', 'documents_bp', 'files_bp', 'auth_bp']
f