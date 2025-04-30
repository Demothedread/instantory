"""CORS middleware configuration."""
import os
import logging
from quart import Quart, request

# Initialize logger
logger = logging.getLogger(__name__)

def setup_cors(app: Quart, enabled: bool = True, allow_credentials: bool = True) -> None:
    """Configure CORS for the application."""
    if not enabled:
        return

    # Define allowed origins with broader Google domain coverage and explicit inclusion of 
    # hocomnia.com
    cors_origins_env = os.getenv('CORS_ORIGINS', '')
    origins_from_env = [
        o.strip()
        for o in cors_origins_env.split(',')
    ] if cors_origins_env else []
    
    # Get CORS settings from app config
    cors_config = app.config.get('CORS_CONFIG', {})
    allowed_origins = cors_config.get('allow_origin', origins_from_env) or [
        'https://instantory.vercel.app',
        'https://hocomnia.com',
        'https://www.hocomnia.com', 
        'https://bartleby.vercel.app',
        'http://localhost:3000',
        'https://vercel.live',
        'https://bartleby-backend.onrender.com',
        'https://accounts.google.com',
        'https://*.google.com',  # Broader coverage for Google domains
        'https://*.googleapis.com',
        'https://*.googleusercontent.com',
    ]
    # Log configured origins for debugging
    logger.info("CORS allowed origins: %s", allowed_origins)
    
    # Single handler for all OPTIONS requests - unified preflight handling
    @app.route('/<path:path>', methods=['OPTIONS'])
    @app.route('/', methods=['OPTIONS'], defaults={'path': ''})
    async def handle_options(_):
        """Handle preflight OPTIONS requests for all paths in a single handler."""
        response = app.response_class()
        response = await add_cors_headers(response, force_credentials=True)
        # Cache preflight response for a longer time
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
        return response, 204

    async def is_origin_allowed(origin: str) -> bool:
        """Determine if the origin is allowed based on exact match or pattern."""
        if not origin:
            return False
            
        # Check for exact match first
        if origin in allowed_origins:
            logger.debug("CORS: Exact match for origin: %s", origin)
            return True
            
        # Check for wildcard domains
        for allowed_origin in allowed_origins:
            if allowed_origin == '*':
                logger.debug("CORS: Wildcard match for origin: %s", origin)
                return True
                
            if allowed_origin.startswith('https://*.'):
                domain_suffix = allowed_origin.replace('https://*.', '')
                if origin.startswith('https://') and origin.endswith(domain_suffix):
                    logger.debug(
                        "CORS: Wildcard domain match for origin: %s with pattern: %s",
                        origin, allowed_origin
                    )
                    return True
                    
        logger.warning("CORS: Origin not allowed: %s", origin)
        return False

    @app.after_request
    async def add_cors_headers(response, force_credentials=False):
        """Add CORS headers to responses."""
        origin = request.headers.get('Origin')
        
        # Enhanced debug logging
        if origin:
            logger.debug(
                "CORS: Incoming request from origin: %s, method: %s, path: %s",
                origin, request.method, request.path
            )
        
        # Origin handling - always check hocomnia.com explicitly
        if origin:
            # Special handling for hocomnia.com to ensure it always works
            if origin == 'https://hocomnia.com':
                logger.info("CORS: Explicitly allowing hocomnia.com")
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
            # For other origins, check if they're allowed
            elif await is_origin_allowed(origin):
                logger.debug("CORS: Allowed origin: %s", origin)
                response.headers['Access-Control-Allow-Origin'] = origin
            else:
                logger.warning("CORS: Origin not allowed: %s", origin)
        
        # Add standard CORS headers with expanded auth support
        allowed_methods = cors_config.get('allow_methods', [
            'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'
        ])
        allowed_headers = cors_config.get('allow_headers', [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'Content-Length',
            'Accept-Encoding',
            'X-CSRF-Token',
            'google-oauth-token',
            'google-client_id',
            'g_csrf_token',
            'X-Google-OAuth-Token',
            'X-Google-Client-ID',
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials',
            'Cache-Control',
            'X-API-Key',
            'X-Auth-Token'
        ])
        
        response.headers['Access-Control-Allow-Methods'] = ','.join(allowed_methods)
        response.headers['Access-Control-Allow-Headers'] = ','.join(allowed_headers)
        
        # Always set credentials for auth flows or when explicitly requested
        if allow_credentials or force_credentials:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        # Set security headers consistently
        # Disable Cross-Origin policies that may be blocking Google auth
        response.headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
        response.headers['Cross-Origin-Opener-Policy'] = 'unsafe-none'
        response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
        
        return response
