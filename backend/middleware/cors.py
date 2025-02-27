"""CORS middleware for handling cross-origin requests."""
import logging
from typing import Callable, Awaitable, Dict, Any
from quart import Quart, Request, Response, make_response, request

from .config.security import CORSConfig, get_security_config
from .config.logging import log_config

logger = log_config.get_logger(__name__)
security = get_security_config()
cors_config = CORSConfig()

def setup_cors(app: Quart) -> None:
    """Set up CORS handling for the application."""
    
    @app.before_request
    async def handle_preflight() -> None:
        """Handle CORS preflight requests."""
        if request.method == "OPTIONS":
            response = await make_response()
            origin = request.headers.get('Origin')
            
            if cors_config.is_origin_allowed(origin):
                response.headers.update(cors_config.get_cors_headers(origin))
            return response
    
    @app.after_request
    async def add_cors_headers(response: Response) -> Response:
        """Add CORS headers to all responses."""
        origin = request.headers.get('Origin')
        if cors_config.is_origin_allowed(origin):
            response.headers.update(cors_config.get_cors_headers(origin))
        response.headers.update(security.get_security_headers())
        return response

class CORSMiddleware:
    """Middleware class for handling CORS."""
    
    def __init__(self, app: Quart):
        self.app = app
        setup_cors(app)
        logger.info("CORS middleware initialized")
    
    async def __call__(self, scope: Dict[str, Any], receive: Callable[[], Awaitable[Dict]], send: Callable[[Dict], Awaitable[None]]) -> None:
        """Process the request through CORS middleware."""
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        async def send_with_cors(message: Dict) -> None:
            """Add CORS headers to response messages."""
            if message["type"] == "http.response.start":
                origin = None
                for key, value in scope.get("headers", []):
                    if key.decode("latin1").lower() == "origin":
                        origin = value.decode("latin1")
                        break
                
                if cors_config.is_origin_allowed(origin):
                    headers = message.get("headers", [])
                    cors_headers = cors_config.get_cors_headers(origin)
                    security_headers = security.get_security_headers()
                    
                    # Add both CORS and security headers
                    all_headers = {**cors_headers, **security_headers}
                    
                    # Convert dictionary headers to list of tuples
                    for name, value in all_headers.items():
                        headers.append(
                            (name.lower().encode("latin1"),
                             str(value).encode("latin1"))
                        )
                    
                    message["headers"] = headers
            
            await send(message)
        
        await self.app(scope, receive, send_with_cors)
