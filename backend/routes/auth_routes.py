"""Authentication routes and utilities."""

import logging
import urllib.parse
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any, Dict

import aiohttp
import bcrypt
import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from quart import Blueprint, current_app, jsonify, redirect, request
from quart_auth import AuthUser, QuartAuth, login_user, logout_user

# Import centralized configuration manager
from backend.config.manager import config_manager

# Try to import the GoogleOAuthConfig from two possible locations
try:
    from ..config.security import GoogleOAuthConfig

    logger = logging.getLogger(__name__)
    logger.info("Imported GoogleOAuthConfig from security module")
except ImportError:
    try:
        from backend.config.oauth import GoogleOAuthConfig

        logger = logging.getLogger(__name__)
        logger.info("Imported GoogleOAuthConfig from oauth module")
    except ImportError:
        # If both imports fail, we'll create a minimal implementation
        logger = logging.getLogger(__name__)
        logger.warning(
            "Failed to import GoogleOAuthConfig, using minimal implementation"
        )

        class GoogleOAuthConfig:
            @staticmethod
            def get_client_id():
                return config_manager.get("GOOGLE_CLIENT_ID", "")

            @staticmethod
            def get_client_secret():
                return config_manager.get("GOOGLE_CLIENT_SECRET", "")

            @staticmethod
            def get_redirect_uri():
                backend_url = config_manager.get(
                    "BACKEND_URL", "https://bartleby-backend-mn96.onrender.com"
                )
                return f"{backend_url}/api/auth/google/callback"


# Import with fallbacks to handle different execution contexts
try:
    from backend.config.database import get_db_pool
    from backend.config.logging import logger
except ImportError:
    # Alternative import path for when running as a module
    logger = logging.getLogger(__name__)

    async def get_db_pool():
        """Get database pool from app context if available."""
        if hasattr(current_app, "db") and hasattr(current_app.db, "pool"):
            return current_app.db.pool
        raise RuntimeError("Database connection not available")


# Environment variables using config manager
def get_auth_config():
    """Get authentication configuration at runtime."""
    return config_manager.get_auth_config()


def get_jwt_secret():
    """Get JWT secret with validation."""
    jwt_secret = config_manager.get_auth_config()["jwt_secret"]
    if not jwt_secret or jwt_secret == "dev-secret-key":
        if config_manager.is_production():
            raise EnvironmentError("JWT_SECRET must be set in production")
        logger.warning("Using default JWT_SECRET in development")
    return jwt_secret


# Get Google configuration
GOOGLE_CLIENT_ID = config_manager.get("GOOGLE_CLIENT_ID")
ADMIN_PASSWORD_OVERRIDE = config_manager.get("ADMIN_PASSWORD_OVERRIDE")
ACCESS_TOKEN_EXPIRY = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRY = timedelta(days=7)
JWT_ALGORITHM = "HS256"

# Additional allowed Google client IDs (for multi-client setups)
ADDITIONAL_GOOGLE_CLIENT_IDS = config_manager.get_list("ADDITIONAL_GOOGLE_CLIENT_IDS")
ALLOWED_GOOGLE_CLIENT_IDS = [GOOGLE_CLIENT_ID] + [
    id for id in ADDITIONAL_GOOGLE_CLIENT_IDS if id
]

# Backend URL
FRONTEND_URL = config_manager.get("FRONTEND_URL", "https://hocomnia.com")

# Blueprint setup
auth_bp = Blueprint("auth", __name__)


# Debug route to test if auth blueprint is accessible
@auth_bp.route("/test", methods=["GET"])
async def test_auth_blueprint():
    """Test route to verify auth blueprint is working."""
    return jsonify(
        {
            "message": "Auth blueprint is working",
            "timestamp": datetime.now().isoformat(),
        }
    )


def validate_jwt_secret():
    """Validate JWT_SECRET at runtime"""
    return get_jwt_secret()


