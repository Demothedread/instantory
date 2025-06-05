   backend/server.py   
"""
Main ASGI application server for the Bartleby backend.
"""

import os
import logging
import asyncio
from datetime import datetime
from quart import Quart, jsonify
from quart_cors import cors

Import centralized configuration
from backend.config.manager import config_manager

Configure logging using centralized config
server_config = config_manager.get_server_config()
   logging.basicConfig(
level=getattr(logging, server_config['log_level']),
format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(name)

def create_app():
"""Create and configure the Quart application with optimized setup."""
app = Quart(name, static_folder=None)
blueprints_registered = 0


# Use centralized configuration
app.config.update({
    'DEBUG': config_manager.is_debug(),
    'SECRET_KEY': config_manager.get_auth_config()['jwt_secret'],
    'MAX_CONTENT_LENGTH': server_config['max_content_length'],
    'PROVIDE_AUTOMATIC_OPTIONS': True,
    'SEND_FILE_MAX_AGE_DEFAULT': 0,
    'TESTING': config_manager.is_testing(),
})

# Configure CORS using centralized config
api_config = config_manager.get_api_config()
if api_config['cors_enabled']:
    try:
        app = cors(app, 
                   allow_origin=api_config['cors_origins'],
                   allow_credentials=api_config['allow_credentials'],
                   allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                   allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"])
        logger.info(f"CORS configured with origins: {api_config['cors_origins']}")
    except Exception as e:
        logger.error(f"Error configuring CORS: {e}")
        from quart_cors import cors as simple_cors
        app = simple_cors(app)

# Register blueprints with optimized error handling
try:
    # Clear any test-related modules to prevent import issues
    import sys
    test_modules = [mod for mod in sys.modules.keys() if 'test' in mod.lower() or 'conftest' in mod.lower()]
    for mod in test_modules:
        if 'backend' in mod:
            logger.debug(f"Removing test module: {mod}")
            del sys.modules[mod]
    
    # Import blueprints with individual error handling
    blueprint_imports = [
        ('backend.routes.auth_routes', ['auth_bp', 'setup_auth'], 'auth', '/api/auth'),
        ('backend.routes.documents', ['documents_bp'], 'documents', None),
        ('backend.routes.files', ['files_bp'], 'files', '/api'),
        ('backend.routes.inventory', ['inventory_bp'], 'inventory', None),
        ('backend.routes.process', ['process_bp'], 'process', None),
        ('backend.routes.health', ['health_bp'], 'health', None)
    ]
    
    imported_blueprints = {}
    
    for module_name, import_names, blueprint_name, url_prefix in blueprint_imports:
        try:
            module = __import__(module_name, fromlist=import_names)
            for import_name in import_names:
                if hasattr(module, import_name):
                    imported_blueprints[import_name] = getattr(module, import_name)
                    logger.info(f"{import_name} from {blueprint_name} imported successfully")
                else:
                    logger.warning(f"{import_name} not found in {blueprint_name} module")
        except Exception as e:
            logger.error(f"Failed to import {blueprint_name} blueprint: {e}")
    
    # Set up authentication
    setup_auth = imported_blueprints.get('setup_auth')
    if setup_auth:
        try:
            setup_auth(app)
            logger.info("Authentication setup completed")
        except Exception as e:
            logger.error(f"Failed to setup authentication: {e}")
    
    # Register blueprints
    blueprint_configs = [
        ('auth_bp', 'auth', '/api/auth'),
        ('documents_bp', 'documents', None),
        ('files_bp', 'files', '/api'),
        ('inventory_bp', 'inventory', None),
        ('process_bp', 'process', None),
        ('health_bp', 'health', None)
    ]
    
    for blueprint_name, name, url_prefix in blueprint_configs:
        blueprint = imported_blueprints.get(blueprint_name)
        if blueprint is not None:
            try:
                if url_prefix:
                    app.register_blueprint(blueprint, url_prefix=url_prefix)
                    logger.info(f"Registered {name} blueprint with prefix {url_prefix}")
                else:
                    app.register_blueprint(blueprint)
                    logger.info(f"Registered {name} blueprint")
                blueprints_registered += 1
            except Exception as e:
                logger.error(f"Failed to register {name} blueprint: {e}")
        else:
            logger.warning(f"Skipping {name} blueprint (not imported)")
    
    logger.info(f"{blueprints_registered}/6 blueprints registered successfully")
except Exception as e:
    logger.error(f"Error importing/registering blueprints: {e}")

# Optimized health endpoints
@app.route('/')
async def index():
    return jsonify({
        "status": "ok",
        "service": "Instantory API",
        "version": "1.0.0",
        "environment": config_manager.get('ENVIRONMENT', 'development'),
        "blueprints_registered": blueprints_registered,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health')
async def basic_health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Instantory API"
    })

@app.route('/api/health/detailed')
async def detailed_health():
    """Comprehensive health check using centralized configuration."""
    try:
        # Check configuration health
        config_validations = config_manager.validate_required_config()
        
        # Check services if available
        services_health = {"configuration": config_validations}
        
        try:
            from backend.services import check_services_health
            service_checks = await check_services_health()
            services_health.update(service_checks)
        except Exception as e:
            logger.warning(f"Service health check failed: {e}")
            services_health["services_check"] = {"status": "unavailable", "error": str(e)}
        
        overall_status = "healthy"
        for service_name, service_status in services_health.items():
            if isinstance(service_status, dict) and service_status.get('status') == 'unhealthy':
                overall_status = "degraded"
                break
        
        return jsonify({
            "status": overall_status,
            "timestamp": datetime.now().isoformat(),
            "services": services_health,
            "environment": config_manager.get('ENVIRONMENT', 'development'),
            "debug_mode": config_manager.is_debug()
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Centralized error handlers
@app.errorhandler(404)
async def not_found(error):
    return jsonify({
        "error": "Resource not found",
        "status": 404,
        "timestamp": datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
async def server_error(error):
    logger.exception("Server error")
    return jsonify({
        "error": "Internal server error",
        "status": 500,
        "timestamp": datetime.now().isoformat()
    }), 500

@app.errorhandler(503)
async def service_unavailable(error):
    return jsonify({
        "error": "Service temporarily unavailable",
        "status": 503,
        "timestamp": datetime.now().isoformat()
    }), 503

# Optimized application setup
@app.before_serving
async def setup_app():
    """Initialize application with centralized configuration."""
    logger.info("Initializing application...")
    
    # Validate configuration
    validations = config_manager.validate_required_config()
    missing_config = [k for k, v in validations.items() if not v]
    if missing_config:
        logger.warning(f"Missing configuration: {missing_config}")
    
    # Initialize databases with timeout to prevent startup delays
    try:
        async def init_databases():
            from backend.config.database import get_metadata_pool, get_vector_pool
            
            # Initialize metadata database
            try:
                metadata_pool = await asyncio.wait_for(get_metadata_pool(), timeout=5.0)
                if metadata_pool:
                    logger.info("Metadata database pool initialized")
                else:
                    logger.error("Failed to initialize metadata database pool")
            except asyncio.TimeoutError:
                logger.error("Metadata database initialization timed out")
            
            # Initialize vector database (optional)
            try:
                vector_pool = await asyncio.wait_for(get_vector_pool(), timeout=3.0)
                if vector_pool:
                    logger.info("Vector database pool initialized")
                else:
                    logger.warning("Vector database pool not available")
            except asyncio.TimeoutError:
                logger.warning("Vector database initialization timed out")
        
        await asyncio.wait_for(init_databases(), timeout=10.0)
    except asyncio.TimeoutError:
        logger.error("Database initialization timed out after 10 seconds")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

    logger.info("Application initialization completed")

# Cleanup on shutdown
@app.after_serving
async def cleanup_app():
    """Clean up resources on shutdown."""
    try:
        from backend.config.database import close_pools
        await close_pools()
        logger.info("Database pools closed")
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

return app
Application instance
app = create_app()

def main():
"""Run the application with optimized configuration."""
server_config = config_manager.get_server_config()


logger.info(f"Starting Instantory API on port {server_config['port']} (debug={server_config['debug']})")

try:
    if os.getenv('RENDER'):
        logger.info("Running on Render platform")
    
    app.run(
        host=server_config['host'], 
        port=server_config['port'],
        debug=server_config['debug']
    )
except Exception as e:
    logger.error(f"Failed to start application: {e}")
    raise
if name == 'main':
main()
