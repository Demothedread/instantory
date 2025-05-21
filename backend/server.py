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
        from backend.routes.process import process_bp
        from backend.routes.inventory import inventory_bp
        
        # Set up authentication
        setup_auth(app)
        
        # Register blueprints
        app.register_blueprint(auth_bp)
        app.register_blueprint(documents_bp)
        app.register_blueprint(files_bp)
        app.register_blueprint(process_bp)
        app.register_blueprint(inventory_bp)
        
        logger.info("All blueprints registered successfully")
    except Exception as e:
        logger.error(f"Error registering blueprints: {e}")
    
    # Root health check
    @app.route('/')
    async def index():
        return jsonify({
            "status": "ok",
            "service": "Bartleby API"
        })
    
    # Simplified error handlers
    @app.errorhandler(404)
    async def not_found(error):
        return jsonify({"error": "Not found", "status": 404}), 404
    
    @app.errorhandler(500)
    async def server_error(error):
        logger.exception("Server error")
        return jsonify({"error": "Internal server error", "status": 500}), 500
    
    # Set up task cleanup in background
    @app.before_serving
    async def setup_task_cleanup():
        from backend.task_manager import setup_task_cleanup
        app.add_background_task(setup_task_cleanup)
    
    return app

# Application instance
app = create_app()

# Simple entry point for running directly
def main():
    app.run(
        host='0.0.0.0', 
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )

if __name__ == '__main__':
    main()
