"""Authentication routes and utilities."""
import os
import logging
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt 
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from backend.config.database import get_db_pool
from backend.config.logging import logger
from quart import Blueprint, request, jsonify

logger = logging.getLogger(__name__)

# Environment variables
JWT_SECRET = os.getenv('JWT_SECRET')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
ACCESS_TOKEN_EXPIRY = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRY = timedelta(days=7)
JWT_ALGORITHM = "HS256"

if not JWT_SECRET:
    raise EnvironmentError("JWT_SECRET is not set")

# Blueprint setup
auth_bp = Blueprint('auth', __name__)

# --- Utility Functions --- #

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
        logger.warning("Token verification failed: %s", e)
        raise


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode(), hashed_password.encode())
# --- Database Access Functions --- #

async def get_user_by_email(email: str):
    """Retrieve a user by email from the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            "SELECT id, email, password_hash, auth_provider, is_verified, google_id, name "
            "FROM users WHERE email = $1", email
        )

async def create_user(email: str, name: str, password_hash: str = None, auth_provider: str = "email", google_id: str = None, is_verified: bool = False):
    """Create a new user in the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            """
            INSERT INTO users (email, name, password_hash, auth_provider, google_id, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, name, auth_provider, is_verified
            """,
            email, name, password_hash, auth_provider, google_id, is_verified
        )

async def get_user_by_id(user_id: int):
    """Retrieve a user by ID from the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            "SELECT id, email, name, auth_provider, is_verified "
            "FROM users WHERE id = $1", user_id
        )

async def create_user_storage(user_id: int):
    """Create storage entries for a new user."""
    # Determine storage backend from environment
    storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
    
    # Generate unique path for user storage
    import uuid
    storage_path_base = f"user_{user_id}_{uuid.uuid4().hex[:8]}"
    
    if storage_backend == 'vercel':
        storage_path = f"vercel/{storage_path_base}"
    elif storage_backend == 's3':
        storage_path = f"s3/{storage_path_base}"
    else:
        storage_path = f"local/{storage_path_base}"
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Insert storage configuration
        await conn.execute("""
            INSERT INTO user_storage (user_id, storage_type, storage_path)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, storage_type) DO NOTHING
        """, user_id, storage_backend, storage_path)
        
    return storage_path

async def get_user_storage(user_id: int):
    """Get storage information for a user."""
    storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT storage_path 
            FROM user_storage 
            WHERE user_id = $1 AND storage_type = $2
        """, user_id, storage_backend)
        
        if row:
            return {
                "storage_type": storage_backend,
                "storage_path": row['storage_path']
            }
        return None

async def log_user_login(user_id: int, auth_provider: str):
    """
    Log a user login event in the user_logins table using the internal Render-hosted PostgreSQL database.
    """
    # Retrieve IP address and User-Agent from the request
    ip_address = request.remote_addr or request.headers.get('X-Forwarded-For', 'unknown').split(',')[0].strip()
    user_agent = request.headers.get('User-Agent', '')
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO user_logins (user_id, ip_address, auth_provider, user_agent)
            VALUES ($1, $2, $3, $4)
            """,
            user_id, ip_address, auth_provider, user_agent
        )
    logger.info(f"Login event recorded for user {user_id} via {auth_provider}")

async def get_user_data(user_id: int):
    """Retrieve a user's inventory, documents, and storage information."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        inventory = await conn.fetch("SELECT * FROM user_inventory WHERE user_id = $1", user_id)
        documents = await conn.fetch("SELECT * FROM user_documents WHERE user_id = $1", user_id)
        
        # Get storage info
        storage_info = await get_user_storage(user_id)
        if not storage_info:
            # Create storage if it doesn't exist
            storage_path = await create_user_storage(user_id)
            storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
            storage_info = {
                "storage_type": storage_backend,
                "storage_path": storage_path
            }
        
        return {
            "inventory": [dict(item) for item in inventory],
            "documents": [dict(doc) for doc in documents],
            "storage": storage_info
        }

