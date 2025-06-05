""" Utility decorators for route optimization and common functionality. Reduces code duplication across route handlers. """

import logging
import functools
from typing import Callable, Any, Optional, Dict
from quart import request, jsonify
from datetime import datetime

logger = logging.getLogger(__name__)

def handle_errors(func: Callable) -> Callable:
    """Decorator for standardized error handling."""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except FileNotFoundError as e:
            logger.warning(f"Resource not found in {func.__name__}: {e}")
            return jsonify({
                'error': 'Resource not found',
                'status': 404,
                'timestamp': datetime.now().isoformat()
            }), 404
        except ValueError as e:
            logger.warning(f"Invalid input in {func.__name__}: {e}")
            return jsonify({
                'error': 'Invalid input',
                'details': str(e),
                'status': 400,
                'timestamp': datetime.now().isoformat()
            }), 400
        except PermissionError as e:
            logger.warning(f"Permission denied in {func.__name__}: {e}")
            return jsonify({
                'error': 'Permission denied',
                'status': 403,
                'timestamp': datetime.now().isoformat()
            }), 403
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {e}", exc_info=True)
            return jsonify({
                'error': 'Internal server error',
                'status': 500,
                'timestamp': datetime.now().isoformat()
            }), 500
    return wrapper

def validate_json(*required_fields: str) -> Callable:
    """Decorator for JSON validation."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                data = await request.get_json()
                if not data:
                    return jsonify({
                        'error': 'JSON data required',
                        'status': 400,
                        'timestamp': datetime.now().isoformat()
                    }), 400
                missing_fields = [field for field in required_fields if not data.get(field)]
                if missing_fields:
                    return jsonify({
                        'error': 'Missing required fields',
                        'missing_fields': missing_fields,
                        'status': 400,
                        'timestamp': datetime.now().isoformat()
                    }), 400
                # Pass validated data as keyword argument
                return await func(*args, data=data, **kwargs)
            except Exception as e:
                logger.error(f"JSON validation error in {func.__name__}: {e}")
                return jsonify({
                    'error': 'Invalid JSON data',
                    'status': 400,
                    'timestamp': datetime.now().isoformat()
                }), 400
        return wrapper
    return decorator

def auth_required(func: Callable) -> Callable:
    """Decorator for authentication requirement."""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        user_id = getattr(request, 'user_id', None)
        if not user_id:
            # Try to get from query params as fallback
            user_id = request.args.get('user_id')
            if user_id:
                try:
                    user_id = int(user_id)
                except (ValueError, TypeError):
                    user_id = None
        if not user_id:
            return jsonify({
                'error': 'Authentication required',
                'status': 401,
                'timestamp': datetime.now().isoformat()
            }), 401
        # Pass user_id as keyword argument
        return await func(*args, user_id=user_id, **kwargs)
    return wrapper

def auth_and_db(db_type: str = 'metadata') -> Callable:
    """Combined decorator for auth + database connection."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Authentication check
            user_id = getattr(request, 'user_id', None)
            if not user_id:
                user_id = request.args.get('user_id')
                if user_id:
                    try:
                        user_id = int(user_id)
                    except (ValueError, TypeError):
                        user_id = None
            if not user_id:
                return jsonify({
                    'error': 'Authentication required',
                    'status': 401,
                    'timestamp': datetime.now().isoformat()
                }), 401
            # Database connection
            try:
                if db_type == 'metadata':
                    from backend.config.database import get_metadata_pool
                    pool_func = get_metadata_pool
                elif db_type == 'vector':
                    from backend.config.database import get_vector_pool
                    pool_func = get_vector_pool
                else:
                    raise ValueError(f"Unknown database type: {db_type}")
                pool = await pool_func()
                if not pool:
                    return jsonify({
                        'error': 'Database connection failed',
                        'status': 503,
                        'timestamp': datetime.now().isoformat()
                    }), 503
                async with pool.acquire() as db_conn:
                    # Pass both user_id and db_conn as keyword arguments
                    return await func(*args, user_id=user_id, db_conn=db_conn, **kwargs)
            except Exception as e:
                logger.error(f"Database error in {func.__name__}: {e}")
                return jsonify({
                    'error': 'Database operation failed',
                    'status': 500,
                    'timestamp': datetime.now().isoformat()
                }), 500
        return wrapper
    return decorator

def rate_limit(max_requests: int = 100, window_seconds: int = 60) -> Callable:
    """Simple rate limiting decorator (in-memory)."""
    request_counts: Dict[str, Dict[str, Any]] = {}
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            import time
            # Use IP address as identifier
            client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
            current_time = time.time()
            # Clean old entries
            if client_ip in request_counts:
                if current_time - request_counts[client_ip]['start_time'] > window_seconds:
                    request_counts[client_ip] = {'count': 0, 'start_time': current_time}
            else:
                request_counts[client_ip] = {'count': 0, 'start_time': current_time}
            # Check rate limit
            if request_counts[client_ip]['count'] >= max_requests:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'status': 429,
                    'retry_after': window_seconds,
                    'timestamp': datetime.now().isoformat()
                }), 429
            # Increment counter
            request_counts[client_ip]['count'] += 1
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def log_request(func: Callable) -> Callable:
    """Decorator for request logging."""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = datetime.now()
        user_id = getattr(request, 'user_id', 'anonymous')
        logger.info(f"Request started: {func.__name__} by user {user_id}")
        try:
            result = await func(*args, **kwargs)
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(f"Request completed: {func.__name__} in {duration:.3f}s")
            return result
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            logger.error(f"Request failed: {func.__name__} in {duration:.3f}s - {e}")
            raise
    return wrapper

def cache_response(ttl_seconds: int = 300) -> Callable:
    """Simple response caching decorator."""
    cache: Dict[str, Dict[str, Any]] = {}
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            import time
            import hashlib
            # Create cache key from function name and args
            cache_key = f"{func.__name__}:{hashlib.md5(str(args + tuple(sorted(kwargs.items()))).encode()).hexdigest()}"
            current_time = time.time()
            # Check cache
            if cache_key in cache:
                if current_time - cache[cache_key]['timestamp'] < ttl_seconds:
                    logger.debug(f"Cache hit for {func.__name__}")
                    return cache[cache_key]['response']
                else:
                    del cache[cache_key]
            # Execute function and cache result
            response = await func(*args, **kwargs)
            cache[cache_key] = {
                'response': response,
                'timestamp': current_time
            }
            logger.debug(f"Cached response for {func.__name__}")
            return response
        return wrapper
    return decorator
