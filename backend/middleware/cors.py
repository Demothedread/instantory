"""CORS middleware for the backend application."""

import os
from typing import List

from quart import Quart, request


def is_origin_allowed(origin: str, allowed_origins: List[str]) -> bool:
    """
    Check if the origin is allowed, supporting wildcard domains.
    Now delegates to the new combined auth_security middleware.

    Args:
        origin: The request origin to check
        allowed_origins: List of allowed origins

    Returns:
        True if origin is allowed, False otherwise
    """
    try:
        from backend.middleware.auth_security import AuthSecurityMiddleware
        # Create a temporary instance to use the origin checking logic
        # Don't actually initialize the app - just access the method
        class TempAuthMiddleware:
            def __init__(self):
                self.cors_origins = allowed_origins
            
            def _is_origin_allowed(self, origin):
                if not origin:
                    return False
                # Exact match
                if origin in self.cors_origins:
                    return True
                # Wildcard domains
                for allowed_origin in self.cors_origins:
                    if allowed_origin.startswith("https://*."):
                        domain_suffix = allowed_origin.replace("https://*.", "")
                        if origin.startswith("https://") and origin.endswith(f".{domain_suffix}"):
                            return True
                # Enhanced hocomnia.com support
                if origin.startswith("https://") and (
                    origin == "https://hocomnia.com"
                    or origin == "https://www.hocomnia.com" 
                    or origin.endswith(".hocomnia.com")
                ):
                    return True
                # Vercel preview deployments
                if origin.startswith("https://") and ".vercel.app" in origin:
                    return True
                # Localhost development
                if origin.startswith("http://localhost") or origin.startswith("https://localhost"):
                    return True
                return False
        
        temp_middleware = TempAuthMiddleware()
        return temp_middleware._is_origin_allowed(origin)
    except:
        # Fallback to original logic if new middleware isn't available
        if not origin:
            return False

        # Check for exact match first
        if origin in allowed_origins:
            return True

        # Check for wildcard domains (e.g., https://*.vercel.app)
        for allowed_origin in allowed_origins:
            if allowed_origin.startswith("https://*."):
                # Extract the domain part after the asterisk
                domain_suffix = allowed_origin.replace("https://*.", "")
                # Check if the origin ends with this domain suffix
                if origin.startswith("https://") and origin.endswith(f".{domain_suffix}"):
                    return True

        # Enhanced hocomnia.com support - allow all subdomains and the main domain
        if origin.startswith("https://") and (
            origin == "https://hocomnia.com"
            or origin == "https://www.hocomnia.com"
            or origin.endswith(".hocomnia.com")
        ):
            return True

        # Support for Vercel preview deployments
        if origin.startswith("https://") and ".vercel.app" in origin:
            return True

        # Support for localhost development
        if origin.startswith("http://localhost") or origin.startswith("https://localhost"):
            return True

        return False


def setup_cors(app: Quart) -> Quart:
    """
    Configure CORS for the application using environment variables.

    Args:
        app: The Quart application instance

    Returns:
        The application with CORS configured
    """
    # Get CORS settings from environment
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    cors_enabled = os.getenv("CORS_ENABLED", "true").lower() == "true"
    allow_credentials = os.getenv("ALLOW_CREDENTIALS", "true").lower() == "true"

    # Clean up any trailing/leading whitespace in origin strings
    clean_origins = [origin.strip() for origin in cors_origins if origin.strip()]

    # Add default frontend URLs if not present
    default_origins = [
        "https://bartleby.vercel.app",
        "https://hocomnia.com",
        "https://www.hocomnia.com",
        "https://accounts.google.com",
    ]

    for origin in default_origins:
        if origin not in clean_origins:
            clean_origins.append(origin)

    # Add support for wildcard domains if not present
    wildcard_domains = ["https://*.vercel.app", "https://*.hocomnia.com"]
    for domain in wildcard_domains:
        if domain not in clean_origins:
            clean_origins.append(domain)

    # Log CORS configuration with environment details
    app.logger.info("🌐 CORS Configuration:")
    app.logger.info(f"  - Origins: {clean_origins}")
    app.logger.info(f"  - Enabled: {cors_enabled}")
    app.logger.info(f"  - Allow credentials: {allow_credentials}")
    app.logger.info(f"  - Environment: {os.getenv('ENVIRONMENT', 'development')}")
    app.logger.info(f"  - Backend URL: {os.getenv('BACKEND_URL', 'not set')}")
    app.logger.info(f"  - Frontend URL: {os.getenv('FRONTEND_URL', 'not set')}")

    # Apply CORS if enabled
    if cors_enabled:
        # Custom CORS implementation without quart_cors dependency
        @app.before_request
        async def handle_preflight():
            """Handle preflight CORS requests properly for authenticated requests"""
            if request.method == "OPTIONS":
                origin = request.headers.get("Origin")
                app.logger.info(f"🔍 CORS Preflight - Origin: {origin}")

                # Only process if we have an origin header
                if origin and is_origin_allowed(origin, clean_origins):
                    app.logger.info(f"✅ CORS Preflight - Origin allowed: {origin}")
                    headers = {
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                        "Access-Control-Allow-Headers": ", ".join(
                            [
                                "Content-Type",
                                "Authorization",
                                "Accept",
                                # Note: Do not include "Origin" - browsers set this automatically
                                "X-Requested-With",
                                "Content-Length",
                                "Accept-Encoding",
                                "X-CSRF-Token",
                                "google-oauth-token",
                                "google-client-id",
                                "g-csrf-token",
                                "X-Google-OAuth-Token",
                                "X-Google-Client-ID",
                                "Accept-Language",
                                "Cache-Control",
                                "X-API-Key",
                                "X-Auth-Token",
                            ]
                        ),
                        "Access-Control-Allow-Credentials": (
                            "true" if allow_credentials else "false"
                        ),
                        "Access-Control-Max-Age": "3600",
                        "Vary": "Origin",
                    }
                    return "", 204, headers
                else:
                    app.logger.warning(
                        f"❌ CORS Preflight - Origin not allowed: {origin}"
                    )

        @app.after_request
        async def add_cors_headers(response):
            """Add CORS headers to all responses"""
            origin = request.headers.get("Origin")

            # Always log the origin for debugging
            app.logger.info(
                f"🔍 CORS Response - Origin: {origin}, Path: {request.path}"
            )

            if origin and is_origin_allowed(origin, clean_origins):
                app.logger.info(
                    f"✅ CORS Response - Setting headers for origin: {origin}"
                )
                response.headers.set("Access-Control-Allow-Origin", origin)
                if allow_credentials:
                    response.headers.set("Access-Control-Allow-Credentials", "true")
                response.headers.set("Vary", "Origin")
            elif origin:
                app.logger.warning(f"❌ CORS Response - Origin not allowed: {origin}")
            else:
                # For requests without Origin header, still set basic headers
                app.logger.debug(
                    "🔍 CORS Response - No Origin header, setting basic headers"
                )
                response.headers.set("Access-Control-Allow-Origin", "*")
                response.headers.set(
                    "Access-Control-Allow-Methods",
                    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                )

            return response

        app.logger.info("✅ Custom CORS middleware enabled (quart_cors removed)")
    else:
        app.logger.info("⚠️ CORS is disabled")

    return app
