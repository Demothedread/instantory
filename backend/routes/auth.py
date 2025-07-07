"""
Streamlined Authentication Routes
Simplified JWT + Google OAuth + Email Registration
"""

import logging
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

import bcrypt
import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from quart import Blueprint, jsonify, request

# Import configuration
from backend.config.manager import config_manager
from backend.config.database import get_db_pool

# Setup logging
logger = logging.getLogger(__name__)

# Create blueprint
auth_bp = Blueprint("auth", __name__)

# Configuration
JWT_SECRET = config_manager.get_auth_config()["jwt_secret"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRY = timedelta(days=7)
GOOGLE_CLIENT_ID = config_manager.get("GOOGLE_CLIENT_ID")

# Additional Google client IDs for multi-client setups
ADDITIONAL_CLIENT_IDS = config_manager.get_list("ADDITIONAL_GOOGLE_CLIENT_IDS")
ALLOWED_GOOGLE_CLIENT_IDS = [GOOGLE_CLIENT_ID] + [id for id in ADDITIONAL_CLIENT_IDS if id]

def validate_jwt_secret():
    """Validate JWT secret at runtime"""
    if not JWT_SECRET or JWT_SECRET == "dev-secret-key":
        if config_manager.is_production():
            raise EnvironmentError("JWT_SECRET must be set in production")
        logger.warning("Using default JWT_SECRET in development")
    return JWT_SECRET

async def create_token(payload: dict, token_type: str) -> str:
    """Create a signed JWT token with expiration"""
    jwt_secret = validate_jwt_secret()
    expiry = ACCESS_TOKEN_EXPIRY if token_type == "access" else REFRESH_TOKEN_EXPIRY
    payload.update({
        "exp": datetime.now(tz=timezone.utc) + expiry, 
        "type": token_type
    })
    return jwt.encode(payload, jwt_secret, algorithm=JWT_ALGORITHM)

def verify_token(token: str, expected_type: str) -> dict:
    """Verify JWT token and ensure correct type"""
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
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

async def verify_google_token(token: str) -> Dict[str, Any]:
    """Verify Google OAuth token and return payload"""
    try:
        for client_id in ALLOWED_GOOGLE_CLIENT_IDS:
            if not client_id:
                continue
            try:
                id_info = id_token.verify_oauth2_token(
                    token, google_requests.Request(), client_id
                )
                if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                    raise ValueError("Invalid token issuer")
                logger.info("Successfully verified Google token for: %s", id_info.get("email"))
                return id_info
            except ValueError:
                continue
        logger.warning("Google token verification failed with all client IDs")
        return None
    except Exception as e:
        logger.exception("Google token verification error: %s", e)
        return None

async def get_user_by_email(email: str):
    """Get user by email from database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            "SELECT id, email, password_hash, auth_provider, is_verified, google_id, name, is_admin "
            "FROM users WHERE email = $1", email
        )

async def get_user_by_google_id(google_id: str):
    """Get user by Google ID from database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            "SELECT id, email, auth_provider, is_verified, google_id, name, is_admin "
            "FROM users WHERE google_id = $1", google_id
        )

async def create_user(email: str, name: str, password_hash: str = None, 
                     auth_provider: str = "email", google_id: str = None, 
                     is_verified: bool = False, is_admin: bool = False):
    """Create new user in database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            """
            INSERT INTO users (email, name, password_hash, auth_provider, google_id, is_verified, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, name, auth_provider, is_verified, is_admin
            """,
            email, name, password_hash, auth_provider, google_id, is_verified, is_admin
        )

async def upsert_user(email: str, name: str = None, password_hash: str = None,
                     auth_provider: str = "email", google_id: str = None, 
                     is_verified: bool = False):
    """Create or update user. Returns (user_dict, is_new_user)"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Check if user exists
        user = None
        if google_id and auth_provider == "google":
            user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE google_id = $1",
                google_id
            )
        
        if not user and email:
            user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE email = $1",
                email
            )
        
        if user:
            # Update existing user
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
                user["id"], name, auth_provider, google_id, is_verified
            )
            
            updated_user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE id = $1",
                user["id"]
            )
            return dict(updated_user), False
        else:
            # Create new user
            new_user = await create_user(
                email=email,
                name=name or email.split("@")[0],
                password_hash=password_hash,
                auth_provider=auth_provider,
                google_id=google_id,
                is_verified=is_verified
            )
            return dict(new_user), True

