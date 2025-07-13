"""
Combined Authentication, Security, and CORS Middleware
Consolidates security concerns into a single module
"""

import asyncio
import logging
import os
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Awaitable, Callable, Dict, List, Optional

import jwt
from quart import Quart, Request, Response, current_app, request, jsonify

from backend.config.manager import config_manager

logger = logging.getLogger(__name__)

@dataclass
class RateLimitInfo:
    """Rate limiting information for an IP"""
    count: int = 0
    reset_time: datetime = datetime.now()

class AuthSecurityMiddleware:
    """Unified middleware for authentication, security, and CORS"""

    def __init__(
        self,
        app: Quart,
        rate_limit: int = 100,  # requests per window
        rate_window: int = 60,  # window size in seconds
        max_body_size: int = 16 * 1024 * 1024,  # 16MB default
    ):
        self.app = app
        self.rate_limit = rate_limit
        self.rate_window = rate_window
        self.max_body_size = max_body_size
        self.rate_limits: Dict[str, RateLimitInfo] = {}

        # Get configuration
        self.cors_origins = self._get_cors_origins()
        self.cors_enabled = os.getenv("CORS_ENABLED", "true").lower() == "true"
        self.allow_credentials = os.getenv("ALLOW_CREDENTIALS", "true").lower() == "true"

        # Setup cleanup and middleware
        self._setup_cleanup_task()
        self._setup_middleware(app)

        logger.info("Combined Auth-Security-CORS middleware initialized")

    def _get_cors_origins(self) -> List[str]:
        """Get CORS origins from centralized configuration"""
        from backend.config.security import CORSConfig
        return CORSConfig.get_environment_origins()

    def _is_origin_allowed(self, origin: str) -> bool:
        """Check if origin is allowed using centralized configuration"""
        from backend.config.security import CORSConfig
        return CORSConfig.is_origin_allowed(origin)

    def _get_security_headers(self) -> Dict[str, str]:
        """Get security headers from centralized configuration"""
        from backend.config.security import SecurityConfig
        return SecurityConfig.get_security_headers()

    def _setup_middleware(self, app: Quart) -> None:
        """Setup all middleware functions"""

        @app.before_request
        async def handle_preflight_and_security():
            """Handle CORS preflight and security checks"""
            origin = request.headers.get("Origin")

            # Handle CORS preflight requests
            if request.method == "OPTIONS" and self.cors_enabled:
                logger.info(f"🔍 CORS Preflight - Origin: {origin}")

                if origin and self._is_origin_allowed(origin):
                    logger.info(f"✅ CORS Preflight - Origin allowed: {origin}")
                    headers = {
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                        "Access-Control-Allow-Headers": ", ".join([
                            "Content-Type", "Authorization", "Accept", "X-Requested-With",
                            "Content-Length", "Accept-Encoding", "X-CSRF-Token",
                            "google-oauth-token", "google-client-id", "g-csrf-token",
                            "X-Google-OAuth-Token", "X-Google-Client-ID", "Accept-Language",
                            "Cache-Control", "X-API-Key", "X-Auth-Token",
                        ]),
                        "Access-Control-Allow-Credentials": "true" if self.allow_credentials else "false",
                        "Access-Control-Max-Age": "3600",
                        "Vary": "Origin",
                    }
                    return "", 204, headers
                else:
                    logger.warning(f"❌ CORS Preflight - Origin not allowed: {origin}")

            # Skip other security checks for OPTIONS requests
            if request.method == "OPTIONS":
                return None

            # Security checks
            content_length = request.content_length
            if content_length and content_length > self.max_body_size:
                logger.warning(f"Request too large: {content_length} bytes")
                return current_app.response_class("Request entity too large", status=413)

            # Rate limiting (skip for auth routes)
            path = request.path.lower()
            if not path.startswith("/api/auth/"):
                if not await self._check_rate_limit():
                    logger.warning(f"Rate limit exceeded for IP: {request.remote_addr}")
                    return current_app.response_class("Rate limit exceeded", status=429)

        @app.after_request
        async def add_cors_and_security_headers(response: Response) -> Response:
            """Add CORS and security headers to all responses"""
            origin = request.headers.get("Origin")

            # Add security headers
            headers = self._get_security_headers()
            response.headers.update(headers)

            # Add CORS headers if enabled
            if self.cors_enabled:
                logger.info(f"🔍 CORS Response - Origin: {origin}, Path: {request.path}")

                if origin and self._is_origin_allowed(origin):
                    logger.info(f"✅ CORS Response - Setting headers for origin: {origin}")
                    response.headers.set("Access-Control-Allow-Origin", origin)
                    if self.allow_credentials:
                        response.headers.set("Access-Control-Allow-Credentials", "true")
                    response.headers.set("Vary", "Origin")
                elif origin:
                    logger.warning(f"❌ CORS Response - Origin not allowed: {origin}")
                else:
                    # For requests without Origin header
                    logger.debug("🔍 CORS Response - No Origin header, setting basic headers")
                    response.headers.set("Access-Control-Allow-Origin", "*")
                    response.headers.set(
                        "Access-Control-Allow-Methods",
                        "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                    )

            # Add rate limit headers for non-auth routes
            if not request.path.lower().startswith("/api/auth/"):
                limit_info = self.rate_limits.get(request.remote_addr)
                if limit_info:
                    remaining = max(0, self.rate_limit - limit_info.count)
                    reset_time = int(limit_info.reset_time.timestamp())
                    response.headers.update({
                        "X-RateLimit-Limit": str(self.rate_limit),
                        "X-RateLimit-Remaining": str(remaining),
                        "X-RateLimit-Reset": str(reset_time),
                    })

            return response

    async def _check_rate_limit(self) -> bool:
        """Check if request is within rate limits"""
        ip = request.remote_addr
        if not ip:
            ip = request.headers.get("X-Forwarded-For", "unknown").split(",")[0].strip()
        now = datetime.now()

        # Get or create rate limit info
        limit_info = self.rate_limits.get(ip)
        if not limit_info or now >= limit_info.reset_time:
            self.rate_limits[ip] = RateLimitInfo(
                count=1, reset_time=now + timedelta(seconds=self.rate_window)
            )
            return True

        # Increment count and check limit
        limit_info.count += 1
        return limit_info.count <= self.rate_limit

    def _setup_cleanup_task(self) -> None:
        """Setup periodic cleanup of rate limit data"""
        if self.app.config.get("TESTING"):
            return

        async def cleanup_rate_limits():
            while True:
                try:
                    now = datetime.now()
                    expired = [
                        ip for ip, info in self.rate_limits.items()
                        if now >= info.reset_time
                    ]
                    for ip in expired:
                        del self.rate_limits[ip]

                    await asyncio.sleep(60)  # Run cleanup every minute
                except Exception as e:
                    logger.error(f"Error in rate limit cleanup: {e}")
                    await asyncio.sleep(60)

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(cleanup_rate_limits())
        except RuntimeError:
            logger.warning("No event loop running, skipping rate limit cleanup task")

# Authentication decorators

def require_auth():
    """Decorator to require authentication for routes"""
    def decorator(f):
        async def decorated_function(*args, **kwargs):
            from quart import jsonify  # Import within function context
            try:
                # Get access token from cookies or Authorization header
                access_token = request.cookies.get("access_token")
                if not access_token:
                    auth_header = request.headers.get("Authorization")
                    if auth_header and auth_header.startswith("Bearer "):
                        access_token = auth_header.split(" ")[1]

                if not access_token:
                    return jsonify({
                        "error": "Authentication required",
                        "code": "auth_required"
                    }), 401

                # Verify token
                jwt_secret = config_manager.get_auth_config()["jwt_secret"]
                payload = jwt.decode(access_token, jwt_secret, algorithms=["HS256"])

                if payload.get("type") != "access":
                    raise jwt.InvalidTokenError("Invalid token type")

                # Attach user info to request
                request.user_id = payload.get("id")
                request.email = payload.get("email") 
                request.is_admin = payload.get("is_admin", False)

                return await f(*args, **kwargs)

            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError) as e:
                logger.warning("Authentication middleware error: %s", e)
                return jsonify({
                    "error": "Authentication failed",
                    "code": "auth_error"
                }), 401

        return decorated_function
    return decorator

