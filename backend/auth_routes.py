import aiohttp
import asyncpg
import os
import logging
from quart import Blueprint, request, jsonify
from db import get_db_pool  # Ensure this import is correct

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google', methods=['POST'])
async def google_auth():
    """Handle Google OAuth authentication"""
    try:
        data = await request.get_json()
        google_token = data.get('token')

        if not google_token:
            return jsonify({'success': False, 'message': 'Google token is required'}), 400

        async with aiohttp.ClientSession() as session:
            async with session.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {google_token}'}
            ) as resp:
                if resp.status != 200:
                    return jsonify({'success': False, 'message': 'Invalid Google token'}), 401
                google_user = await resp.json()

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                user = await conn.fetchrow(
                    'SELECT * FROM users WHERE google_id = $1 OR email = $2',
                    google_user['sub'], google_user['email']
                )

                if not user:
                    user = await conn.fetchrow('''
                        INSERT INTO users (email, name, picture_url, auth_provider, google_id)
                        VALUES ($1, $2, $3, 'google', $4)
                        RETURNING id, email, name, picture_url, created_at
                    ''', google_user['email'], google_user['name'], google_user['picture'], google_user['sub'])
                else:
                    user = await conn.fetchrow('''
                        UPDATE users 
                        SET name = $2, picture_url = $3, last_login = CURRENT_TIMESTAMP,
                            google_id = COALESCE(google_id, $4)
                        WHERE id = $1
                        RETURNING id, email, name, picture_url, created_at
                    ''', user['id'], google_user['name'], google_user['picture'], google_user['sub'])

                return jsonify({
                    'success': True,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'picture_url': user['picture_url'],
                        'created_at': user['created_at'].isoformat() if user['created_at'] else None
                    }
                })

    except Exception as e:
        logger.error(f"Google auth error: {e}")
        return jsonify({'success': False, 'message': 'An error occurred during Google authentication'}), 500

@auth_bp.route('/login', methods=['POST'])
async def login():
    """Handle email login/registration"""
    try:
        data = await request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                user = await conn.fetchrow(
                    'SELECT * FROM users WHERE email = $1 AND auth_provider = \'email\'',
                    email.lower()
                )

                if not user:
                    user = await conn.fetchrow('''
                        INSERT INTO users (email, auth_provider)
                        VALUES ($1, 'email')
                        RETURNING id, email, name, picture_url, created_at
                    ''', email.lower())
                else:
                    user = await conn.fetchrow('''
                        UPDATE users 
                        SET last_login = CURRENT_TIMESTAMP 
                        WHERE id = $1
                        RETURNING id, email, name, picture_url, created_at
                    ''', user['id'])

                return jsonify({
                    'success': True,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'picture_url': user['picture_url'],
                        'created_at': user['created_at'].isoformat() if user['created_at'] else None
                    }
                })

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'success': False, 'message': 'An error occurred during login'}), 500

@auth_bp.route('/user/exports', methods=['GET'])
async def get_user_exports():
    """Get user's export history"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                exports = await conn.fetch('''
                    SELECT * FROM user_exports
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                ''', int(user_id))

                return jsonify([{
                    'id': export['id'],
                    'file_name': export['file_name'],
                    'file_url': export['file_url'],
                    'file_type': export['file_type'],
                    'export_type': export['export_type'],
                    'created_at': export['created_at'].isoformat()
                } for export in exports])

    except Exception as e:
        logger.error(f"Error fetching user exports: {e}")
        return jsonify({'error': 'Failed to fetch exports'}), 500

@auth_bp.route('/user/exports', methods=['POST'])
async def add_user_export():
    """Add a new export to user's history"""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        file_name = data.get('file_name')
        file_url = data.get('file_url')
        file_type = data.get('file_type')
        export_type = data.get('export_type')

        if not all([user_id, file_name, file_url, file_type, export_type]):
            return jsonify({'error': 'Missing required fields'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                export = await conn.fetchrow('''
                    INSERT INTO user_exports (user_id, file_name, file_url, file_type, export_type)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, created_at
                ''', int(user_id), file_name, file_url, file_type, export_type)

                return jsonify({
                    'success': True,
                    'export': {
                        'id': export['id'],
                        'created_at': export['created_at'].isoformat()
                    }
                })

    except Exception as e:
        logger.error(f"Error adding user export: {e}")
        return jsonify({'error': 'Failed to add export'}), 500