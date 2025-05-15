"""
Main ASGI application server for the Bartleby backend.
"""
import os
import logging
from quart import Quart
from quart_cors import cors

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the app object
app = Quart(__name__)

# Load configuration from environment
app.config.update({
    'SECRET_KEY': os.getenv('JWT_SECRET', 'dev-secret-key'),
    'QUART_AUTH_COOKIE_SECURE': True,
    'QUART_AUTH_COOKIE_SAMESITE': 'None',
    'QUART_AUTH_COOKIE_DOMAIN': None,
})

# Get CORS settings from environment
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
cors_enabled = os.getenv('CORS_ENABLED', 'true').lower() == 'true'
allow_credentials = os.getenv('ALLOW_CREDENTIALS', 'true').lower() == 'true'

# Apply CORS if enabled
if cors_enabled:
    app = cors(
        app,
        allow_origin=cors_origins,
        allow_credentials=allow_credentials
    )

# Import and register blueprints
try:
    from backend.routes.auth_routes import auth_bp, setup_auth
    
    # Set up authentication
    setup_auth(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    logger.info("Authentication routes registered successfully")
except ImportError as e:
    logger.error(f"Failed to import auth routes: {e}")
    logger.error("Authentication will not be available")

# Root route for health check
@app.route('/')
async def index():
    """Health check endpoint."""
    return {"status": "ok", "message": "Bartleby API server is running"}

# Error handler for 404 Not Found
@app.errorhandler(404)
async def not_found(error):
    """Handle 404 errors."""
    return {"error": "Not Found", "message": "The requested resource does not exist"}, 404

# Error handler for 500 Internal Server Error
@app.errorhandler(500)
async def server_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return {"error": "Internal Server Error", "message": "An unexpected error occurred"}, 500

# Main function to run the app - used by entry_point in setup.py
def main():
    """Run the application."""
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)

# Start the server when run directly
if __name__ == '__main__':
    main()
