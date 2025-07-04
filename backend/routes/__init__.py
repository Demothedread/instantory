"""Route handlers for the backend application."""

import logging

logger = logging.getLogger(__name__)

# Import blueprints with error handling to prevent startup failures
auth_bp = None
documents_bp = None
files_bp = None
inventory_bp = None
process_bp = None
search_bp = None
stats_bp = None
health_bp = None

try:
    from .auth_routes import auth_bp

    logger.info("✅ Auth blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import auth blueprint: %s", e)

try:
    from .documents import documents_bp

    logger.info("✅ Documents blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import documents blueprint: %s", e)

try:
    from .files import files_bp

    logger.info("✅ Files blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import files blueprint: %s", e)

try:
    from .health import health_bp

    logger.info("✅ Health blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import health blueprint: %s", e)

try:
    from .process import process_bp

    logger.info("✅ Process blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import process blueprint: %s", e)

try:
    from .search import search_bp

    logger.info("✅ Search blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import search blueprint: %s", e)

try:
    from .stats import stats_bp

    logger.info("✅ Stats blueprint imported successfully")
except Exception as e:
    logger.error("❌ Failed to import stats blueprint: %s", e)

# Import inventory blueprint last as it has complex dependencies
try:
    from .inventory import inventory_bp

    logger.info("✅ Inventory blueprint imported successfully")
except Exception as e:
    logger.warning(
        "⚠️  Failed to import inventory blueprint (may be due to missing env vars): %s",
        e,
    )

__all__ = [
    "inventory_bp",
    "documents_bp",
    "files_bp",
    "auth_bp",
    "process_bp",
    "search_bp",
    "stats_bp",
    "health_bp",
]
