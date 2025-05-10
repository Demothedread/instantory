"""Security middleware for handling security headers and protections."""

import asyncio
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Awaitable, Callable, Dict, Optional

from quart import Quart, Request, Response, current_app, request

from ..config.logging import log_config
from ..config.security import get_cors_config, get_security_config

logger = log_config.get_logger(__name__)
security = get_security_config()
cors_config = get_cors_config()


@dataclass
class RateLimitInfo:
    """Rate limiting information for an IP."""

    count: int = 0
    reset_time: datetime = datetime.now()


class SecurityMiddleware:
    """Middleware for handling security concerns."""

    def __init__(
        self,
        app: Quart,
        rate_limit: int = 100,  # requests per window
        rate_window: int = 60,  # window size in seconds
        max_body_size: int = 16 * 1024 * 1024,
    ):  # 16MB default
        self.app = app
        self.rate_limit = rate_limit
        self.rate_window = rate_window
        self.max_body_size = max_body_size
        self.rate_limits: Dict[str, RateLimitInfo] = {}

        # Set up cleanup task for rate limit data
        self._setup_cleanup_task()

        # Register middleware functions
        self._setup_middleware(app)

        logger.info("Security middleware initialized")

    def _setup_middleware(self, app: Quart) -> None:
        """Set up middleware functions."""

        @app.before_request
        async def security_checks() -> Optional[Response]:
            """Perform security checks before request processing."""
            # Skip security checks for OPTIONS requests (handled by CORS)
            if request.method == "OPTIONS":
                return None

            # Skip rate limiting for authentication routes
            path = request.path.lower()
            if path.startswith("/api/auth/"):
                # Still check request size for auth routes
                content_length = request.content_length
                if content_length and content_length > self.max_body_size:
                    logger.warning(f"Auth request too large: {content_length} bytes")
                    return current_app.response_class(
                        "Request entity too large", status=413
                    )
                # Skip rate limiting for auth routes to ensure smooth login experience
                return None

            # Check request size
            content_length = request.content_length
            if content_length and content_length > self.max_body_size:
                logger.warning(f"Request too large: {content_length} bytes")
                return current_app.response_class(
                    "Request entity too large", status=413
                )

            # Rate limiting for non-auth routes
            if not await self._check_rate_limit():
                logger.warning(f"Rate limit exceeded for IP: {request.remote_addr}")
                return current_app.response_class("Rate limit exceeded", status=429)

        @app.after_request
        async def add_security_headers(response: Response) -> Response:
            """Add security headers to response."""
            headers = security.get_security_headers()

            # Modify security headers to allow Google authentication
            headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
            headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
            headers["Cross-Origin-Resource-Policy"] = "cross-origin"

            response.headers.update(headers)

            # Add rate limit headers for non-auth routes
            if not request.path.lower().startswith("/api/auth/"):
                limit_info = self.rate_limits.get(request.remote_addr)
                if limit_info:
                    remaining = max(0, self.rate_limit - limit_info.count)
                    reset_time = int(limit_info.reset_time.timestamp())
                    response.headers.update(
                        {
                            "X-RateLimit-Limit": str(self.rate_limit),
                            "X-RateLimit-Remaining": str(remaining),
                            "X-RateLimit-Reset": str(reset_time),
                        }
                    )

            return response

    async def _check_rate_limit(self) -> bool:
        """Check if request is within rate limits."""
        ip = request.remote_addr
        if not ip:
            # Fallback to X-Forwarded-For header if behind proxy
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
        """Set up periodic cleanup of rate limit data."""
        # Skip cleanup task in test mode
        if self.app.config.get("TESTING"):
            return

        async def cleanup_rate_limits():
            while True:
                try:
                    now = datetime.now()
                    expired = [
                        ip
                        for ip, info in self.rate_limits.items()
                        if now >= info.reset_time
                    ]
                    for ip in expired:
                        del self.rate_limits[ip]

                    await asyncio.sleep(60)  # Run cleanup every minute
                except Exception as e:
                    logger.error(f"Error in rate limit cleanup: {e}")
                    await asyncio.sleep(60)  # Wait before retrying

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(cleanup_rate_limits())
        except RuntimeError:
            # No event loop running, skip cleanup task
            logger.warning("No event loop running, skipping rate limit cleanup task")


def setup_security(
    app: Quart,
    rate_limit: int = 100,
    rate_window: int = 60,
    max_body_size: int = 16 * 1024 * 1024,
) -> Quart:
    """Set up security middleware for the application."""
    middleware = SecurityMiddleware(app, rate_limit, rate_window, max_body_size)
    return app