# --- Custom Auth User Class --- #


class BartlebyAuthUser(AuthUser):
    """Extended AuthUser class with additional user data."""

    def __init__(self, auth_id, user_data=None):
        super().__init__(auth_id)
        self.user_data = user_data or {}

    @property
    def auth_id(self):
        return self.auth_id

    @property
    def is_admin(self):
        return self.user_data.get("is_admin", False)

    @property
    def email(self):
        return self.user_data.get("email", "")

    @property
    def name(self):
        return self.user_data.get("name", "")


# --- Utility Functions --- #


def setup_auth(app):
    """Setup QuartAuth on the application."""
    QuartAuth(app)


async def create_token(payload: dict, token_type: str) -> str:
    """Create a signed JWT token with an expiration."""
    jwt_secret = validate_jwt_secret()
    expiry = ACCESS_TOKEN_EXPIRY if token_type == "access" else REFRESH_TOKEN_EXPIRY
    payload.update({"exp": datetime.now(tz=timezone.utc) + expiry, "type": token_type})
    return jwt.encode(payload, jwt_secret, algorithm=JWT_ALGORITHM)


def verify_token(token: str, expected_type: str) -> dict:
    """Verify the JWT token and ensure the type is correct."""
    try:
        jwt_secret = validate_jwt_secret()
        payload = jwt.decode(token, jwt_secret, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != expected_type:
            raise jwt.InvalidTokenError("Invalid token type")
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        logger.warning("Token verification failed: %s", e)
        raise


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode(), hashed_password.encode())


# --- Authentication Middleware --- #


def require_auth():
    """Decorator to require authentication for routes."""

    def decorator(f):
        @wraps(f)
        async def decorated_function(*args, **kwargs):
            try:
                # Get the access token from cookies or Authorization header
                access_token = request.cookies.get("access_token")
                if not access_token:
                    auth_header = request.headers.get("Authorization")
                    if auth_header and auth_header.startswith("Bearer "):
                        access_token = auth_header.split(" ")[1]
                    else:
                        # Also check query parameters (for WebSocket/redirect flows)
                        access_token = request.args.get("access_token")
                        if not access_token:
                            return (
                                jsonify(
                                    {
                                        "error": "Authentication required",
                                        "code": "auth_required",
                                    }
                                ),
                                401,
                            )

                # Verify the token
                payload = verify_token(access_token, "access")

                # Attach user info to request for use in route handlers
                request.user_id = payload.get("id")
                request.email = payload.get("email")
                request.is_admin = payload.get("is_admin", False)

                return await f(*args, **kwargs)
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError) as e:
                logger.warning("Authentication middleware error: %s", e)
                return (
                    jsonify({"error": "Authentication failed", "code": "auth_error"}),
                    401,
                )

        return decorated_function

    return decorator


def require_admin():
    """Decorator to require admin privileges for routes."""

    def decorator(f):
        @wraps(f)
        async def decorated_function(*args, **kwargs):
            try:
                # First require authentication
                auth_result = await require_auth()(lambda: None)()
                if isinstance(auth_result, tuple) and auth_result[1] != 200:
                    return auth_result

                # Check if user is admin
                if not request.is_admin:
                    return jsonify({"error": "Admin privileges required"}), 403

                return await f(*args, **kwargs)
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError) as e:
                logger.warning("Admin middleware error: %s", e)
                return jsonify({"error": "Admin privileges required"}), 403
            except Exception as e:
                logger.warning(f"Admin middleware error: {e}")
                return jsonify({"error": "Admin privileges required"}), 403

        return decorated_function

    return decorator


# --- Database Access Functions --- #


async def get_user_by_email(email: str):
    """Retrieve a user by email from the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            "SELECT id, email, password_hash, auth_provider, is_verified, google_id, name, is_admin "
            "FROM users WHERE email = $1",
            email,
        )


async def get_user_by_google_id(google_id: str):
    """Retrieve a user by Google ID from the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            "SELECT id, email, auth_provider, is_verified, google_id, name, is_admin "
            "FROM users WHERE google_id = $1",
            google_id,
        )


