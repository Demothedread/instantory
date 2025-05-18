"""
Main ASGI application server for the Bartleby backend.
"""
import os
import logging
import sys
from quart import Quart, jsonify, request

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the app object
app = Quart(__name__)

# Configure options for compatibility with different ASGI servers
app.config.update({
    # Setting Flask-compatible options to avoid KeyError
    'PROVIDE_AUTOMATIC_OPTIONS': True,
    'DEBUG': os.getenv('DEBUG', 'false').lower() == 'true',
    'MAX_CONTENT_LENGTH': int(os.getenv('MAX_UPLOAD_SIZE', str(100 * 1024 * 1024))),  # 100 MB default
    # Authentication settings
    'SECRET_KEY': os.getenv('JWT_SECRET', 'dev-secret-key'),
    'QUART_AUTH_COOKIE_SECURE': True,
    'QUART_AUTH_COOKIE_SAMESITE': 'None',
    'QUART_AUTH_COOKIE_DOMAIN': None,
}) 

# Get CORS settings from the central security config
try:
    from backend.config.security import CORSConfig
    cors_origins = CORSConfig.get_origins()
    cors_enabled = os.getenv('CORS_ENABLED', 'true').lower() == 'true'
    allow_credentials = os.getenv('ALLOW_CREDENTIALS', 'true').lower() == 'true'
    
    logger.info(f"CORS enabled: {cors_enabled}, Origins: {cors_origins}")
except ImportError:
    logger.warning("Failed to import CORSConfig, using default CORS settings")
    # Get CORS origins from environment and strip any whitespace
    cors_origins_raw = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    cors_origins = [origin.strip() for origin in cors_origins_raw if origin.strip()]
    
    # Add standard domains if not already included
    standard_domains = [
        "https://hocomnia.com",
        "https://www.hocomnia.com",
        "https://bartleby.vercel.app",
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://accounts.google.com"
    ]
    
    # Add any missing standard domains to the CORS origin list
    for domain in standard_domains:
        if domain not in cors_origins:
            cors_origins.append(domain)
    
    # Log the final CORS origins
    logger.info(f"CORS origins set to: {cors_origins}")

# Define default headers and methods for CORS
default_headers = [
    "Content-Type", "Authorization", "Accept", "Origin", 
    "X-Requested-With", "Content-Length", "Accept-Encoding",
    "X-CSRF-Token", "google-oauth-token", "google-client-id",
    "g-csrf-token", "X-Google-OAuth-Token", "X-Google-Client-ID"
]

default_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]

# Apply CORS if enabled
if cors_enabled:
    try:
        from backend.middleware.cors import setup_cors
        app = setup_cors(app)
        logger.info("Applied custom CORS setup from middleware")
    except ImportError:
        from quart_cors import cors
        logger.info("Using built-in quart_cors for CORS configuration")
        app = cors(
            app,
            allow_origin=cors_origins,
            allow_credentials=allow_credentials,
            allow_methods=default_methods,
            allow_headers=default_headers
        )

# Import and register blueprints
try:
    from backend.routes.auth_routes import auth_bp, setup_auth
    # Set up authentication
    setup_auth(app)
    # Register blueprint
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    logger.info("Registered auth blueprint")
except ImportError as e:
    logger.error(f"Failed to import auth blueprint: {e}")
    # Continue running even if auth routes aren't available
    # This helps with debugging deployment issues

# Root route for health check and diagnostics
@app.route('/')
async def index():
    """Health check and diagnostic route."""
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    
    # Collect diagnostics
    diagnostics = {
        "status": "ok",
        "service": "Bartleby API",
        "python_version": python_version,
        "environment": os.getenv("NODE_ENV", "production"),
        "debug_mode": app.debug,
        "cors_enabled": cors_enabled,
        "origins": cors_origins,
        "google_client_id_configured": bool(os.getenv("GOOGLE_CLIENT_ID")),
        "database_configured": bool(os.getenv("DATABASE_URL")),
        "blueprints": list(app.blueprints.keys())
    }
    
    # Include headers in debug mode
    if app.debug:
        diagnostics["request_headers"] = dict(request.headers)
    
    return jsonify(diagnostics)

# Error handler for 404 Not Found
@app.errorhandler(404)
async def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Not found", "status": 404}), 404

# Error handler for 500 Internal Server Error
@app.errorhandler(500)
async def server_error(error):
    """Handle 500 errors."""
    logger.exception("Unhandled server error")
    return jsonify({"error": "Internal server error", "status": 500}), 500

# Application factory function for more flexibility in deployments
def create_app():
    """Create and configure the Quart application."""
    # Application is already created and configured at module level
    # This function exists for compatibility with some ASGI servers
    return app

# Main function to run the app directly
def main():
    """Run the application directly."""
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))

# Start the server when run directly
if __name__ == '__main__':
    main()
