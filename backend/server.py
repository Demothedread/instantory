"""
Main ASGI application server for the Bartleby backend.
"""
import os
import logging
from quart import Quart, jsonify, request
from quart_cors import cors

# Import blueprints at the module level
from backend.routes.auth_routes import auth_bp, setup_auth
try:
    from backend.routes.documents import documents_bp
except Exception as e:
    documents_bp = None
    logging.getLogger(__name__).error(f"Failed to import documents_bp: {e}")
from backend.routes.files import files_bp

if auth_bp and setup_auth and documents_bp and files_bp:
    # Add any other blueprints needed here
    BLUEPRINTS_IMPORTED = True
else:
    BLUEPRINTS_IMPORTED = False

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log import errors if any occurred
if not BLUEPRINTS_IMPORTED:
    logger.error("Failed to import blueprints")

def create_app():
    """Create and configure the Quart application - app factory pattern."""
    app = Quart(__name__)
    
    # Essential configuration
    app.config.update({
        'SECRET_KEY': os.getenv('JWT_SECRET', 'dev-secret-key'),
        'MAX_CONTENT_LENGTH': int(os.getenv('MAX_UPLOAD_SIZE', str(100 * 1024 * 1024))),  # 100 MB
        'QUART_AUTH_COOKIE_SECURE': True,
        'QUART_AUTH_COOKIE_SAMESITE': 'None',
        'QUART_AUTH_COOKIE_DOMAIN': None,
    })
    
    # Simplified CORS configuration
    frontend_url = os.getenv('FRONTEND_URL', 'https://hocomnia.com')
    cors_origins = [
        frontend_url,
        "https://hocomnia.com",
        "https://www.hocomnia.com", 
        "https://bartleby.vercel.app",
        "http://localhost:3000",
        "https://accounts.google.com"
    ]
    
    # Apply CORS
    app = cors(
        app,
        allow_origin=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Content-Type", "Authorization", "Accept", "Origin", 
            "X-Requested-With", "Content-Length", "Accept-Encoding",
            "X-CSRF-Token", "google-oauth-token", "google-client-id",
            "g-csrf-token", "X-Google-OAuth-Token", "X-Google-Client-ID"
        ]
    )
    
    # Register blueprints if imports were successful
    if BLUEPRINTS_IMPORTED:
        try:
            # Set up auth and register blueprints
            setup_auth(app)
            app.register_blueprint(auth_bp, url_prefix='/api/auth')
            logger.info("Registered auth blueprint")
            
            app.register_blueprint(documents_bp, url_prefix='/api/documents')
            logger.info("Registered documents blueprint")
            
            app.register_blueprint(files_bp, url_prefix='/api/files')
            logger.info("Registered files blueprint")
            
            # Register any other blueprints here
        except Exception as e:
            logger.error(f"Failed to register blueprints: {e}")
    else:
        logger.error("Skipping blueprint registration due to import errors")
    
    # Root health check
    @app.route('/')
    async def index():
        return jsonify({
            "status": "ok",
            "service": "Bartleby API",
            "endpoints": {
                "auth": "/api/auth",
                "documents": "/api/documents",
                "files": "/api/files"
            }
        })
    
    # Simplified error handlers
    @app.errorhandler(404)
    async def not_found(error):
        return jsonify({"error": "Not found", "status": 404}), 404
    
    @app.errorhandler(500)
    async def server_error(error):
        logger.exception("Server error")
        return jsonify({"error": "Internal server error", "status": 500}), 500
    
    return app

# Simple entry point for running directly
def main():
    app = create_app()
    app.run(
        host='0.0.0.0', 
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )

if __name__ == '__main__':
    main()