def require_admin():
    """Decorator to require admin privileges for routes"""
    def decorator(f):
        async def decorated_function(*args, **kwargs):
            from quart import jsonify  # Import within function context
            try:
                # First require authentication
                auth_decorator = require_auth()
                auth_result = await auth_decorator(lambda: None)()
                if isinstance(auth_result, tuple) and auth_result[1] != 200:
                    return auth_result

                # Check if user is admin
                if not getattr(request, 'is_admin', False):
                    return jsonify({"error": "Admin privileges required"}), 403

                return await f(*args, **kwargs)

            except Exception as e:
                logger.warning(f"Admin middleware error: {e}")
                return jsonify({"error": "Admin privileges required"}), 403

        return decorated_function
    return decorator

# Setup function

def setup_auth_security(
    app: Quart,
    rate_limit: int = 100,
    rate_window: int = 60,
    max_body_size: int = 16 * 1024 * 1024,
) -> Quart:
    """Setup combined authentication, security, and CORS middleware"""
    middleware = AuthSecurityMiddleware(app, rate_limit, rate_window, max_body_size)
    
    # Log configuration
    app.logger.info("🌐 Combined Auth-Security-CORS Configuration:")
    app.logger.info(f"  - CORS Origins: {middleware.cors_origins}")
    app.logger.info(f"  - CORS Enabled: {middleware.cors_enabled}")
    app.logger.info(f"  - Allow Credentials: {middleware.allow_credentials}")
    app.logger.info(f"  - Rate Limit: {rate_limit} requests per {rate_window}s")
    app.logger.info(f"  - Max Body Size: {max_body_size} bytes")
    app.logger.info(f"  - Environment: {os.getenv('ENVIRONMENT', 'development')}")
    
    return app
