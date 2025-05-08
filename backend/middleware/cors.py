"""CORS middleware configuration."""
import os
import logging
from typing import Dict, Set, List, Optional
from quart import Quart, request, Response

# Initialize logger
logger = logging.getLogger(__name__)

# --- CORS Configuration ---

# Define allowed origins based on environment and defaults
cors_origins_env = os.getenv('CORS_ORIGINS', '')
origins_from_env = {
    o.strip() for o in cors_origins_env.split(',') if o.strip()
}

# Define the set of allowed origins
# Note: Wildcards like '*.google.com' are NOT directly supported when
# 'Access-Control-Allow-Credentials' is 'true'. List specific origins.
ALLOWED_ORIGINS: Set[str] = origins_from_env.union({
    'https://hocomnia.com',
    'https://www.hocomnia.com',
    'https://instantory.vercel.app',
    'https://bartleby.vercel.app',
    'http://localhost:3000',
    'https://vercel.live',
    'https://bartleby-backend-mn96.onrender.com',
    'https://bartleby-backend.onrender.com',
    'https://accounts.google.com',
    'https://apis.google.com',
    'https://www.googleapis.com'
})

ALLOWED_METHODS: str = ','.join(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
ALLOWED_HEADERS: str = ','.join([
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'Referer',
    'User-Agent',
    'Accept-Encoding',
    'X-CSRF-Token',
    'google-oauth-token',
    'google-client_id',
    'g_csrf_token',
    'X-Google-OAuth-Token',
    'X-Google-Client-ID',
    'Cache-Control',
    'X-API-Key',
    'X-Auth-Token'
])
MAX_AGE: str = '86400'  # Cache preflight response for 24 hours (updated to match vercel.json)

# Default security headers
SECURITY_HEADERS: Dict[str, str] = {
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',  # Updated to support Google Auth popups
    'Cross-Origin-Resource-Policy': 'cross-origin',
}

def get_cors_headers(origin: Optional[str]) -> Dict[str, str]:
    """
    Generates CORS headers based on the requesting origin.

    Args:
        origin: The value of the 'Origin' header from the request.

    Returns:
        A dictionary of CORS headers to add to the response.
    """
    headers = {
        'Access-Control-Allow-Methods': ALLOWED_METHODS,
        'Access-Control-Allow-Headers': ALLOWED_HEADERS,
        'Access-Control-Max-Age': MAX_AGE,
    }
    # Add security headers
    headers.update(SECURITY_HEADERS)

    # Dynamic origin handling - if origin is in allowed list, echo it back
    if origin and origin in ALLOWED_ORIGINS:
        logger.debug("CORS: Allowed origin: %s", origin)
        headers['Access-Control-Allow-Origin'] = origin
        headers['Access-Control-Allow-Credentials'] = 'true'
    elif origin:
        logger.warning("CORS: Origin not allowed: %s", origin)
        # Don't add Access-Control-Allow-Origin for security reasons
        # By not including this header for unauthorized origins, browsers will block the response

    return headers

def setup_cors(app: Quart, enabled: bool = True) -> None:
    """
    Configures CORS for the Quart application using a unified approach.

    Args:
        app: The Quart application instance.
        enabled: Whether to enable CORS handling. Defaults to True.
    """
    if not enabled:
        logger.info("CORS handling is disabled.")
        return

    logger.info("Setting up CORS middleware.")
    logger.debug("Allowed Origins: %s", ALLOWED_ORIGINS)

    # 1) Unified preflight OPTIONS handler for all API routes
    @app.route('/api/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/api/<path:path>', methods=['OPTIONS'])
    async def handle_api_options(path: str):  # pylint: disable=unused-variable
        """Handle preflight OPTIONS requests for all /api/* paths."""
        origin = request.headers.get('Origin')
        logger.debug(
            "CORS: Handling OPTIONS request for path: /api/%s from origin: %s",
            path, origin
        )
        # Create a simple 204 No Content response for preflight
        response = Response(status=204)
        # Get and add the appropriate CORS headers
        cors_headers = get_cors_headers(origin)
        response.headers.extend(cors_headers)
        return response

    # 2) Add CORS headers to all responses after the request is processed
    @app.after_request
    async def add_cors_headers_to_response(response: Response) -> Response:  # pylint: disable=unused-variable
        """Add CORS headers to every outgoing response."""
        origin = request.headers.get('Origin')
        # Log only if it's likely a cross-origin request (Origin header is present)
        if origin:
            logger.debug(
                "CORS: Adding headers to response for request from origin: %s, path: %s",
                origin, request.path
            )

        # Get CORS headers based on the origin
        cors_headers = get_cors_headers(origin)

        # Add/update headers in the existing response object
        response.headers.extend(cors_headers)

        return response

    logger.info("CORS middleware setup complete.")


# Create an exportable instance for easy import and use
def default_cors_setup(app: Quart) -> None:
    """Wrapper function to setup CORS with default settings."""
    setup_cors(app)
    logger.info("Default CORS setup applied.")

# Export main CORS configuration components
__all__ = [
    'ALLOWED_ORIGINS', 
    'ALLOWED_METHODS', 
    'ALLOWED_HEADERS',
    'MAX_AGE',
    'SECURITY_HEADERS',
    'get_cors_headers',
    'setup_cors',
    'default_cors_setup'
]
