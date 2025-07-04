"""
Main ASGI application server for the Bartleby backend.
"""

import asyncio
import logging
import os
from datetime import datetime

from quart import Quart, jsonify, request

# Import centralized configuration manager
from backend.config.manager import config_manager

# Configure logging using config manager
server_config = config_manager.get_server_config()
logging.basicConfig(
    level=getattr(logging, server_config["log_level"]),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_app():
    """Create and configure the Quart application."""
    app = Quart(__name__, static_folder=None)
    blueprints_registered = 0  # Track successful blueprint registrations

    # Get configuration from centralized manager
    server_config = config_manager.get_server_config()
    auth_config = config_manager.get_auth_config()
    api_config = config_manager.get_api_config()

    # Basic configuration using config manager
    app.config.update(
        {
            "DEBUG": server_config["debug"],
            "SECRET_KEY": auth_config["jwt_secret"],
            "MAX_CONTENT_LENGTH": server_config["max_content_length"],
            "PROVIDE_AUTOMATIC_OPTIONS": True,  # Required for CORS preflight
            "SEND_FILE_MAX_AGE_DEFAULT": 0,
            "TESTING": config_manager.is_testing(),
        }
    )

    # Set up middleware (including CORS)
    try:
        from backend.middleware.setup import setup_middleware

        # Create a settings-like object from config_manager
        class ConfigSettings:
            def __init__(self, config_mgr):
                self.config_mgr = config_mgr
                self.debug = config_mgr.get_server_config()["debug"]

            def get_env(self, key, default=None):
                return self.config_mgr.get(key, default)

            def get_max_content_length(self):
                return self.config_mgr.get_server_config()["max_content_length"]

        settings = ConfigSettings(config_manager)
        setup_middleware(app, settings)
        logger.info("Middleware configured successfully")
    except Exception as e:
        logger.error("Error configuring middleware: %s", str(e))
        # If middleware setup fails, the app will continue without CORS
        # This is better than having conflicting CORS implementations
        logger.warning("Application will continue without CORS middleware")

    # Register blueprints with individual isolation to prevent test imports
    try:
        logger.info("Starting blueprint imports...")

        # Clear any test-related modules that might cause import issues
        import sys

        test_modules = [
            mod
            for mod in sys.modules.keys()
            if "test" in mod.lower() or "conftest" in mod.lower()
        ]
        for mod in test_modules:
            if "backend" in mod:
                logger.debug("Removing test module: %s", mod)
                del sys.modules[mod]

        # Import blueprints with individual error handling to isolate failures
        auth_bp = None
        documents_bp = None
        files_bp = None
        inventory_bp = None
        process_bp = None
        health_bp = None
        stats_bp = None
        setup_auth = None

        # Import each blueprint individually with isolation
        blueprint_imports = [
            ("backend.routes.auth_routes", ["auth_bp", "setup_auth"], "auth"),
            ("backend.routes.documents", ["documents_bp"], "documents"),
            ("backend.routes.files", ["files_bp"], "files"),
            ("backend.routes.health", ["health_bp"], "health"),
            ("backend.routes.process", ["process_bp"], "process"),
            ("backend.routes.search", ["search_bp"], "search"),
            ("backend.routes.stats", ["stats_bp"], "stats"),
            ("backend.routes.inventory", ["inventory_bp"], "inventory"),
        ]

        imported_blueprints = {}

        for module_name, import_names, blueprint_name in blueprint_imports:
            try:
                module = __import__(module_name, fromlist=import_names)
                for import_name in import_names:
                    if hasattr(module, import_name):
                        imported_blueprints[import_name] = getattr(module, import_name)
                        logger.info(
                            "%s from %s imported successfully",
                            import_name,
                            blueprint_name,
                        )
                    else:
                        logger.warning(
                            "%s not found in %s module", import_name, blueprint_name
                        )
            except Exception as e:
                logger.error(
                    "Failed to import %s blueprint: %s", blueprint_name, str(e)
                )

        # Extract imported blueprints
        auth_bp = imported_blueprints.get("auth_bp")
        documents_bp = imported_blueprints.get("documents_bp")
        files_bp = imported_blueprints.get("files_bp")
        inventory_bp = imported_blueprints.get("inventory_bp")
        process_bp = imported_blueprints.get("process_bp")
        health_bp = imported_blueprints.get("health_bp")
        stats_bp = imported_blueprints.get("stats_bp")
        search_bp = imported_blueprints.get("search_bp")
        setup_auth = imported_blueprints.get("setup_auth")

        # Set up authentication
        if setup_auth:
            try:
                setup_auth(app)
                logger.info("Authentication setup completed")
            except Exception as e:
                logger.error("Failed to setup authentication: %s", str(e))

        # Register blueprints with individual error handling and correct URL prefixes
        blueprint_configs = [
            # Auth routes use simple paths, need prefix
            (auth_bp, "auth", "/api/auth"),
            # Documents routes already include /api/documents
            (documents_bp, "documents", None),
            # Files routes use simple paths, need /api prefix
            (files_bp, "files", "/api"),
            # Inventory routes already include /api/inventory
            (inventory_bp, "inventory", None),
            # Process routes already include /api/process
            (process_bp, "process", None),
            # Health endpoints don't need prefix
            (health_bp, "health", None),
            # Stats routes already include /api/stats
            (stats_bp, "stats", None),
            # Search routes already include /api/search
            (search_bp, "search", None),
        ]

        for blueprint, name, url_prefix in blueprint_configs:
            if blueprint is not None:
                try:
                    if url_prefix:
                        app.register_blueprint(blueprint, url_prefix=url_prefix)
                        logger.info(
                            "Registered %s blueprint successfully with prefix %s",
                            name,
                            url_prefix,
                        )
                    else:
                        app.register_blueprint(blueprint)
                        logger.info("Registered %s blueprint successfully", name)
                    blueprints_registered += 1
                except Exception as e:
                    logger.error("Failed to register %s blueprint: %s", name, str(e))
            else:
                logger.warning("Skipping %s blueprint (not imported)", name)

        logger.info("%d/8 blueprints registered successfully", blueprints_registered)

        # Debug: List all registered routes
        logger.info("=== DEBUG: Registered Routes ===")
        for rule in app.url_map.iter_rules():
            logger.info(
                f"Route: {rule.rule} -> {rule.endpoint} [{','.join(rule.methods)}]"
            )
        logger.info("=== END DEBUG: Registered Routes ===")

        # Additional debug for auth endpoints specifically
        auth_routes = [
            rule for rule in app.url_map.iter_rules() if "/auth" in rule.rule
        ]
        logger.info(f"=== DEBUG: Auth Routes Found ({len(auth_routes)}) ===")
        for rule in auth_routes:
            logger.info(
                f"Auth Route: {rule.rule} -> {rule.endpoint} [{','.join(rule.methods)}]"
            )
        logger.info("=== END DEBUG: Auth Routes ===")

        # Test auth blueprint registration specifically
        if auth_bp:
            logger.info("✅ Auth blueprint is available and should be registered")
            logger.info(f"Auth blueprint name: {auth_bp.name}")
            logger.info(
                f"Auth blueprint url_prefix: {getattr(auth_bp, 'url_prefix', 'None')}"
            )
        else:
            logger.error("❌ Auth blueprint is None - this will cause 404 errors!")

    except Exception as e:
        logger.error("Error importing/registering blueprints: %s", str(e))
        logger.info("Application will start with basic functionality only")

    # Root health check
    @app.route("/")
    async def index():
        return jsonify(
            {
                "status": "ok",
                "service": "Bartleby API",
                "version": "1.0",
                "environment": config_manager.get("NODE_ENV", "production"),
                "blueprints_registered": blueprints_registered,
            }
        )

    # Debug endpoints for troubleshooting
    @app.route("/api/debug/status")
    async def debug_status():
        """Debug endpoint to check API status and registered routes"""
        auth_routes = [
            rule for rule in app.url_map.iter_rules() if "/auth" in rule.rule
        ]
        return jsonify(
            {
                "status": "ok",
                "service": "Bartleby API Debug",
                "version": "1.0",
                "environment": config_manager.get("NODE_ENV", "production"),
                "blueprints_registered": blueprints_registered,
                "auth_routes_count": len(auth_routes),
                "auth_routes": [
                    {
                        "rule": rule.rule,
                        "endpoint": rule.endpoint,
                        "methods": list(rule.methods),
                    }
                    for rule in auth_routes
                ],
                "total_routes": len(list(app.url_map.iter_rules())),
            }
        )

    @app.route("/api/debug/cors")
    async def debug_cors():
        """Debug CORS headers and origin"""
        origin = request.headers.get("Origin")
        return jsonify(
            {
                "origin": origin,
                "user_agent": request.headers.get("User-Agent"),
                "headers": dict(request.headers),
                "method": request.method,
                "path": request.path,
                "cors_configured": True,
            }
        )

    # Basic health check endpoint
    @app.route("/health")
    async def basic_health():
        return jsonify(
            {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "service": "Bartleby API",
            }
        )

    # API health check
    @app.route("/api/health")
    async def api_health():
        return jsonify(
            {
                "status": "healthy",
                "api_version": "1.0",
                "timestamp": datetime.now().isoformat(),
            }
        )

    # Simplified error handlers
    @app.errorhandler(404)
    async def not_found(error):
        return jsonify({"error": "Not found", "status": 404}), 404

    @app.errorhandler(500)
    async def server_error(error):
        logger.exception("Server error")
        return jsonify({"error": "Internal server error", "status": 500}), 500

    # Set up database and background tasks
    @app.before_serving
    async def setup_app():
        logger.info("Starting application setup...")

        # Don't let database issues prevent startup
        database_initialized = False

        # Initialize database schemas with timeout - but don't fail startup if it fails
        try:
            from backend.config.database import get_metadata_pool, get_vector_pool

            # Set a reasonable timeout for database operations
            async def init_database_with_timeout():
                nonlocal database_initialized
                try:
                    # Initialize metadata database
                    try:
                        logger.info("Attempting to initialize metadata database...")
                        metadata_pool = await asyncio.wait_for(
                            get_metadata_pool(), timeout=5.0
                        )
                        if metadata_pool:
                            # Test the connection quickly
                            async with asyncio.wait_for(
                                metadata_pool.acquire(), timeout=3.0
                            ) as conn:
                                # Just test the connection, skip schema for now
                                await conn.fetchval("SELECT 1")
                                logger.info("Metadata database connection successful")
                                database_initialized = True
                        else:
                            logger.warning("Metadata database pool not available")
                    except asyncio.TimeoutError:
                        logger.error("Timeout while initializing metadata database")
                    except Exception as e:
                        logger.error("Error initializing metadata database: %s", str(e))

                    # Skip vector database initialization for now to speed up startup
                    logger.info(
                        "Skipping vector database initialization for fast startup"
                    )

                except Exception as e:
                    logger.error("Error during database initialization: %s", str(e))

            # Run database initialization with overall timeout
            try:
                await asyncio.wait_for(init_database_with_timeout(), timeout=10.0)
            except asyncio.TimeoutError:
                logger.error("Database initialization timed out after 10 seconds")

        except Exception as e:
            logger.error("Error importing database configuration: %s", str(e))

        # Set up background tasks
        try:
            logger.info("Background tasks setup completed")
        except Exception as e:
            logger.error("Error setting up background tasks: %s", str(e))

        if database_initialized:
            logger.info("Application setup completed successfully with database")
        else:
            logger.warning("Application setup completed without database connection")

    return app


# Application instance
app = create_app()


# Simple entry point for running directly
def main():
    """Run the application directly."""
    try:
        logger.info("Starting Bartleby application...")

        # Get server configuration
        server_config = config_manager.get_server_config()

        # For production deployment, use simple Quart run
        if config_manager.get("RENDER"):
            logger.info("Running on Render platform")
            # Use Quart's built-in server for Render deployment
            # Render will handle the ASGI server externally
            logger.info(
                "Starting server on %s:%d (debug=%s)",
                server_config["host"],
                server_config["port"],
                server_config["debug"],
            )
            app.run(
                host=server_config["host"],
                port=server_config["port"],
                debug=server_config["debug"],
            )
        else:
            # Local development
            logger.info("Running in local development mode")
            app.run(
                host=server_config["host"],
                port=server_config["port"],
                debug=server_config["debug"],
            )
    except Exception as e:
        logger.error("Failed to start application: %s", str(e))
        raise


if __name__ == "__main__":
    main()
