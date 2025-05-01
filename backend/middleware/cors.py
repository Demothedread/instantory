"""CORS middleware configuration."""
import os
import logging
from quart import Quart, request, Response
from typing import Dict, Set

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
# We explicitly list accounts.google.com as required.
ALLOWED_ORIGINS: Set[str] = origins_from_env.union({
    'https://instantory.vercel.app',
    'https://hocomnia.com',
    'https://www.hocomnia.com',
    'https://bartleby.vercel.app',
    'http://localhost:3000', # For local development
    'https://vercel.live', # For Vercel previews
    'https://bartleby-backend.onrender.com', # Backend hosting
    'https://accounts.google.com', # Google Sign-In
    # Add other specific origins if needed, avoid wildcards with credentials.
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
MAX_AGE: str = '3600' # Cache preflight response for 1 hour

def get_cors_headers(origin: str | None) -> Dict[str, str]:
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
        # Security headers (adjust if necessary, 'unsafe-none' might be needed for Google Auth compatibility)
        'Cross-Origin-Embedder-Policy': 'unsafe-none', # Consider 'require-corp' if possible
        'Cross-Origin-Opener-Policy': 'unsafe-none',   # Consider 'same-origin' if possible
        'Cross-Origin-Resource-Policy': 'cross-origin', # Allows cross-origin requests
    }

    if origin and origin in ALLOWED_ORIGINS:
        logger.debug("CORS: Allowed origin: %s", origin)
        headers['Access-Control-Allow-Origin'] = origin
        # Allow credentials only for explicitly allowed origins
        headers['Access-Control-Allow-Credentials'] = 'true'
    elif origin:
        # Log denied origins but don't add Allow-Origin header
        logger.warning("CORS: Origin not allowed: %s", origin)
        # Do NOT add Access-Control-Allow-Origin
        # Do NOT add Access-Control-Allow-Credentials

    # If origin is None (e.g., same-origin request or server-side),
    # no origin-specific headers are added, but common headers are still present.

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
    # This needs to be registered *before* blueprints that might define
    # their own OPTIONS handlers for the same paths.
    @app.route('/api/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/api/<path:path>', methods=['OPTIONS'])
    async def handle_api_options(path: str):
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
    async def add_cors_headers_to_response(response: Response) -> Response:
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
        # Using extend preserves existing headers and adds/overwrites CORS ones
        response.headers.extend(cors_headers)

        return response

    logger.info("CORS middleware setup complete.")

# Example Usage (as described in user prompt):
# from quart import Quart
# from your_blueprints import auth_bp # Assuming you have blueprints defined
#
# app = Quart(__name__)
# setup_cors(app) # Call setup_cors *before* registering blueprints
#
# # Register blueprints after CORS setup
# app.register_blueprint(auth_bp, url_prefix='/api/auth')
#
# if __name__ == '__main__':
#     app.run(debug=True) # Example run command
