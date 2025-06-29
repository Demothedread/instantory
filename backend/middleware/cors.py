"""CORS middleware for the backend application."""

import os
from typing import List, Optional
from quart import Quart, request
from quart_cors import cors


def is_origin_allowed(origin: str, allowed_origins: List[str]) -> bool:
    """
    Check if the origin is allowed, supporting wildcard domains.

    Args:
        origin: The request origin to check
        allowed_origins: List of allowed origins

    Returns:
        True if origin is allowed, False otherwise
    """
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
        origin == "https://hocomnia.com" or
        origin == "https://www.hocomnia.com" or
        origin.endswith(".hocomnia.com")
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

    # Log CORS configuration
    app.logger.info(f"Setting up CORS with origins: {clean_origins}")
    app.logger.info(f"CORS enabled: {cors_enabled}")
    app.logger.info(f"Allow credentials: {allow_credentials}")

    # Apply CORS if enabled
    if cors_enabled:
        # When credentials are allowed, we must handle Origin dynamically
        if allow_credentials:

            @app.before_request
            async def handle_preflight():
                """Handle preflight CORS requests properly for authenticated requests"""
                if request.method == "OPTIONS":
                    origin = request.headers.get("Origin")

                    # Only process if we have an origin header
                    if origin and is_origin_allowed(origin, clean_origins):
                        headers = {
                            "Access-Control-Allow-Origin": origin,
                            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                            "Access-Control-Allow-Headers": ", ".join(
                                [
                                    "Content-Type",
                                    "Authorization",
                                    "Accept",
                                    "Origin",
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
                            "Access-Control-Allow-Credentials": "true",
                            "Access-Control-Max-Age": "3600",
                            "Vary": "Origin",
                        }
                        return "", 204, headers

            @app.after_request
            async def add_cors_headers(response):
                """Add CORS headers to all responses"""
                origin = request.headers.get("Origin")

                if origin and is_origin_allowed(origin, clean_origins):
                    response.headers.set("Access-Control-Allow-Origin", origin)
                    response.headers.set("Access-Control-Allow-Credentials", "true")
                    response.headers.set("Vary", "Origin")

                return response

            # Apply basic CORS for non-credentialed requests
            # This still helps with simple requests
            return cors(
                app,
                allow_origin=clean_origins,
                allow_credentials=allow_credentials,
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                allow_headers=[
                    "Content-Type",
                    "Authorization",
                    "Accept",
                    "Origin",
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
                ],
            )
        else:
            # For non-credentialed requests, standard CORS is fine
            return cors(
                app,
                allow_origin=clean_origins,
                allow_credentials=allow_credentials,
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                allow_headers=[
                    "Content-Type",
                    "Authorization",
                    "Accept",
                    "Origin",
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
                ],
            )

    return app
