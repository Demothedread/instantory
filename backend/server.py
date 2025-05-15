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
                                                                                                                                                                             
# Add Flask compatibility configuration to handle PROVIDE_AUTOMATIC_OPTIONS
app.config['PROVIDE_AUTOMATIC_OPTIONS'] = True 

# Load configuration from environment
app.config.update({
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
        "http://localhost:3000"
    ]
    
    # Add any missing standard domains to the CORS origin list
    for domain in standard_domains:
        if domain not in cors_origins:
            cors_origins.append(domain)
    
    # Log the final CORS origins
    logger.info(f"CORS origins set to: {cors_origins}")
    
    cors_enabled = os.getenv('CORS_ENABLED', 'true').lower() == 'true'
    allow_credentials = os.getenv('ALLOW_CREDENTIALS', 'true').lower() == 'true'

# Define default headers and methods if CORSConfig is not available
default_headers = [
    "Content-Type", "Authorization", "Accept", "Origin", 
    "X-Requested-With", "Content-Length", "Accept-Encoding",
    "X-CSRF-Token", "google-oauth-token", "google-client-id"
]

default_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]

# Apply CORS if enabled
if cors_enabled:
    try:
        headers = CORSConfig.get_headers() if 'CORSConfig' in locals() else default_headers
        methods = CORSConfig.get_methods() if 'CORSConfig' in locals() else default_methods
        
        app = cors(
            app,
            allow_origin=cors_origins,
            allow_credentials=allow_credentials,
            allow_headers=headers,
            allow_methods=methods
        )
        logger.info(f"CORS applied with {len(cors_origins)} origins, {len(headers)} headers, {len(methods)} methods")
    except Exception as e:
        logger.error(f"Error applying CORS: {e}")
        # Fallback to minimal CORS settings
        app = cors(
            app,
            allow_origin=["https://hocomnia.com", "http://localhost:3000"],
            allow_credentials=True,
            allow_headers=["*"],
            allow_methods=["GET", "POST", "OPTIONS"]
        )
        logger.warning("Applied fallback CORS configuration due to error")

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
    """Health check endpoint with diagnostic information."""
    import platform
    import sys
    
    # Get CORS settings for diagnostics
    cors_info = {
        "enabled": cors_enabled,
        "origins": cors_origins,
        "credentials_allowed": allow_credentials
    }
    
    # Basic diagnostic information
    diagnostics = {
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "cors_config": cors_info,
        "debug_mode": app.debug,
        "environment": os.getenv("QUART_ENV", "production"),
        "app_module": __name__
    }
    
    return {
        "status": "ok", 
        "message": "Bartleby API server is running", 
        "diagnostics": diagnostics if app.debug else None
    }

# Error handler for 404 Not Found
@app.errorhandler(404)
async def not_found(error):
    """Handle 404 errors."""
    return {"error": "Not Found", "message": "The requested resource does not exist"}, 404

# Error handler for 500 Internal Server Error
@app.errorhandler(500)
async def server_error(error):
    """Handle 500 errors."""
    import traceback
    error_traceback = traceback.format_exc()
    logger.error(f"Internal server error: {error}\n{error_traceback}")
    return {
        "error": "Internal Server Error", 
        "message": "An unexpected error occurred", 
        "details": str(error) if app.debug else None
    }, 500

# Main function to run the app - used by entry_point in setup.py
def main():
    """Run the application."""
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)

# Start the server when run directly
if __name__ == '__main__':
    main()
