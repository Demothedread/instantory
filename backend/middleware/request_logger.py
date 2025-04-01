"""Request logging middleware for tracking API requests."""
import logging
import time
from typing import Dict, Any, Callable, Awaitable, Optional
from quart import Quart, Request, Response, request, g
import json
from datetime import datetime
import uuid
import urllib.parse as urlparse

from ..config.logging import log_config, get_request_logger

logger = log_config.get_logger(__name__)
request_logger = get_request_logger()

class RequestContext:
    """Context for tracking request information."""
    
    def __init__(self):
        self.request_id: str = str(uuid.uuid4())
        self.start_time: float = time.time()
        self.method: Optional[str] = None
        self.path: Optional[str] = None
        self.query_params: Optional[Dict] = None
        self.headers: Optional[Dict] = None
        self.body: Optional[Any] = None
        self.client_ip: Optional[str] = None
        self.user_agent: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary."""
        return {
            'request_id': self.request_id,
            'timestamp': datetime.fromtimestamp(self.start_time).isoformat(),
            'method': self.method,
            'path': self.path,
            'query_params': self.query_params,
            'client_ip': self.client_ip,
            'user_agent': self.user_agent,
            'duration_ms': None  # Set when request completes
        }

class RequestLoggingMiddleware:
    """Middleware for logging request details."""
    
    def __init__(self, app: Quart, 
                 log_request_body: bool = False,
                 sensitive_headers: Optional[set] = None):
        self.app = app
        self.log_request_body = log_request_body
        self.sensitive_headers = sensitive_headers or {
            'authorization', 'cookie', 'x-api-key'
        }
        
        self._setup_middleware(app)
        logger.info("Request logging middleware initialized")
    
    def _setup_middleware(self, app: Quart) -> None:
        """Set up request logging middleware."""
        
        @app.before_request
        async def before_request() -> None:
            """Process request before handling."""
            ctx = RequestContext()
            
            # Basic request info
            ctx.method = request.method
            ctx.path = request.path
            ctx.query_params = dict(request.args)
            
            # Client info
            ctx.client_ip = request.remote_addr
            ctx.user_agent = request.headers.get('User-Agent')
            
            # Headers (excluding sensitive ones)
            ctx.headers = {
                k: v for k, v in request.headers.items()
                if k.lower() not in self.sensitive_headers
            }
            
            # Request body (if enabled)
            if self.log_request_body and request.is_json:
                try:
                    ctx.body = await request.get_json()
                except Exception as e:
                    logger.warning(f"Failed to parse JSON body: {e}")
            
            # Store context in g
            g.request_context = ctx
            
            # Log request start
            logger.info(
                f"Request started: {ctx.method} {ctx.path}",
                extra=ctx.to_dict()
            )
        
        @app.after_request
        async def after_request(response: Response) -> Response:
            """Process response after handling."""
            ctx = getattr(Request, 'request_context', None)
            if not ctx:
                return response
            
            # Calculate duration
            duration = (time.time() - ctx.start_time) * 1000  # ms
            
            # Log request completion
            log_data = ctx.to_dict()
            log_data.update({
                'duration_ms': round(duration, 2),
                'status_code': response.status_code,
                'response_size': len(response.get_data()),
                'content_type': response.mimetype
            })
            
            request_logger.log_request(
                method=ctx.method,
                path=ctx.path,
                status=response.status_code,
                duration=duration / 1000,  # Convert to seconds
                extra=log_data
            )
            
            return response
    
    async def __call__(self, scope: Dict[str, Any], receive: Callable[[], Awaitable[Dict]], 
                      send: Callable[[Dict], Awaitable[None]]) -> None:
        """Process the request through logging middleware."""
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        # Create request context
        ctx = RequestContext()
        ctx.method = scope.get("method", "").upper()
        ctx.path = scope.get("path", "")
        ctx.query_params = dict(urlparse.parse_qsl(scope.get("query_string", b"").decode()))
        
        # Get client info from headers
        headers = dict(scope.get("headers", []))
        ctx.client_ip = headers.get(b"x-real-ip", b"").decode() or scope.get("client")[0]
        ctx.user_agent = headers.get(b"user-agent", b"").decode()
        
        # Store context in scope for access in response
        scope["request_context"] = ctx
        
        # Log request start
        logger.info(
            f"Request started: {ctx.method} {ctx.path}",
            extra=ctx.to_dict()
        )
        
        start_time = time.time()
        
        async def send_with_logging(message: Dict) -> None:
            """Send response with logging."""
            if message["type"] == "http.response.start":
                # Calculate duration
                duration = (time.time() - start_time) * 1000
                
                # Log request completion
                log_data = ctx.to_dict()
                log_data.update({
                    'duration_ms': round(duration, 2),
                    'status_code': message.get("status", 500)
                })
                
                request_logger.log_request(
                    method=ctx.method,
                    path=ctx.path,
                    status=message.get("status", 500),
                    duration=duration / 1000,
                    extra=log_data
                )
            
            await send(message)
        
        await self.app(scope, receive, send_with_logging)

def setup_request_logging(app: Quart, **kwargs) -> RequestLoggingMiddleware:
    """Set up request logging middleware for the application."""
    middleware = RequestLoggingMiddleware(app, **kwargs)
    return middleware

# Alias for backward compatibility
setup_request_logger = setup_request_logging
