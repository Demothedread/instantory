"""
Main ASGI application server for the Bartleby backend.
"""
import os
import logging
import asyncio
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
    app = Quart(__name__)
    
    # Use a try-except block when setting this Flask-specific option
    try:
        app.config['PROVIDE_AUTOMATIC_OPTIONS'] = True
    except (KeyError, AttributeError):
        # Log a warning but continue if this fails
        logger.warning("Could not set PROVIDE_AUTOMATIC_OPTIONS, continuing without it")
    
    app.config.update({
        'DEBUG': os.getenv('DEBUG', 'false').lower() == 'true',
        'SECRET_KEY': os.getenv('JWT_SECRET', 'dev-secret-key'),
        'MAX_CONTENT_LENGTH': int(os.getenv('MAX_UPLOAD_SIZE', str(100 * 1024 * 1024))),  # 100 MB
    })
    
    # Configure CORS
    origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    app = cors(app, 
               allow_origin=origins,
               allow_credentials=True,
               allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Register blueprints
    try:
        # Import blueprints here to avoid circular imports
        from backend.routes.auth_routes import auth_bp, setup_auth
        from backend.routes.documents import documents_bp
        from backend.routes.files import files_bp
        from backend.routes.inventory import inventory_bp
        from backend.routes.process import process_bp
        
        # Set up authentication
        setup_auth(app)
        
        # Register all blueprints
        app.register_blueprint(auth_bp)
        app.register_blueprint(documents_bp)
        app.register_blueprint(files_bp)
        app.register_blueprint(inventory_bp)
        app.register_blueprint(process_bp)
        
        logger.info("All blueprints registered successfully")
    except Exception as e:
        logger.error(f"Error registering blueprints: {e}")
    
    # Root health check
    @app.route('/')
    async def index():
        return jsonify({
            "status": "ok",
            "service": "Bartleby API",
            "version": "1.0",
            "environment": os.getenv("NODE_ENV", "production")
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

    # Set up any background tasks if needed
    @app.before_serving
    async def setup_background_tasks():
        # You can add background tasks setup here
        logger.info("Setting up background tasks")
    
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