async def log_user_login(user_id: int, login_method: str):
    """Log user login activity"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Check if user_logins table exists
            table_exists = await conn.fetchrow(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'user_logins'
                )
                """
            )
            
            if table_exists and table_exists[0]:
                await conn.execute(
                    "INSERT INTO user_logins (user_id, login_time, login_method) VALUES ($1, NOW(), $2)",
                    user_id, login_method
                )
    except Exception as e:
        logger.warning("Failed to log user login: %s", e)

def set_auth_cookies(response, access_token: str, refresh_token: str):
    """Set secure authentication cookies"""
    cookie_settings = {
        "httponly": True,
        "secure": True,
        "samesite": "None"
    }
    
    response.set_cookie(
        "access_token", access_token,
        max_age=int(ACCESS_TOKEN_EXPIRY.total_seconds()),
        **cookie_settings
    )
    response.set_cookie(
        "refresh_token", refresh_token,
        max_age=int(REFRESH_TOKEN_EXPIRY.total_seconds()),
        **cookie_settings
    )

# Routes

@auth_bp.route("/login", methods=["POST"])
async def login():
    """Email/password login"""
    try:
        data = await request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Get user
        user = await get_user_by_email(email)
        if not user or not user["password_hash"] or not verify_password(password, user["password_hash"]):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Log login
        await log_user_login(user["id"], "email")
        
        # Create tokens
        access_token = await create_token(
            {"id": user["id"], "email": user["email"], "is_admin": user.get("is_admin", False)},
            "access"
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")
        
        # Create response
        response = jsonify({
            "authenticated": True,
            "user": dict(user),
            "data": {"last_login": None}  # Simplified user data
        })
        
        set_auth_cookies(response, access_token, refresh_token)
        return response
        
    except Exception as e:
        logger.exception("Login failed: %s", e)
        return jsonify({"error": "Authentication failed"}), 500

@auth_bp.route("/register", methods=["POST"])
async def register():
    """Email/password registration"""
    try:
        data = await request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", email.split("@")[0] if email else "")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        # Check if user exists
        existing_user = await get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "User already exists"}), 409
        
        # Create user
        password_hash = hash_password(password)
        user = await create_user(
            email=email,
            name=name,
            password_hash=password_hash,
            auth_provider="email",
            is_verified=False
        )
        
        # Log registration
        await log_user_login(user["id"], "register")
        
        # Create tokens
        access_token = await create_token(
            {"id": user["id"], "email": user["email"], "is_admin": user.get("is_admin", False)},
            "access"
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")
        
        # Create response
        response = jsonify({
            "authenticated": True,
            "user": dict(user),
            "data": {"last_login": None}
        })
        
        set_auth_cookies(response, access_token, refresh_token)
        return response
        
    except Exception as e:
        logger.exception("Registration failed: %s", e)
        return jsonify({"error": "Registration failed"}), 500

@auth_bp.route("/google", methods=["POST"])
async def google_login():
    """Google OAuth login"""
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
            is_verified=True
        )
        
        # Log login
        await log_user_login(user["id"], "google")
        
        # Create tokens
        access_token = await create_token(
            {"id": user["id"], "email": user["email"], "is_admin": user.get("is_admin", False)},
            "access"
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")
        
        # Add picture if available
        if picture:
            user["picture_url"] = picture
        
        # Create response
        response = jsonify({
            "authenticated": True,
            "user": user,
            "data": {"last_login": None},
            "is_new_user": is_new_user
        })
        
        set_auth_cookies(response, access_token, refresh_token)
        return response
        
    except Exception as e:
        logger.exception("Google login failed: %s", e)
        return jsonify({"error": "Authentication failed"}), 500

@auth_bp.route("/logout", methods=["POST"])
async def logout():
    """Logout user"""
    try:
        response = jsonify({"success": True, "message": "Logged out successfully"})
        
        # Clear cookies
        cookie_settings = {
            "httponly": True,
            "secure": True,
            "samesite": "None",
            "expires": 0,
            "max_age": 0
        }
        
        response.set_cookie("access_token", "", **cookie_settings)
        response.set_cookie("refresh_token", "", **cookie_settings)
        
        return response
        
    except Exception as e:
        logger.exception("Logout failed: %s", e)
        return jsonify({"error": "Logout failed"}), 500

@auth_bp.route("/session", methods=["GET"])
async def check_session():
    """Check if user has valid session"""
    try:
        # Get access token from cookies or Authorization header
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
            return jsonify({"authenticated": False, "error": "Invalid token payload"}), 401
        
        # Get user from database
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, email, name, auth_provider, is_verified, is_admin FROM users WHERE id = $1",
                user_id
            )
        
        if not user:
            return jsonify({"authenticated": False, "error": "User not found"}), 401
        
        return jsonify({
            "authenticated": True,
            "user": dict(user),
            "data": {"last_login": None}
        })
        
    except Exception as e:
        logger.exception("Session check failed: %s", e)
        return jsonify({"authenticated": False, "error": str(e)}), 500

