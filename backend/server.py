"""
Main ASGI application server for the Bartleby backend.
"""
import os
import logging
import asyncio
from datetime import datetime
from quart import Quart, jsonify
from quart_cors import cors

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Quart application."""
    app = Quart(__name__, static_folder=None)
    blueprints_registered = 0  # Track successful blueprint registrations
    
    # Basic configuration
    app.config.update({
        'DEBUG': os.getenv('DEBUG', 'false').lower() == 'true',
        'SECRET_KEY': os.getenv('JWT_SECRET', 'dev-secret-key'),
        'MAX_CONTENT_LENGTH': int(os.getenv('MAX_UPLOAD_SIZE', str(100 * 1024 * 1024))),  # 100 MB
        'PROVIDE_AUTOMATIC_OPTIONS': True,  # Required for CORS preflight
        'SEND_FILE_MAX_AGE_DEFAULT': 0,
        'TESTING': False,
    })
    
    # Configure CORS
    origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    try:
        app = cors(app, 
                   allow_origin=origins,
                   allow_credentials=True,
                   allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                   allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"])
        logger.info(f"CORS configured with origins: {origins}")
    except Exception as e:
        logger.error(f"Error configuring CORS: {e}")
        # Fallback CORS configuration
        from quart_cors import cors as simple_cors
        app = simple_cors(app)
    
    # Register blueprints
    try:
        # Import blueprints here to avoid circular imports
        from backend.routes.auth_routes import auth_bp, setup_auth
        from backend.routes.documents import documents_bp
        from backend.routes.files import files_bp
        from backend.routes.inventory import inventory_bp
        from backend.routes.process import process_bp
        from backend.routes.health import health_bp
        
        # Set up authentication
        try:
            setup_auth(app)
            logger.info("Authentication setup completed")
        except Exception as e:
            logger.error(f"Failed to setup authentication: {e}")
        
        # Register blueprints with individual error handling
        blueprint_configs = [
            (auth_bp, "auth"),
            (documents_bp, "documents"), 
            (files_bp, "files"),
            (inventory_bp, "inventory"),
            (process_bp, "process"),
            (health_bp, "health")
        ]
        
        for blueprint, name in blueprint_configs:
            try:
                app.register_blueprint(blueprint)
                blueprints_registered += 1
                logger.info(f"Registered {name} blueprint successfully")
            except Exception as e:
                logger.error(f"Failed to register {name} blueprint: {e}")
        
        logger.info(f"{blueprints_registered}/6 blueprints registered successfully")
    except Exception as e:
        logger.error(f"Error importing/registering blueprints: {e}")
        logger.info("Application will start with basic functionality only")
    
    # Root health check
    @app.route('/')
    async def index():
        return jsonify({
            "status": "ok",
            "service": "Bartleby API",
            "version": "1.0",
            "environment": os.getenv("NODE_ENV", "production"),
            "blueprints_registered": blueprints_registered
        })
    
    # Basic health check endpoint
    @app.route('/health')
    async def basic_health():
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "Bartleby API"
        })
    
    # API health check
    @app.route('/api/health')
    async def api_health():
        return jsonify({
            "status": "healthy",
            "api_version": "1.0",
            "timestamp": datetime.now().isoformat()
        })
    
    # Simplified error handlers
    @app.errorhandler(404)
    async def not_found(error):
        return jsonify({
            "error": "Not found",
            "status": 404
        }), 404

    @app.errorhandler(500)
    async def server_error(error):
        logger.exception("Server error")
        return jsonify({
            "error": "Internal server error",
            "status": 500
        }), 500

    # Set up database and background tasks
    @app.before_serving
    async def setup_app():
        # Initialize database schemas
        try:
            from backend.config.database import get_metadata_pool, get_vector_pool
            
            # Initialize metadata database
            try:
                metadata_pool = await get_metadata_pool()
                if metadata_pool:
                    async with metadata_pool.acquire() as conn:
                        # Apply metadata schema
                        if os.path.exists('backend/init_metadata_db.sql'):
                            with open('backend/init_metadata_db.sql', 'r', encoding='utf-8') as f:
                                await conn.execute(f.read())
                            logger.info("Metadata database schema initialized")
                        
                        # Apply upload tracking schema
                        if os.path.exists('backend/upload_tracking_schema.sql'):
                            with open('backend/upload_tracking_schema.sql', 'r', encoding='utf-8') as f:
                                await conn.execute(f.read())
                            logger.info("Upload tracking schema initialized")
                else:
                    logger.warning("Metadata database pool not available")
            except Exception as e:
                logger.error(f"Error initializing metadata database: {e}")
            
            # Initialize vector database if separate
            try:
                vector_pool = await get_vector_pool()
                if vector_pool and vector_pool != metadata_pool:
                    async with vector_pool.acquire() as conn:
                        if os.path.exists('backend/init_vector_db.sql'):
                            with open('backend/init_vector_db.sql', 'r', encoding='utf-8') as f:
                                await conn.execute(f.read())
                            logger.info("Vector database schema initialized")
                else:
                    logger.info("Vector database uses same pool as metadata or not configured")
            except Exception as e:
                logger.error(f"Error initializing vector database: {e}")
                        
        except Exception as e:
            logger.error(f"Error importing database configuration: {e}")

        # Set up background tasks
        try:
            # Background tasks can be added here
            logger.info("Background tasks setup completed")
        except Exception as e:
            logger.error(f"Error setting up background tasks: {e}")
    
    return app

# Application instance
app = create_app()

# Simple entry point for running directly
def main():
    """Run the application directly."""
    app.run(
        host='0.0.0.0', 
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )

if __name__ == '__main__':
    main()