async def create_user(
    email: str,
    name: str,
    password_hash: str = None,
    auth_provider: str = "email",
    google_id: str = None,
    is_verified: bool = False,
    is_admin: bool = False,
):
    """Create a new user in the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            """
            INSERT INTO users (email, name, password_hash, auth_provider, google_id, is_verified, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, name, auth_provider, is_verified, is_admin
            """,
            email,
            name,
            password_hash,
            auth_provider,
            google_id,
            is_verified,
            is_admin,
        )


async def upsert_user(
    email: str,
    name: str = None,
    password_hash: str = None,
    auth_provider: str = "email",
    google_id: str = None,
    is_verified: bool = False,
):
    """Create or update a user based on email or google_id. Returns user dict and is_new_user flag."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Check if user exists
        user = None
        if google_id and auth_provider == "google":
            user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE google_id = $1",
                google_id,
            )

        if not user and email:
            user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE email = $1",
                email,
            )

        if user:
            # User exists, update their information
            await conn.execute(
                """
                UPDATE users SET 
                    name = COALESCE($2, name),
                    auth_provider = COALESCE($3, auth_provider),
                    google_id = COALESCE($4, google_id),
                    is_verified = COALESCE($5, is_verified),
                    updated_at = NOW()
                WHERE id = $1
                """,
                user["id"],
                name,
                auth_provider,
                google_id,
                is_verified,
            )

            # Fetch updated user
            updated_user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE id = $1",
                user["id"],
            )
            return dict(updated_user), False  # is_new_user = False

        else:
            # Create new user
            new_user = await create_user(
                email=email,
                name=name or email.split("@")[0],
                password_hash=password_hash,
                auth_provider=auth_provider,
                google_id=google_id,
                is_verified=is_verified,
            )
            return dict(new_user), True  # is_new_user = True