@auth_bp.route("/refresh", methods=["POST"])
async def refresh_token_route():
    """Refresh expired access token"""
    try:
        # Get refresh token
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            data = await request.get_json(silent=True)
            if data:
                refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            return jsonify({"error": "Refresh token required"}), 400
        
        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        user_id = payload.get("user_id")
        
        if not user_id:
            return jsonify({"error": "Invalid refresh token"}), 401
        
        # Get user
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, email, is_admin FROM users WHERE id = $1", user_id
            )
        
        if not user:
            return jsonify({"error": "User not found"}), 401
        
        # Create new tokens
        access_token = await create_token(
            {"id": user["id"], "email": user["email"], "is_admin": user["is_admin"]},
            "access"
        )
        new_refresh_token = await create_token({"user_id": user["id"]}, "refresh")
        
        response = jsonify({"authenticated": True, "token_refreshed": True})
        set_auth_cookies(response, access_token, new_refresh_token)
        
        return response
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"error": "Refresh token expired"}), 401
    except Exception as e:
        logger.exception("Token refresh failed: %s", e)
        return jsonify({"error": "Authentication failed"}), 500

# Admin login route (simplified)
@auth_bp.route("/admin/login", methods=["POST"])
async def admin_login():
    """Admin login with override password"""
    try:
        data = await request.get_json()
        email = data.get("email")
        admin_password = data.get("admin_password")
        
        admin_override = config_manager.get("ADMIN_PASSWORD_OVERRIDE")
        if not admin_override or admin_password != admin_override:
            return jsonify({"error": "Invalid admin password"}), 401
        
        # Get user
        user = await get_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 401
        
        # Log admin login
        await log_user_login(user["id"], "admin")
        
        # Force admin privileges
        user_dict = dict(user)
        user_dict["is_admin"] = True
        
        # Create tokens with admin privileges
        access_token = await create_token(
            {"id": user["id"], "email": user["email"], "is_admin": True},
            "access"
        )
        refresh_token = await create_token({"user_id": user["id"]}, "refresh")
        
        response = jsonify({
            "authenticated": True,
            "user": user_dict,
            "data": {"last_login": None}
        })
        
        set_auth_cookies(response, access_token, refresh_token)
        return response
        
    except Exception as e:
        logger.exception("Admin login failed: %s", e)
        return jsonify({"error": "Admin authentication failed"}), 500
