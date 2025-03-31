"""CORS middleware configuration."""
from quart import Quart, request
import os
from typing import List, Dict, Any, Optional

def setup_cors(app: Quart, enabled: bool = True, allow_credentials: bool = True) -> None:
    """Configure CORS for the application."""
    if not enabled:
        return

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
        allowed_origins = cors_config.get('allow_origin', origins_from_env or ['https://hocomnia.com'])
        
        # Allow all origins if '*' is in the list
        if '*' in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin or '*'
        # Otherwise, only allow specified origins
        elif origin and (origin in allowed_origins):
            response.headers['Access-Control-Allow-Origin'] = origin
        
        # If we're setting CORS headers, set all the required ones
        if 'Access-Control-Allow-Origin' in response.headers:
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
                'google-oauth-token'
            ])
            
            response.headers['Access-Control-Allow-Methods'] = ','.join(allowed_methods)
            response.headers['Access-Control-Allow-Headers'] = ','.join(allowed_headers)
            
            if allow_credentials:
                response.headers['Access-Control-Allow-Credentials'] = 'true'
            
            # Cache preflight response for browsers
            if request.method == 'OPTIONS':
                response.headers['Access-Control-Max-Age'] = '3600'
                response.status_code = 204  # No content for OPTIONS requests
        
        return response
