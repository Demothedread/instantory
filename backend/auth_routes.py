from quart import Blueprint, request, jsonify, make_response
from .db import get_db_pool, ensure_user_directories, get_user_data_path
import logging
import os
import shutil
import google.auth
import json
import jwt
import bcrypt
from google.auth.transport import requests
from google.oauth2 import id_token
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    logging.warning("Google Auth libraries not installed. Google authentication will be disabled.")

# Configure logging
logging.basicConfig(
    logging.warning("Google Auth libraries not installed. Google authentication will be disabled."),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
    )

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_ACCESS_EXPIRES = timedelta(minutes=15)
JWT_REFRESH_EXPIRES = timedelta(days=7)
JWT_ALGORITHM = "HS256"

async def create_access_token(user_data: dict) -> str:
    """Create access token."""
    return jwt.encode(
        {
            **user_data,
            "exp": datetime.utcnow() + JWT_ACCESS_EXPIRES,
            "type": "access"
        },
        os.getenv('JWT_SECRET'),
        algorithm=JWT_ALGORITHM
    )

# Ensure the JWT_SECRET is set
if not os.getenv('JWT_SECRET'):
    raise EnvironmentError("JWT_SECRET environment variable not set")

def create_tokens(user_data: dict) -> Tuple[str, str]:
    """Create access and refresh tokens."""
    access_token = jwt.encode(
        {
            **user_data,
            "exp": datetime.utcnow() + JWT_ACCESS_EXPIRES,
            "type": "access"
        },
        os.getenv('JWT_SECRET'),
        algorithm=JWT_ALGORITHM
    )
    
    refresh_token = jwt.encode(
        {
            "user_id": user_data["id"],
            "exp": datetime.utcnow() + JWT_REFRESH_EXPIRES,
            "type": "refresh"
        },
        os.getenv('JWT_SECRET'),
        algorithm=JWT_ALGORITHM
    )
    
    return access_token, refresh_token

async def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_token(token: str, token_type: str = "access") -> dict:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(
            token,
            os.getenv('JWT_SECRET'),
            algorithms=[JWT_ALGORITHM]
        )
        
        if payload.get("type") != token_type:
            raise jwt.InvalidTokenError("Invalid token type")
            
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.InvalidTokenError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError(f"Invalid token: {str(e)}")

auth_bp = Blueprint('auth', __name__)

async def get_or_create_user(email: str, name: Optional[str] = None, picture_url: Optional[str] = None, google_id: Optional[str] = None) -> Dict[str, Any]:
    """Get existing user or create new one."""
    async with get_db_pool() as pool:
        async with pool.acquire() as conn:
            # Check if user exists
            user = await conn.fetchrow(
                """
                SELECT id, email, name, picture_url, auth_provider, google_id, created_at, last_login
                FROM users WHERE email = $1
                """,
                email
            )
            
            if user:
                # Update last login and other fields if needed
                await conn.execute(
                    """
                    UPDATE users 
                    SET last_login = CURRENT_TIMESTAMP,
                        name = COALESCE($1, name),
                        picture_url = COALESCE($2, picture_url),
                        google_id = COALESCE($3, google_id)
                    WHERE email = $4
                    """,
                    name, picture_url, google_id, email
                )
            else:
                # Create new user
                user = await conn.fetchrow(
                    """
                    INSERT INTO users (email, name, picture_url, auth_provider, google_id)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, email, name, picture_url, auth_provider, google_id, created_at, last_login
                    """,
                    email, name, picture_url,
                    'google' if google_id else 'email',
                    google_id
                )
                
                # Create user directories
                ensure_user_directories(user['id'])
                
                # Initialize user's inventory from template
                await conn.execute(
                    """
                    INSERT INTO user_inventory (
                        user_id, name, description, category, material,
                        color, dimensions, origin_source, import_cost, retail_price
                    )
                    SELECT $1, name, description, category, material,
                           color, dimensions, origin_source, import_cost, retail_price
                    FROM inventory_template
                    """,
                    user['id']
                )
            
            return dict(user)

@auth_bp.route('/login', methods=['POST'])
async def login():
    """Handle email-based login."""
    try:
        data = await request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        # Get or create user with email
        user = await get_or_create_user(email=email)
        
        # Create JWT tokens
        access_token, refresh_token = create_tokens(user)
        
        response = jsonify({'user': user})
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=JWT_ACCESS_EXPIRES.total_seconds()
        )
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=JWT_REFRESH_EXPIRES.total_seconds()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Authentication failed'}), 401

@auth_bp.route('/google', methods=['POST'])
async def google_auth():
    """Handle Google OAuth authentication."""
    if not GOOGLE_AUTH_AVAILABLE:
        return jsonify({'error': 'Google authentication is not configured'}), 501
        
    try:
        data = await request.get_json()
        token = data.get('credential')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 400
        
        # Verify the token
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return jsonify({'error': 'Invalid issuer'}), 401
        
        # Get or create user
        user = await get_or_create_user(
            email=idinfo['email'],
            name=idinfo.get('name'),
            picture_url=idinfo.get('picture'),
            google_id=idinfo['sub']
        )
        
        # Create JWT tokens
        access_token, refresh_token = create_tokens(user)
        
        response = jsonify({'user': user})
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=JWT_ACCESS_EXPIRES.total_seconds()
        )
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=JWT_REFRESH_EXPIRES.total_seconds()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        return jsonify({'error': 'Authentication failed'}), 401

