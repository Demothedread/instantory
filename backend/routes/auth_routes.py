"""Authentication routes and utilities."""

import os
import logging
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from functools import wraps
from typing import Dict, Any
import urllib.parse
import aiohttp
import quart_auth
from quart import redirect, current_app, Blueprint, request, jsonify
from quart_auth import (
    QuartAuth,
    AuthUser,
    login_user,
    logout_user
)
from ..config.security import GoogleOAuthConfig

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


# Environment variables
JWT_SECRET = os.getenv("JWT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
ADMIN_PASSWORD_OVERRIDE = os.getenv("ADMIN_PASSWORD_OVERRIDE")
ACCESS_TOKEN_EXPIRY = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRY = timedelta(days=7)
JWT_ALGORITHM = "HS256"

# Additional allowed Google client IDs (for multi-client setups)
ADDITIONAL_GOOGLE_CLIENT_IDS = os.getenv("ADDITIONAL_GOOGLE_CLIENT_IDS", "").split(",")
ALLOWED_GOOGLE_CLIENT_IDS = [GOOGLE_CLIENT_ID] + [
    id for id in ADDITIONAL_GOOGLE_CLIENT_IDS if id
]

# Backend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://hocomnia.com")

if not JWT_SECRET:
    raise EnvironmentError("JWT_SECRET is not set")

# Blueprint setup
auth_bp = Blueprint("auth", __name__)

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
    expiry = ACCESS_TOKEN_EXPIRY if token_type == "access" else REFRESH_TOKEN_EXPIRY
    payload.update({"exp": datetime.now(tz=timezone.utc) + expiry, "type": token_type})
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str, expected_type: str) -> dict:
    """Verify the JWT token and ensure the type is correct."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != expected_type:
            raise jwt.InvalidTokenError("Invalid token type")
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        logger.warning(f"Token verification failed: {e}")
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
            except jwt.ExpiredSignatureError:
                logger.info("Authentication failed: Token expired")
                return jsonify({"error": "Token expired", "code": "token_expired"}), 401
            except jwt.DecodeError:
                logger.warning("Authentication failed: Token decode error")
                return (
                    jsonify({"error": "Invalid token format", "code": "decode_error"}),
                    401,
                )
            except jwt.InvalidTokenError as e:
                error_type = "invalid_token"
                if "Invalid token type" in str(e):
                    error_type = "invalid_token_type"
                logger.info("Authentication failed: %s - %s", error_type, e)
                return jsonify({"error": str(e), "code": error_type}), 401
            except Exception as e:  # pylint: disable=broad-except
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
    """Create or update a user based on email or google_id."""
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
            return await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE id = $1",
                user["id"],
            )

        else:
            # Create new user
            return await create_user(
                email=email,
                name=name or email.split("@")[0],
                password_hash=password_hash,
                auth_provider=auth_provider,
                google_id=google_id,
                is_verified=is_verified,
            )


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

    except Exception as e:
        # Non-critical error, just log it and continue
        logger.warning(f"Failed to log user login: {e}")


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
    except Exception as e:
        logger.warning(f"Error fetching user data: {e}")
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
                    logger.warning(f"Invalid issuer: {id_info['iss']}")
                    raise ValueError("Invalid token issuer")

                logger.info(
                    "Successfully verified Google token for: %s", id_info.get('email')
                )
                return id_info

            except ValueError as e:
                # This client ID didn't work, try the next one if available
                logger.debug(f"Client ID {client_id} verification failed: {e}")
                continue

        # If we get here, no client ID worked
        logger.warning("Google token verification failed with all client IDs")
        return None

    except Exception as e:
        logger.exception(f"Google token verification error: {e}")
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
        user = await upsert_user(
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
        response = jsonify({"authenticated": True, "user": user, "data": user_data})

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
        logger.exception(f"Google login failed: {e}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500


@auth_bp.route("/google/callback", methods=["GET"])
async def google_callback():
    """Handle Google OAuth callback."""
    try:
        # Get the code parameter
        code = request.args.get("code")
        state = request.args.get("state", "")

        if not code:
            error = request.args.get("error", "Invalid or missing code")
            logger.warning(f"Google callback error: {error}")
            return redirect(f"{FRONTEND_URL}/login?error={urllib.parse.quote(error)}")

        # Exchange the code for tokens
        # Use static methods to properly access configuration values
        client_id = GoogleOAuthConfig.get_client_id()
        client_secret = GoogleOAuthConfig.get_client_secret()
        frontend_origin = request.headers.get("Origin", FRONTEND_URL.split(",")[0])
        redirect_uri = f"{frontend_origin}/auth-callback"

        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
            ) as response:
                token_data = await response.json()

        if "error" in token_data:
            logger.warning(f"Token exchange error: {token_data['error']}")
            return redirect(
                f"{FRONTEND_URL}/login?error={urllib.parse.quote(token_data['error'])}"
            )

        id_token_jwt = token_data.get("id_token")

        # Verify the token
        id_info = await verify_google_token(id_token_jwt)
        if not id_info:
            return redirect(f"{FRONTEND_URL}/login?error=invalid_token")

        # Extract user info
        email = id_info.get("email")
        name = id_info.get("name", email)
        google_id = id_info.get("sub")
        picture = id_info.get("picture")

        # Create or update user
        user = await upsert_user(
            email=email,
            name=name,
            google_id=google_id,
            auth_provider="google",
            is_verified=True,
        )

        # Create tokens with appropriate expiry
        access_token = await create_token(
            {
                "id": user["id"],
                "email": user["email"],
                "is_admin": user.get("is_admin", False),
            },
            "access",
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")

        # Redirect to frontend with tokens
        # Use state if provided (for redirecting to a specific page after login)
        redirect_path = "/dashboard"
        if state and state.startswith("/"):
            redirect_path = state

        # Encode tokens for URL
        encoded_access = urllib.parse.quote(access_token)
        encoded_refresh = urllib.parse.quote(refresh_token)

        # Redirect with tokens in URL parameters (they will be extracted by frontend and stored as cookies)
        return redirect(
            f"{FRONTEND_URL}{redirect_path}?access_token={encoded_access}&refresh_token={encoded_refresh}&auth_success=true"
        )

    except Exception as e:
        logger.exception(f"Google callback error: {e}")
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
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Refresh token expired", "code": "token_expired"}), 401
    except jwt.InvalidTokenError as e:
        return jsonify({"error": str(e), "code": "invalid_token"}), 401
    except Exception as e:
        logger.exception(f"Token refresh failed: {e}")
        return jsonify({"error": "Authentication failed", "code": "auth_error"}), 500


@auth_bp.route("/logout", methods=["POST"])
async def logout():
    """Log out the user by invalidating tokens."""
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
        logger.exception(f"Logout failed: {e}")
        return jsonify({"error": "Logout failed", "details": str(e)}), 500
