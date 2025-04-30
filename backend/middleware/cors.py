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
        'https://vercel.live',
        'https://*.vercel.app',
        'https://*.onrender.com',
        'https://accounts.google.com',
        'https://*.google.com',  # Broader coverage for Google domains
        'https://*.googleusercontent.com',
        'https://*.gstatic.com'  # For Google static resources
    ])
    
    # Single handler for all OPTIONS requests - unified preflight handling
    @app.route('/<path:path>', methods=['OPTIONS'])
    @app.route('/', methods=['OPTIONS'], defaults={'path': ''})
    async def handle_options(path):
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
            return True
            
        # Check for wildcard domains
        for allowed_origin in allowed_origins:
            if allowed_origin == '*':
                return True
                
            if allowed_origin.startswith('https://*.'):
                domain_suffix = allowed_origin.replace('https://*.', '')
                if origin.startswith('https://') and origin.endswith(domain_suffix):
                    return True
                    
        return False

    @app.after_request
    async def add_cors_headers(response, force_credentials=False):
        """Add CORS headers to responses."""
        origin = request.headers.get('Origin')
        
        # Debug logging
        if origin:
            logger.debug(f"CORS: Incoming request from origin: {origin}")
        
        # Origin handling
        if origin:
            # Always respond with the actual origin for authentication requests
            # rather than a wildcard, which is required for credentials
            if await is_origin_allowed(origin):
                logger.debug(f"CORS: Allowed origin: {origin}")
                response.headers['Access-Control-Allow-Origin'] = origin
            else:
                logger.debug(f"CORS: Origin not allowed: {origin}")
        
        # Add standard CORS headers with expanded Google auth support
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
            'X-Google-OAuth-Token',
            'X-Google-Client-ID',
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials'
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