@auth_bp.route('/session', methods=['GET'])
async def check_session():
    """Check if user is authenticated."""
    try:
        access_token = request.cookies.get('access_token')
        if not access_token:
            return jsonify({'authenticated': False}), 401
        
        # Verify access token
        try:
            payload = verify_token(access_token, "access")
            
            # Get fresh user data
            async with get_db_pool() as pool:
                async with pool.acquire() as conn:
                    user = await conn.fetchrow(
                        """
                        SELECT id, email, name, picture_url, auth_provider
                        FROM users WHERE id = $1
                        """,
                        payload["id"]
                    )
            
            if not user:
                raise jwt.InvalidTokenError("User not found")
                
            return jsonify({'user': dict(user)})
            
        except jwt.InvalidTokenError:
            # Try to refresh using refresh token
            refresh_token = request.cookies.get('refresh_token')
            if not refresh_token:
                return jsonify({'authenticated': False}), 401
                
            payload = verify_token(refresh_token, "refresh")
            
            # Get fresh user data and create new tokens
            async with get_db_pool() as pool:
                async with pool.acquire() as conn:
                    user = await conn.fetchrow(
                        """
                        SELECT id, email, name, picture_url, auth_provider
                        FROM users WHERE id = $1
                        """,
                        payload["user_id"]
                    )
            
            if not user:
                return jsonify({'authenticated': False}), 401
                
            access_token, refresh_token = create_tokens(dict(user))
            
            response = jsonify({'user': dict(user)})
            response.set_cookie(
                'access_token',
                access_token,
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=JWT_ACCESS_EXPIRES.total_seconds()
            )
            response.set_cookie(
                'refresh_token',
                refresh_token,
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=JWT_REFRESH_EXPIRES.total_seconds()
            )
            
            return response
            
    except Exception as e:
        logger.error(f"Session check error: {e}")
        return jsonify({'error': 'Session verification failed'}), 401

@auth_bp.route('/refresh', methods=['POST'])
async def refresh_token():
    """Refresh access token using refresh token."""
    try:
        refresh_token = request.cookies.get('refresh_token')
        if not refresh_token:
            return jsonify({'error': 'No refresh token provided'}), 401
            
        payload = verify_token(refresh_token, "refresh")
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                user = await conn.fetchrow(
                    """
                    SELECT id, email, name, picture_url, auth_provider
                    FROM users WHERE id = $1
                    """,
                    payload["user_id"]
                )
        
        if not user:
            return jsonify({'error': 'User not found'}), 401
            
        access_token, new_refresh_token = create_tokens(dict(user))
        
        response = jsonify({'user': dict(user)})
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=JWT_ACCESS_EXPIRES.total_seconds()
        )
        response.set_cookie(
            'refresh_token',
            new_refresh_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=JWT_REFRESH_EXPIRES.total_seconds()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({'error': 'Token refresh failed'}), 401

@auth_bp.route('/logout', methods=['POST'])
async def logout():
    """Handle user logout."""
    try:
        response = await make_response(jsonify({'message': 'Logged out successfully'}))
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/user/data', methods=['GET'])
async def get_user_data():
    """Get user's data directory information."""
    try:
        access_token = request.cookies.get('access_token')
        if not access_token:
            return jsonify({'error': 'Authentication required'}), 401
            
        payload = verify_token(access_token, "access")
        user_id = payload["id"]
        
        # Get user's data paths
        paths = get_user_data_path(user_id)
        
        return jsonify({
            'paths': {
                'uploads': str(paths['uploads']),
                'inventory_images': str(paths['inventory_images']),
                'documents': str(paths['documents']),
                'exports': str(paths['exports'])
            }
        })
    
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        logger.error(f"Error getting user data: {e}")
        return jsonify({'error': 'Failed to get user data'}), 500

@auth_bp.route('/user/reset', methods=['POST'])
async def reset_user_data():
    """Reset user's inventory and documents."""
    try:
        access_token = request.cookies.get('access_token')
        if not access_token:
            return jsonify({'error': 'Authentication required'}), 401
            
        payload = verify_token(access_token, "access")
        user_id = payload["id"]
        
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Begin transaction
                await conn.execute('BEGIN')
                
                try:
                    # Delete existing inventory and documents
                    await conn.execute('DELETE FROM user_inventory WHERE user_id = $1', user_id)
                    await conn.execute('DELETE FROM user_documents WHERE user_id = $1', user_id)
                    
                    # Reinitialize inventory from template
                    await conn.execute(
                        """
                        INSERT INTO user_inventory (
                            user_id, name, description, category, material,
                            color, dimensions, origin_source, import_cost, retail_price
                        )
                        SELECT $1, name, description, category, material,
                               color, dimensions, origin_source, import_cost, retail_price
                        FROM inventory_template
                        """,
                        user_id
                    )
                    
                    # Clear user's data directories
                    paths = get_user_data_path(user_id)
                    for path in paths.values():
                        if path.exists():
                            for item in path.iterdir():
                                if item.is_file():
                                    item.unlink()
                                elif item.is_dir():
                                    shutil.rmtree(item)
                    
                    # Recreate directories
                    ensure_user_directories(user_id)
                    
                    await conn.execute('COMMIT')
                    return jsonify({'message': 'User data reset successfully'})
                
                except Exception as e:
                    await conn.execute('ROLLBACK')
                    raise
    
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        logger.error(f"Error resetting user data: {e}")
        return jsonify({'error': 'Failed to reset user data'}), 500
