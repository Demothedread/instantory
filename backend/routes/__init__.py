"""Route handlers for the backend application."""
from .inventory import inventory_bp
from .documents import documents_bp
from .files import files_bp
from .auth_routes import auth_bp
from .process import process_bp
from .search import search_bp
from .stats import stats_bp
from .health import health_bp
# Import process_bp if process route exists
# from process import process_bp

__all__ = ['inventory_bp', 'documents_bp', 'files_bp', 'auth_bp','process_bp', 'search_bp', 'stats_bp', 'health_bp']  # routes  should match the imported blueprints, which should be defined in respective files in routes directory.