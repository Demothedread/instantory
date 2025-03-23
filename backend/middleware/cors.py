"""CORS middleware configuration."""
from quart import Quart
from typing import List, Dict, Any

def setup_cors(app: Quart, enabled: bool = True, allow_credentials: bool = True) -> None:
    """Configure CORS for the application."""
    if not enabled:
        return

    @app.after_request
    async def add_cors_headers(response):
        """Add CORS headers to responses."""
        request = app.current_request
        origin = request.headers.get('Origin')
        
        # Get CORS settings from app config
        cors_config = app.config.get('CORS_CONFIG', {})
        allowed_origins = cors_config.get('allow_origin', ['https://hocomnia.com'])
        allowed_methods = cors_config.get('allow_methods', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
        allowed_headers = cors_config.get('allow_headers', [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'google-oauth-token'
        ])
        
        # Set CORS headers if origin is allowed
        if origin and (origin in allowed_origins or '*' in allowed_origins):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = ','.join(allowed_methods)
            response.headers['Access-Control-Allow-Headers'] = ','.join(allowed_headers)
            
            if allow_credentials:
                response.headers['Access-Control-Allow-Credentials'] = 'true'
            
            # Cache preflight response for browsers
            if request.method == 'OPTIONS':
                response.headers['Access-Control-Max-Age'] = '3600'
        
        return response
