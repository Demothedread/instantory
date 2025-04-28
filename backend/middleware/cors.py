"""CORS middleware configuration."""
from quart import Quart, request
import os
import logging
from typing import List, Dict, Any, Optional

# Initialize logger
logger = logging.getLogger(__name__)

def setup_cors(app: Quart, enabled: bool = True, allow_credentials: bool = True) -> None:
    """Configure CORS for the application."""
    if not enabled:
        return

    # Define allowed origins with broader Google domain coverage
    cors_origins_env = os.getenv('CORS_ORIGINS', '')
    origins_from_env = [
        o.strip() 
        for o in cors_origins_env.split(',')
    ] if cors_origins_env else []
    
    # Get CORS settings from app config
    cors_config = app.config.get('CORS_CONFIG', {})
    allowed_origins = cors_config.get('allow_origin', origins_from_env or [
        'https://hocomnia.com', 
        'https://accounts.google.com',
        'https://*.google.com',  # Broader coverage for Google domains
        'https://*.googleusercontent.com',
        'https://*.gstatic.com'  # For Google static resources
    ])
    
    # Handle preflight requests with correct route patterns
    @app.route('/', methods=['OPTIONS'])
    async def handle_root_options():
        """Handle preflight OPTIONS requests for root path."""
        response = app.response_class()
        response = await add_cors_headers(response)
        return response, 204
    
    @app.route('/<path:path>', methods=['OPTIONS'])
    async def handle_options(path):
        """Handle preflight OPTIONS requests for all other paths."""
        response = app.response_class()
        response = await add_cors_headers(response)
        return response, 204

    @app.after_request
    async def add_cors_headers(response):
        """Add CORS headers to responses."""
        origin = request.headers.get('Origin')
        
        # Debug logging
        if origin:
            logger.debug(f"CORS: Incoming request from origin: {origin}")
        
        # Simplified origin handling
        if origin:
            # Check for exact match first
            if origin in allowed_origins:
                logger.debug(f"CORS: Direct match for origin: {origin}")
                response.headers['Access-Control-Allow-Origin'] = origin
            # Then check for wildcard domains
            else:
                for allowed_origin in allowed_origins:
                    if allowed_origin == '*':
                        response.headers['Access-Control-Allow-Origin'] = origin
                        logger.debug(f"CORS: Wildcard match for origin: {origin}")
                        break
                    elif allowed_origin.startswith('https://*.'):
                        domain_suffix = allowed_origin.replace('https://*.', '')
                        if origin.startswith('https://') and origin.endswith(domain_suffix):
                            response.headers['Access-Control-Allow-Origin'] = origin
                            logger.debug(f"CORS: Wildcard domain match for origin: {origin}")
                            break
        
        # Add standard CORS headers
        allowed_methods = cors_config.get('allow_methods', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
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
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials'
        ])
        
        response.headers['Access-Control-Allow-Methods'] = ','.join(allowed_methods)
        response.headers['Access-Control-Allow-Headers'] = ','.join(allowed_headers)
        
        # Always set credentials header when needed
        if allow_credentials:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        # Cache preflight response for browsers
        response.headers['Access-Control-Max-Age'] = '3600'
        
        # Set security headers consistently
        # Disable Cross-Origin policies that may be blocking Google auth
        response.headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
        response.headers['Cross-Origin-Opener-Policy'] = 'unsafe-none'
        response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
        
        return response
