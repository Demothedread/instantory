from quart import Blueprint, request, jsonify, make_response
from db import get_db_pool, ensure_user_directories, get_user_data_path
import logging
import os
import shutil
from typing import Optional, Dict, Any
import json
from datetime import datetime, timedelta

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    logger.warning("Google Auth libraries not installed. Google authentication will be disabled.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        return jsonify({'user': user})
    
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        return jsonify({'error': 'Authentication failed'}), 401

@auth_bp.route('/session', methods=['GET'])
async def check_session():
    """Check if user is authenticated."""
    try:
        # Get session token from cookie
        session_token = request.cookies.get('session')
        if not session_token:
            return jsonify({'authenticated': False}), 401
        
        # Verify session token and get user info
        # This is a placeholder - implement your session verification logic
        user = {'authenticated': True}  # Replace with actual user data
        
        return jsonify(user)
    
    except Exception as e:
        logger.error(f"Session check error: {e}")
        return jsonify({'error': 'Session verification failed'}), 401

@auth_bp.route('/logout', methods=['POST'])
async def logout():
    """Handle user logout."""
    try:
        response = await make_response(jsonify({'message': 'Logged out successfully'}))
        response.delete_cookie('session')
        return response
    
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/user/data', methods=['GET'])
async def get_user_data():
    """Get user's data directory information."""
    try:
        # Get user ID from session
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Get user's data paths
        paths = get_user_data_path(int(user_id))
        
        return jsonify({
            'paths': {
                'uploads': str(paths['uploads']),
                'inventory_images': str(paths['inventory_images']),
                'documents': str(paths['documents']),
                'exports': str(paths['exports'])
            }
        })
    
    except Exception as e:
        logger.error(f"Error getting user data: {e}")
        return jsonify({'error': 'Failed to get user data'}), 500

@auth_bp.route('/user/reset', methods=['POST'])
async def reset_user_data():
    """Reset user's inventory and documents."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
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
                    paths = get_user_data_path(int(user_id))
                    for path in paths.values():
                        if path.exists():
                            for item in path.iterdir():
                                if item.is_file():
                                    item.unlink()
                                elif item.is_dir():
                                    shutil.rmtree(item)
                    
                    # Recreate directories
                    ensure_user_directories(int(user_id))
                    
                    await conn.execute('COMMIT')
                    return jsonify({'message': 'User data reset successfully'})
                
                except Exception as e:
                    await conn.execute('ROLLBACK')
                    raise
    
    except Exception as e:
        logger.error(f"Error resetting user data: {e}")
        return jsonify({'error': 'Failed to reset user data'}), 500
