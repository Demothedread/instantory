"""Route optimization decorators for the Instantory backend.
Provides caching, rate limiting, authentication, and error handling decorators."""

import asyncio
import logging
import time
from functools import wraps
from typing import Dict, Any, Optional, Callable, Awaitable
from quart import request, jsonify, g
import jwt
from backend.config.manager import config_manager

logger = logging.getLogger(__name__)

# Simple in-memory cache for demonstration (would use Redis in production)
_cache: Dict[str, Dict[str, Any]] = {}
_rate_limits: Dict[str, list] = {}

def cache_response(ttl: int = 300):
    """Cache response decorator with TTL in seconds."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Check cache
            if cache_key in _cache:
                cache_entry = _cache[cache_key]
                if time.time() - cache_entry['timestamp'] < ttl:
                    logger.debug("Cache hit for %s", cache_key)
                    return cache_entry['data']
                else:
                    # Cache expired
                    del _cache[cache_key]
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            _cache[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }
            logger.debug("Cached result for %s", cache_key)
            return result
        return wrapper
    return decorator

def rate_limit(max_requests: int = 100, window_seconds: int = 60):
    """Rate limiting decorator."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get client identifier (IP address for now)
            client_id = request.remote_addr or 'unknown'
            current_time = time.time()
            window_start = current_time - window_seconds
            
            # Clean old entries
            if client_id in _rate_limits:
                _rate_limits[client_id] = [
                    req_time for req_time in _rate_limits[client_id] 
                    if req_time > window_start
                ]
            else:
                _rate_limits[client_id] = []
            
            # Check rate limit
            if len(_rate_limits[client_id]) >= max_requests:
                logger.warning("Rate limit exceeded for client %s", client_id)
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': window_seconds
                }), 429
            
            # Record request and execute
            _rate_limits[client_id].append(current_time)
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_auth(optional: bool = False):
    """Authentication decorator."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                if optional:
                    g.user_id = None
                    return await func(*args, **kwargs)
                return jsonify({'error': 'Authorization header required'}), 401
            
            try:
                # Extract token from "Bearer <token>" format
                if not auth_header.startswith('Bearer '):
                    raise ValueError("Invalid authorization header format")
                    
                token = auth_header.split(' ')[1]
                
                # Decode JWT token
                auth_config = config_manager.get_auth_config()
                payload = jwt.decode(
                    token, 
                    auth_config['jwt_secret'], 
                    algorithms=['HS256']
                )
                
                # Set user context
                g.user_id = payload.get('user_id')
                g.user_email = payload.get('email')
                
                return await func(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                logger.warning("Expired JWT token")
                return jsonify({'error': 'Token expired'}), 401
            except jwt.InvalidTokenError as e:
                logger.warning("Invalid JWT token: %s", e)
                return jsonify({'error': 'Invalid token'}), 401
            except Exception as e:
                logger.error("Authentication error: %s", e)
                return jsonify({'error': 'Authentication failed'}), 401
        return wrapper
    return decorator

def handle_errors(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
    """Global error handling decorator."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ValueError as e:
            logger.warning("Validation error in %s: %s", func.__name__, e)
            return jsonify({'error': 'Invalid input', 'details': str(e)}), 400
        except PermissionError as e:
            logger.warning("Permission error in %s: %s", func.__name__, e)
            return jsonify({'error': 'Permission denied', 'details': str(e)}), 403
        except FileNotFoundError as e:
            logger.warning("Resource not found in %s: %s", func.__name__, e)
            return jsonify({'error': 'Resource not found', 'details': str(e)}), 404
        except Exception as e:
            logger.error("Unexpected error in %s: %s", func.__name__, e, exc_info=True)
            return jsonify({'error': 'Internal server error'}), 500
    return wrapper

def log_performance(threshold_ms: int = 1000):
    """Performance logging decorator."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration_ms = (time.time() - start_time) * 1000
                
                if duration_ms > threshold_ms:
                    logger.warning(
                        "Slow request: %s took %.2fms (threshold: %dms)",
                        func.__name__, duration_ms, threshold_ms
                    )
                else:
                    logger.debug(
                        "Request %s completed in %.2fms",
                        func.__name__, duration_ms
                    )
        return wrapper
    return decorator

def validate_json(required_fields: Optional[list] = None):
    """JSON validation decorator."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                data = await request.get_json()
                if not data:
                    return jsonify({'error': 'JSON data required'}), 400
                
                # Validate required fields
                if required_fields:
                    missing_fields = [
                        field for field in required_fields 
                        if field not in data or data[field] is None
                    ]
                    if missing_fields:
                        return jsonify({
                            'error': 'Missing required fields',
                            'fields': missing_fields
                        }), 400
                
                # Add data to kwargs for the route function
                kwargs['data'] = data
                return await func(*args, **kwargs)
                
            except Exception as e:
                logger.warning("JSON validation error: %s", e)
                return jsonify({'error': 'Invalid JSON format'}), 400
        return wrapper
    return decorator

def user_scoped(user_id_param: str = 'user_id'):
    """Ensure operations are scoped to the authenticated user."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Check if user is authenticated
            if not hasattr(g, 'user_id') or g.user_id is None:
                return jsonify({'error': 'Authentication required'}), 401
            
            # If user_id is in URL params, ensure it matches authenticated user
            if user_id_param in kwargs:
                url_user_id = kwargs[user_id_param]
                if str(url_user_id) != str(g.user_id):
                    logger.warning(
                        "User %s attempted to access resources for user %s",
                        g.user_id, url_user_id
                    )
                    return jsonify({'error': 'Access denied'}), 403
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def combine_decorators(*decorators):
    """Combine multiple decorators in the correct order."""
    def decorator(func: Callable[..., Awaitable]) -> Callable[..., Awaitable]:
        for dec in reversed(decorators):
            func = dec(func)
        return func
    return decorator

# Commonly used decorator combinations
def authenticated_api(rate_limit_requests: int = 100, cache_ttl: int = 0):
    """Standard authenticated API endpoint decorator."""
    decorators = [
        handle_errors,
        log_performance(),
        rate_limit(rate_limit_requests),
        require_auth()
    ]
    
    if cache_ttl > 0:
        decorators.insert(-1, cache_response(cache_ttl))
    
    return combine_decorators(*decorators)

def public_api(rate_limit_requests: int = 200, cache_ttl: int = 0):
    """Standard public API endpoint decorator."""
    decorators = [
        handle_errors,
        log_performance(),
        rate_limit(rate_limit_requests)
    ]
    
    if cache_ttl > 0:
        decorators.append(cache_response(cache_ttl))
    
    return combine_decorators(*decorators)