async def upsert_user(email: str, name: str, google_id: str = None, auth_provider: str = "email", is_verified: bool = False):
    """Create a user if they don't exist, or update their info if they do."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Try to find existing user
        user = await get_user_by_email(email)
        
        if user:
            # Update existing user
            await conn.execute("""
                UPDATE users 
                SET name = $1, google_id = $2, auth_provider = $3, is_verified = $4
                WHERE email = $5
            """, name, google_id, auth_provider, is_verified, email)
            
            # Fetch updated user
            user = await get_user_by_email(email)
        else:
            # Create new user
            user = await create_user(
                email=email,
                name=name,
                auth_provider=auth_provider,
                google_id=google_id,
                is_verified=is_verified
            )
            
            # Ensure user has storage
            await create_user_storage(user['id'])
            
        return dict(user)
# --- Authentication Routes --- #
@auth_bp.route('/internal/login_details', methods=['GET'])
async def login_details():
    """Retrieve the login history for a specified user."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, login_time, ip_address, auth_provider, user_agent
                FROM user_logins
                WHERE user_id = $1
                ORDER BY login_time DESC
                """,
                int(user_id)
            )
        return jsonify({"login_details": [dict(row) for row in rows]})
    except Exception as e:
        logger.exception("Failed to fetch login details")
        return jsonify({"error": "Failed to fetch login details", "details": str(e)}), 500

@auth_bp.route('/google', methods=['POST'])
async def google_login():
    """Authenticate a user via Google OAuth."""
    try:
        data = await request.get_json()
        credential = data.get('credential')

        if not credential:
            return jsonify({"error": "Missing Google OAuth credential"}), 400

        # Verify Google token
        try:
            # Create a Google auth request object
            google_request = google_requests.Request()
            # Verify the token
            id_info = id_token.verify_oauth2_token(credential, google_request, GOOGLE_CLIENT_ID)
            
            # Verify issuer
            if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return jsonify({"error": "Invalid token issuer"}), 403
            
            # Extract user info
            email = id_info.get('email')
            name = id_info.get('name', email)
            google_id = id_info.get('sub')
            
            # Upsert user (create or update)
            user = await upsert_user(email, name, google_id, auth_provider="google", is_verified=True)
            
            # Log login
            await log_user_login(user['id'], 'google')
            
            # Create tokens
            access_token = await create_token({"id": user['id'], "email": user['email']}, "access")
            refresh_token = await create_token({"user_id": user['id']}, "refresh")
            
            # Get user data
            user_data = await get_user_data(user['id'])
            
            # Create response
            response = jsonify({
                "message": "Google login successful",
                "user": user,
                "is_verified": user.get("is_verified", False),
                "data": user_data
            })
            
            # Set secure cookies
            response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite='Strict')
            response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite='Strict')
            
            return response
            
        except ValueError as ve:
            logger.warning(f"Invalid Google token: {ve}")
            return jsonify({"error": "Invalid Google token", "details": str(ve)}), 401

    except Exception as e:
        logger.exception("Google login failed")
        return jsonify({"error": "Google login failed", "details": str(e)}), 500
@auth_bp.route('/register', methods=['POST'])
async def register():
    """Register a new user via email and password."""
    try:
        data = await request.get_json()
        email, password, name = data.get('email'), data.get('password'), data.get('name')

        if not all([email, password, name]):
            return jsonify({"error": "Email, password, and name are required"}), 400

        if await get_user_by_email(email):
            return jsonify({"error": "User already exists"}), 409

        password_hash = hash_password(password)
        user = await create_user(email, name, password_hash)
        
        # Create user storage
        await create_user_storage(user['id'])
        
        # Log login
        await log_user_login(user['id'], 'email')

        access_token = await create_token({"id": user['id'], "email": user['email']}, "access")
        refresh_token = await create_token({"user_id": user['id']}, "refresh")

        response = jsonify({
            "message": "Registration successful",
            "user": dict(user),
            "data": await get_user_data(user['id'])
        })
        response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite='Strict')
        response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite='Strict')

        return response

    except Exception as e:
        logger.exception("Registration failed")
        return jsonify({"error": "Registration failed", "details": str(e)}), 500
@auth_bp.route('/login', methods=['POST'])
async def login():
    """Authenticate an existing user via email and password."""
    try:
        data = await request.get_json()
        email, password = data.get('email'), data.get('password')

        if not all([email, password]):
            return jsonify({"error": "Email and password are required"}), 400

        user = await get_user_by_email(email)
        if not user or not verify_password(password, user['password_hash']):
            return jsonify({"error": "Invalid email or password"}), 401
            
        # Log login
        await log_user_login(user['id'], 'email')

        access_token = await create_token({"id": user['id'], "email": user['email']}, "access")
        refresh_token = await create_token({"user_id": user['id']}, "refresh")

        response = jsonify({
            "message": "Login successful",
            "user": dict(user),
            "data": await get_user_data(user['id'])
        })
        response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite='Strict')
        response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite='Strict')

        return response

    except Exception as e:
        logger.exception("Login failed")
        return jsonify({"error": "Login failed", "details": str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
async def refresh():
    """Refresh the access token using the refresh token."""
    try:
        refresh_token = request.cookies.get('refresh_token')
        if not refresh_token:
            return jsonify({"error": "Missing refresh token"}), 401

        payload = verify_token(refresh_token, "refresh")
        user_id = payload.get('user_id')

        user = await get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        access_token = await create_token({"id": user['id'], "email": user['email']}, "access")

        response = jsonify({"message": "Token refreshed", "user": dict(user)})
        response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite='Strict')

        return response

    except Exception as e:
        logger.exception("Token refresh failed")
        return jsonify({"error": "Token refresh failed", "details": str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
async def logout():
    """Log out the current user."""
    response = jsonify({"message": "Logout successful"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@auth_bp.route('/session', methods=['GET'])
async def check_session():
    """Check if the user is authenticated and retrieve their data."""
    try:
        access_token = request.cookies.get('access_token')
        if not access_token:
            return jsonify({"authenticated": False}), 401

        payload = verify_token(access_token, "access")
        user_id = payload.get('id')

        user = await get_user_by_id(user_id)
        if user:
            return jsonify({
                "authenticated": True,
                "user": dict(user),
                "is_verified": user.get("is_verified", False),
                "data": await get_user_data(user_id)
            })

        return jsonify({"authenticated": False}), 404

    except Exception as e:
        logger.warning(f"Session check failed: {e}")
        return jsonify({"authenticated": False}), 401
