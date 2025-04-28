"""CORS middleware configuration."""
from quart import Quart, request
import os
from typing import List, Dict, Any, Optional

def setup_cors(app: Quart, enabled: bool = True, allow_credentials: bool = True) -> None:
    """Configure CORS for the application."""
    if not enabled:
        return

    # Handle OPTIONS preflight requests
    @app.route('/*', methods=['OPTIONS'])
    async def handle_options():
        """Handle preflight OPTIONS requests."""
        response = app.response_class()
        await add_cors_headers(response)
        return response, 204

    @app.after_request
    async def add_cors_headers(response):
        """Add CORS headers to responses."""
        origin = request.headers.get('Origin')
        
        # Get CORS settings from environment or app config
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
            'https://*.googleusercontent.com'
        ])
        
        # Allow all origins if '*' is in the list
        if '*' in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin or '*'
        # Otherwise, check for the origin
        elif origin:
            # Check for exact match
            if origin in allowed_origins:
                response.headers['Access-Control-Allow-Origin'] = origin
            # Check for wildcard domains
            else:
                for allowed_origin in allowed_origins:
                    if allowed_origin.startswith('https://*.'):
                        domain_suffix = allowed_origin.replace('https://*.', '')
                        if origin.startswith('https://') and origin.endswith(domain_suffix):
                            response.headers['Access-Control-Allow-Origin'] = origin
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
        
        if allow_credentials:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        # Cache preflight response for browsers
        response.headers['Access-Control-Max-Age'] = '3600'
        
        # Disable Cross-Origin Embedder Policy (COEP) that may be blocking Google auth
        response.headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
        response.headers['Cross-Origin-Opener-Policy'] = 'unsafe-none'
        
        return response
