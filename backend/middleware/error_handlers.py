"""Error handling middleware and custom exceptions."""
import logging
import traceback
from typing import Dict, Any, Type, Optional, Union
from quart import Quart, jsonify, Response
from werkzeug.exceptions import HTTPException
import asyncpg.exceptions
import json

from ..config.logging import log_config

logger = log_config.get_logger(__name__)

class APIError(Exception):
    """Base class for API errors."""
    def __init__(self, message: str, status_code: int = 500,  error_code: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or 'INTERNAL_ERROR'
        self.details = details or {}

class ValidationError(APIError):
    """Error for invalid input data."""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code='VALIDATION_ERROR',
            details=details
        )

class AuthenticationError(APIError):
    """Error for authentication failures."""
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=401,
            error_code='AUTHENTICATION_ERROR'
        )

class AuthorizationError(APIError):
    """Error for authorization failures."""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            message=message,
            status_code=403,
            error_code='AUTHORIZATION_ERROR'
        )

class NotFoundError(APIError):
    """Error for resource not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            message=message,
            status_code=404,
            error_code='NOT_FOUND'
        )

class DatabaseError(APIError):
    """Error for database operations."""
    def __init__(self, message: str = "Database error occurred", 
                 original_error: Optional[Exception] = None):
        details = {}
        if original_error:
            details['original_error'] = str(original_error)
        super().__init__(
            message=message,
            status_code=500,
            error_code='DATABASE_ERROR',
            details=details
        )

def setup_error_handlers(app: Quart) -> None:
    """Set up error handlers for the application."""
    
    def error_response(error: Union[APIError, Exception], 
                      status_code: int = 500) -> Response:
        """Create consistent error response format."""
        if isinstance(error, APIError):
            response = {
                'error': error.error_code,
                'message': error.message,
                'status_code': error.status_code
            }
            if error.details:
                response['details'] = error.details
            status_code = error.status_code
        else:
            response = {
                'error': 'INTERNAL_ERROR',
                'message': str(error),
                'status_code': status_code
            }
        
        return jsonify(response), status_code
    
    @app.errorhandler(ValidationError)
    async def handle_validation_error(error: ValidationError) -> Response:
        """Handle validation errors."""
        logger.warning(f"Validation error: {error.message}", extra=error.details)
        return error_response(error)
    
    @app.errorhandler(AuthenticationError)
    async def handle_authentication_error(error: AuthenticationError) -> Response:
        """Handle authentication errors."""
        logger.warning(f"Authentication error: {error.message}")
        return error_response(error)
    
    @app.errorhandler(AuthorizationError)
    async def handle_authorization_error(error: AuthorizationError) -> Response:
        """Handle authorization errors."""
        logger.warning(f"Authorization error: {error.message}")
        return error_response(error)
    
    @app.errorhandler(NotFoundError)
    async def handle_not_found_error(error: NotFoundError) -> Response:
        """Handle not found errors."""
        logger.info(f"Resource not found: {error.message}")
        return error_response(error)
    
    @app.errorhandler(DatabaseError)
    async def handle_database_error(error: DatabaseError) -> Response:
        """Handle database errors."""
        logger.error(f"Database error: {error.message}", extra=error.details)
        return error_response(error)
    
    @app.errorhandler(HTTPException)
    async def handle_http_error(error: HTTPException) -> Response:
        """Handle HTTP errors."""
        logger.warning(f"HTTP error {error.code}: {error.description}")
        return error_response(
            APIError(
                message=error.description,
                status_code=error.code,
                error_code=f'HTTP_{error.code}'
            )
        )
    
    @app.errorhandler(asyncpg.exceptions.PostgresError)
    async def handle_postgres_error(error: asyncpg.exceptions.PostgresError) -> Response:
        """Handle PostgreSQL errors."""
        logger.error(f"PostgreSQL error: {str(error)}")
        return error_response(
            DatabaseError(
                message="Database operation failed",
                original_error=error
            )
        )
    
    @app.errorhandler(Exception)
    async def handle_unexpected_error(error: Exception) -> Response:
        """Handle unexpected errors."""
        logger.error(
            "Unexpected error occurred",
            extra={
                'error_type': type(error).__name__,
                'error_message': str(error),
                'traceback': traceback.format_exc()
            }
        )
        return error_response(error)
    
    # Register error handlers for common HTTP status codes
    for status_code in [400, 401, 403, 404, 405, 408, 413, 429, 500, 502, 503, 504]:
        @app.errorhandler(status_code)
        async def handle_error(error: HTTPException, status_code: int = status_code) -> Response:
            """Handle specific HTTP status code errors."""
            return error_response(
                APIError(
                    message=error.description if isinstance(error, HTTPException) else str(error),
                    status_code=status_code,
                    error_code=f'HTTP_{status_code}'
                )
            )

class ErrorHandlingMiddleware:
    """Middleware for consistent error handling."""
    
    def __init__(self, app: Quart):
        self.app = app
        setup_error_handlers(app)
        logger.info("Error handling middleware initialized")
    
    async def __call__(self, scope: Dict[str, Any], receive: Any, send: Any) -> None:
        """Process the request with error handling."""
        try:
            await self.app(scope, receive, send)
        except Exception as e:
            if scope["type"] == "http":
                # Log the error
                logger.error(
                    "Unhandled error in ASGI application",
                    extra={
                        'error_type': type(e).__name__,
                        'error_message': str(e),
                        'traceback': traceback.format_exc()
                    }
                )
                
                # Create error response
                error_dict = {
                    'error': 'INTERNAL_ERROR',
                    'message': 'An unexpected error occurred',
                    'status_code': 500
                }
                
                # Send error response
                await send({
                    'type': 'http.response.start',
                    'status': 500,
                    'headers': [
                        (b'content-type', b'application/json'),
                    ]
                })
                await send({
                    'type': 'http.response.body',
                    'body': json.dumps(error_dict).encode('utf-8'),
                })
            else:
                # Re-raise non-HTTP errors
                raise