async def log_user_login(user_id: int, login_method: str):
    """Log user login activity."""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Check if the user_logins table exists
            table_check = await conn.fetchrow(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'user_logins'
                )
                """
            )

            # If table exists, log the login with the login_method
            if table_check and table_check[0]:
                await conn.execute(
                    """
                    INSERT INTO user_logins (user_id, login_timestamp, login_method) 
                    VALUES ($1, NOW(), $2)
                    """,
                    user_id,
                    login_method,
                )

    except (ConnectionError, TimeoutError) as e:
        # Non-critical error, just log it and continue
        logger.warning("Failed to log user login: %s", e)


async def get_user_data(user_id: int):
    """Get additional user data from the database."""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Get settings if they exist
            user_settings = await conn.fetchrow(
                "SELECT theme, language, notifications_enabled FROM user_settings WHERE user_id = $1",
                user_id,
            )

            # Get last login time
            last_login = await conn.fetchrow(
                """
                SELECT login_timestamp 
                FROM user_logins 
                WHERE user_id = $1 
                ORDER BY login_timestamp DESC 
                LIMIT 1 OFFSET 1
                """,
                user_id,
            )

            return {
                "settings": (
                    dict(user_settings)
                    if user_settings
                    else {
                        "theme": "light",
                        "language": "en",
                        "notifications_enabled": True,
                    }
                ),
                "last_login": (
                    last_login["login_timestamp"].isoformat() if last_login else None
                ),
            }
    except (ConnectionError, TimeoutError) as e:
        logger.warning("Error fetching user data: %s", e)
        return {
            "settings": {
                "theme": "light",
                "language": "en",
                "notifications_enabled": True,
            }
        }


# --- Google Token Verification --- #


async def verify_google_token(token: str) -> Dict[str, Any]:
    """Verify a Google OAuth token and return the payload if valid."""
    try:
        # First try with the primary client ID
        for client_id in ALLOWED_GOOGLE_CLIENT_IDS:
            if not client_id:
                continue

            try:
                id_info = id_token.verify_oauth2_token(
                    token, google_requests.Request(), client_id
                )

                # Token verification succeeded
                if id_info["iss"] not in [
                    "accounts.google.com",
                    "https://accounts.google.com",
                ]:
                    logger.warning("Invalid issuer: %s", id_info["iss"])
                    raise ValueError("Invalid token issuer")

                logger.info(
                    "Successfully verified Google token for: %s", id_info.get("email")
                )
                return id_info

            except ValueError as e:
                # This client ID didn't work, try the next one if available
                logger.debug("Client ID %s verification failed: %s", client_id, e)
                continue

        # If we get here, no client ID worked
        logger.warning("Google token verification failed with all client IDs")
        return None

    except (ConnectionError, TimeoutError, ValueError) as e:
        logger.exception("Google token verification error: %s", e)
        return None


# --- Google Login Route --- #


@auth_bp.route("/google", methods=["POST"])
async def google_login():
    """Authenticate a user via Google OAuth credential."""
    try:
        data = await request.get_json()
        credential = data.get("credential")

        if not credential:
            return jsonify({"error": "Missing Google credential"}), 400

        # Verify Google token
        id_info = await verify_google_token(credential)
        if not id_info:
            return jsonify({"error": "Invalid Google credential"}), 401

        # Extract user info
        email = id_info.get("email")
        name = id_info.get("name", email)
        google_id = id_info.get("sub")
        picture = id_info.get("picture")

        # Create or update user
        user, is_new_user = await upsert_user(
            email=email,
            name=name,
            google_id=google_id,
            auth_provider="google",
            is_verified=True,
        )

        # Log login
        await log_user_login(user["id"], "google")

        # Create tokens
        access_token = await create_token(
            {
                "id": user["id"],
                "email": user["email"],
                "is_admin": user.get("is_admin", False),
            },
            "access",
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")

        # Get user data
        user_data = await get_user_data(user["id"])

        # Add profile picture if available
        if picture:
            user["picture_url"] = picture

        # Login using Quart-Auth
        auth_user = BartlebyAuthUser(
            int(user["id"]),
            {
                "email": user["email"],
                "name": user.get("name"),
                "is_admin": user.get("is_admin", False),
                "picture_url": picture,
            },
        )
        login_user(auth_user)

        # Optimize cookie settings for cross-origin usage
        # Always secure=True for cross-origin cookies - required by browsers
        # SameSite=None allows cross-origin use while being secure
        response = jsonify(
            {
                "authenticated": True,
                "user": user,
                "data": user_data,
                "is_new_user": is_new_user,
            }
        )

        # Set cookies with cross-origin compatible settings
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=True,  # Must be secure for cross-origin
            samesite="None",  # Allows cross-origin
            max_age=ACCESS_TOKEN_EXPIRY.total_seconds(),
        )
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=REFRESH_TOKEN_EXPIRY.total_seconds(),
        )

        return response

    except Exception as e:
        logger.exception("Google login failed: %s", e)
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500


@auth_bp.route("/google/callback", methods=["GET", "OPTIONS"])
async def google_callback():
    """Handle Google OAuth callback."""
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        if origin and (
            origin == "https://hocomnia.com"
            or origin == "https://www.hocomnia.com"
            or origin.endswith(".hocomnia.com")
            or "vercel.app" in origin
            or "localhost" in origin
        ):
            headers = {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
            return "", 204, headers
        else:
            return "", 403

    try:
        # Get the code parameter
        code = request.args.get("code")
        state = request.args.get("state", "")

        logger.info(
            "Google callback received: code present: %s, state: %s", bool(code), state
        )
        logger.info("Request headers: %s", dict(request.headers))

        if not code:
            error = request.args.get("error", "Invalid or missing code")
            logger.warning("Google callback error: %s", error)
            return redirect(f"{FRONTEND_URL}/login?error={urllib.parse.quote(error)}")

        # Exchange the code for tokens
        # Use static methods to properly access configuration values
        client_id = GoogleOAuthConfig.get_client_id()
        client_secret = GoogleOAuthConfig.get_client_secret()

        # Fix the redirect_uri to match what's registered with Google
        redirect_uri = GoogleOAuthConfig.get_redirect_uri()
        logger.info("Using redirect URI: %s", redirect_uri)

        async with aiohttp.ClientSession() as session:
            try:
                token_request_data = {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                }
                logger.info("Token exchange request data: %s", token_request_data)

                async with session.post(
                    "https://oauth2.googleapis.com/token",
                    data=token_request_data,
                ) as response:
                    token_data = await response.json()
                    logger.info("Token exchange response status: %s", response.status)

                    if response.status != 200:
                        logger.error("Token exchange error response: %s", token_data)
            except (aiohttp.ClientError, TimeoutError) as e:
                logger.exception("Error during token exchange request: %s", e)
                return redirect(
                    f"{FRONTEND_URL}/login?error=token_exchange_error&details={urllib.parse.quote(str(e))}"
                )

        if "error" in token_data:
            logger.warning("Token exchange error: %s", token_data["error"])
            return redirect(
                f"{FRONTEND_URL}/login?error={urllib.parse.quote(token_data.get('error'))}&details={urllib.parse.quote(token_data.get('error_description', ''))}"
            )

        id_token_jwt = token_data.get("id_token")
        if not id_token_jwt:
            logger.error("No ID token in response")
            return redirect(f"{FRONTEND_URL}/login?error=missing_id_token")

        # Verify the token
        id_info = await verify_google_token(id_token_jwt)
        if not id_info:
            logger.error("Failed to verify Google ID token")
            return redirect(f"{FRONTEND_URL}/login?error=invalid_token")

        # Extract user info
        email = id_info.get("email")
        name = id_info.get("name", email)
        google_id = id_info.get("sub")
        picture = id_info.get("picture")

        logger.info(
            "User info from Google: email=%s, name=%s, picture=%s",
            email,
            name,
            bool(picture),
        )

        # Create or update user
        try:
            user, is_new_user = await upsert_user(
                email=email,
                name=name,
                google_id=google_id,
                auth_provider="google",
                is_verified=True,
            )
            logger.info("User created/updated: %s", user["id"])
        except (ConnectionError, ValueError) as e:
            logger.exception("Error creating/updating user: %s", e)
            return redirect(
                f"{FRONTEND_URL}/login?error=user_creation_failed&details={urllib.parse.quote(str(e))}"
            )

        # Create tokens with appropriate expiry
        try:
            access_token = await create_token(
                {
                    "id": user["id"],
                    "email": user["email"],
                    "is_admin": user.get("is_admin", False),
                },
                "access",
            )
            refresh_token = await create_token({"user_id": user["id"]}, "refresh")
            logger.info("Tokens created for user %s", user["id"])
        except (jwt.InvalidTokenError, ValueError) as e:
            logger.exception("Error creating tokens: %s", e)
            return redirect(
                f"{FRONTEND_URL}/login?error=token_creation_failed&details={urllib.parse.quote(str(e))}"
            )

        # Redirect to frontend with tokens
        # Use state if provided (for redirecting to a specific page after login)
        redirect_path = "/dashboard"
        if state and state.startswith("/"):
            redirect_path = state

        # Encode tokens for URL
        encoded_access = urllib.parse.quote(access_token)
        encoded_refresh = urllib.parse.quote(refresh_token)
        # Add is_new_user to the redirect URL
        is_new_user_str = "true" if is_new_user else "false"
        final_redirect_url = f"{FRONTEND_URL}{redirect_path}?access_token={encoded_access}&refresh_token={encoded_refresh}&auth_success=true&is_new_user={is_new_user_str}"
        logger.info(
            "Redirecting to frontend: %s%s with tokens", FRONTEND_URL, redirect_path
        )

        return redirect(final_redirect_url)

    except (ConnectionError, ValueError, aiohttp.ClientError) as e:
        logger.exception("Google callback error: %s", e)
        return redirect(f"{FRONTEND_URL}/login?error={urllib.parse.quote(str(e))}")


@auth_bp.route("/refresh", methods=["POST"])
async def refresh_token_route():
    """Refresh an expired access token using a valid refresh token."""
    try:
        # Check for refresh token in cookies or request body
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            data = await request.get_json(silent=True)
            if data:
                refresh_token = data.get("refresh_token")

        if not refresh_token:
            return (
                jsonify(
                    {"error": "Refresh token required", "code": "refresh_required"}
                ),
                400,
            )

        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        user_id = payload.get("user_id")

        if not user_id:
            return (
                jsonify({"error": "Invalid refresh token", "code": "invalid_token"}),
                401,
            )

        # Get user data
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, email, is_admin FROM users WHERE id = $1", user_id
            )

        if not user:
            return jsonify({"error": "User not found", "code": "user_not_found"}), 401

        # Create new access token
        access_token = await create_token(
            {"id": user["id"], "email": user["email"], "is_admin": user["is_admin"]},
            "access",
        )

        # Optionally create new refresh token (token rotation)
        new_refresh_token = await create_token({"user_id": user["id"]}, "refresh")

        # Return response with new tokens
        response = jsonify({"authenticated": True, "token_refreshed": True})

        # Use consistent secure cookie settings across all auth-related endpoints
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=True,  # Always secure for cross-origin
            samesite="None",  # Required for cross-origin
            max_age=ACCESS_TOKEN_EXPIRY.total_seconds(),
        )
        response.set_cookie(
            "refresh_token",
            new_refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=REFRESH_TOKEN_EXPIRY.total_seconds(),
        )

        return response
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        return jsonify({"error": "Refresh token expired", "code": "token_expired"}), 401
    except jwt.InvalidTokenError as e:
        return jsonify({"error": str(e), "code": "invalid_token"}), 401
    except Exception as e:
        logger.exception("Token refresh failed: %s", e)
        return jsonify({"error": "Authentication failed", "code": "auth_error"}), 500


@auth_bp.route("/logout", methods=["POST"])
async def logout():
    """
    Log out the user by invalidating tokens.

    """
    try:
        # Logout using Quart-Auth
        logout_user()

        # Create a response that clears auth cookies
        response = jsonify({"success": True, "message": "Logged out successfully"})

        # Clear cookies with cross-origin compatible settings
        response.set_cookie(
            "access_token",
            "",
            httponly=True,
            secure=True,
            samesite="None",
            expires=0,
            max_age=0,
        )
        response.set_cookie(
            "refresh_token",
            "",
            httponly=True,
            secure=True,
            samesite="None",
            expires=0,
            max_age=0,
        )

        return response
    except Exception as e:
        logger.exception("Logout failed: %s", e)
        return jsonify({"error": "Logout failed", "details": str(e)}), 500


@auth_bp.route("/register", methods=["POST"])
async def register():
    """Register a new user with email and password."""
    try:
        data = await request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", email.split("@")[0] if email else "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Check if user already exists
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            existing_user = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1", email
            )

            if existing_user:
                return jsonify({"error": "User already exists"}), 409

            # Hash password
            password_hash = hash_password(password)

            # Create user
            user = await create_user(
                email=email,
                name=name,
                password_hash=password_hash,
                auth_provider="email",
                is_verified=False,  # Requires email verification in a full implementation
            )

            # Log login
            await log_user_login(user["id"], "register")

            # Create tokens
            access_token = await create_token(
                {
                    "id": user["id"],
                    "email": user["email"],
                    "is_admin": user.get("is_admin", False),
                },
                "access",
            )
            refresh_token = await create_token({"user_id": user["id"]}, "refresh")

            # Get user data
            user_data = await get_user_data(user["id"])

            # Login using Quart-Auth
            auth_user = BartlebyAuthUser(
                int(user["id"]),
                {
                    "email": user["email"],
                    "name": user.get("name"),
                    "is_admin": user.get("is_admin", False),
                },
            )
            login_user(auth_user)

            # Return response with user data and tokens
            response = jsonify({"authenticated": True, "user": user, "data": user_data})

            # Use consistent secure cookie settings across all auth endpoints
            response.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=True,  # Always secure for cross-origin
                samesite="None",  # Required for cross-origin
                max_age=ACCESS_TOKEN_EXPIRY.total_seconds(),
            )
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=True,
                samesite="None",
                max_age=REFRESH_TOKEN_EXPIRY.total_seconds(),
            )

            return response

    except Exception as e:
        logger.exception("Registration failed: %s", e)
        return jsonify({"error": "Registration failed", "details": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
async def login():
    """Log in with email and password."""
    try:
        data = await request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Get user
        user = await get_user_by_email(email)
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Check password
        if not user["password_hash"] or not verify_password(
            password, user["password_hash"]
        ):
            return jsonify({"error": "Invalid email or password"}), 401

        # Log login
        await log_user_login(user["id"], "email")

        # Create tokens
        access_token = await create_token(
            {
                "id": user["id"],
                "email": user["email"],
                "is_admin": user.get("is_admin", False),
            },
            "access",
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")

        # Get user data
        user_data = await get_user_data(user["id"])

        # Login using Quart-Auth
        auth_user = BartlebyAuthUser(
            int(user["id"]),
            {
                "email": user["email"],
                "name": user.get("name"),
                "is_admin": user.get("is_admin", False),
            },
        )
        login_user(auth_user)

        # Return response with user data and tokens
        response = jsonify({"authenticated": True, "user": user, "data": user_data})

        # Use consistent secure cookie settings across all auth endpoints
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=ACCESS_TOKEN_EXPIRY.total_seconds(),
        )
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=REFRESH_TOKEN_EXPIRY.total_seconds(),
        )

        return response

    except Exception as e:
        logger.exception("Login failed: %s", e)
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500


@auth_bp.route("/session", methods=["GET"])
async def check_session():
    """Check if the user has a valid session."""
    try:
        # Get the access token from cookies or Authorization header
        access_token = request.cookies.get("access_token")
        if not access_token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]

        if not access_token:
            return jsonify({"authenticated": False, "error": "No access token"}), 401

        # Verify token
        try:
            payload = verify_token(access_token, "access")
        except jwt.ExpiredSignatureError:
            return jsonify({"authenticated": False, "error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"authenticated": False, "error": "Invalid token"}), 401

        user_id = payload.get("id")
        if not user_id:
            return (
                jsonify({"authenticated": False, "error": "Invalid token payload"}),
                401,
            )

        # Get user
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                """
                SELECT id, email, name, auth_provider, is_verified, is_admin 
                FROM users WHERE id = $1
                """,
                user_id,
            )

        if not user:
            return jsonify({"authenticated": False, "error": "User not found"}), 401

        # Get user data
        user_data = await get_user_data(user["id"])

        # Return user info
        return jsonify({"authenticated": True, "user": dict(user), "data": user_data})

    except Exception as e:
        logger.exception(f"Session check failed: {e}")
        return jsonify({"authenticated": False, "error": str(e)}), 500


@auth_bp.route("/sessions", methods=["GET"])
async def check_sessions():
    """Check if the user has a valid session (plural endpoint for compatibility)."""
    # This is just an alias for the /session endpoint to handle both /session and /sessions
    return await check_session()
