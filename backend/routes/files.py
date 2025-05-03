import aiohttp
import io
import logging
import os
import uuid
from pathlib import Path

from quart import Blueprint, jsonify, request, send_file
from PIL import Image

# Import with fallbacks to handle different execution contexts
try:
    from backend.services.storage.manager import storage_manager
    from backend.db import get_db_pool
except ImportError:
    # Alternative import path for when running as a module
        # Fallback to imports from app context
        from quart import current_app
        import logging
        logger = logging.getLogger(__name__)
        
        # Define fallback storage manager if needed
        class FallbackStorageManager:
            async def store_file(self, *args, **kwargs):
                logger.error("Storage manager not available")
                return None
                
            async def move_to_permanent(self, *args, **kwargs):
                logger.error("Storage manager not available")
                return None
                
            async def get_file(self, *args, **kwargs):
                logger.error("Storage manager not available")
                return None
                
            async def delete_file(self, *args, **kwargs):
                logger.error("Storage manager not available")
                return False
                
            def cleanup_temp_files(self, *args, **kwargs):
                logger.error("Storage manager not available")
                
        # Try to get storage manager from app context
        def get_storage_manager():
            if hasattr(current_app, 'storage'):
                return current_app.storage
            return FallbackStorageManager()
            
        storage_manager = get_storage_manager()
        
        # DB pool fallback
        async def get_db_pool():
            """Get database pool from app context if available."""
            if hasattr(current_app, 'db') and hasattr(current_app.db, 'pool'):
                return current_app.db.pool
            raise RuntimeError("Database connection not available")

logger = logging.getLogger(__name__)

files_bp = Blueprint('files', __name__)

# File size limits
MAX_SINGLE_FILE_SIZE_MB = 4.5
MAX_SINGLE_FILE_BYTES = MAX_SINGLE_FILE_SIZE_MB * 1024 * 1024
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Allowed file types
ALLOWED_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
    'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf'}
}

def is_allowed_file(filename: str) -> bool:
    """Check if file has an allowed extension."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return ext in (ALLOWED_EXTENSIONS['images'] | ALLOWED_EXTENSIONS['documents'])

def get_file_type(filename: str) -> str:
    """Return file type category ('images' or 'documents') or None if invalid."""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext in ALLOWED_EXTENSIONS['images']:
        return 'images'
    if ext in ALLOWED_EXTENSIONS['documents']:
        return 'documents'
    return None

def get_content_type(filename: str) -> str:
    """Get MIME type based on file extension."""
    ext = filename.lower().rsplit('.', 1)[-1]
    if ext in {'png', 'jpg', 'jpeg', 'gif', 'webp'}:
        return f"image/{'jpeg' if ext == 'jpg' else ext}"
    elif ext == 'pdf':
        return 'application/pdf'
    elif ext in {'doc', 'docx'}:
        return 'application/msword'
    elif ext == 'txt':
        return 'text/plain'
    elif ext == 'rtf':
        return 'application/rtf'
    return 'application/octet-stream'

@files_bp.route('/upload-url', methods=['POST'])
async def get_upload_url():
    """Get upload URL for file storage."""
    try:
        data = await request.get_json()
        filename = data.get('filename')
        content_type = data.get('contentType')
        file_size = data.get('fileSize', 0)
        user_id = data.get('user_id')

        if not all([filename, content_type, user_id]):
            return jsonify({'error': 'Filename, content type, and user ID are required'}), 400

        if not is_allowed_file(filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        if file_size > MAX_FILE_SIZE_BYTES:
            return jsonify({'error': f'File size exceeds {MAX_FILE_SIZE_MB}MB limit'}), 413

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Store file temporarily
        temp_url = await storage_manager.store_file(
            int(user_id),
            b'',  # Empty placeholder, real content will be uploaded later
            unique_filename,
            content_type,
            is_temporary=True
        )

        return jsonify({
            'filename': unique_filename,
            'temp_url': temp_url
        }), 200

    except Exception as e:
        logger.error(f"Error handling upload request: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/finalize-upload', methods=['POST'])
async def finalize_upload():
    """Move file from temporary to permanent storage."""
    try:
        data = await request.get_json()
        temp_url = data.get('temp_url')
        user_id = data.get('user_id')
        filename = data.get('filename')

        if not all([temp_url, user_id, filename]):
            return jsonify({'error': 'Missing required parameters'}), 400

        content_type = get_content_type(filename)
        permanent_url = await storage_manager.move_to_permanent(
            temp_url,
            int(user_id),
            filename,
            content_type
        )

        if not permanent_url:
            return jsonify({'error': 'Failed to move file to permanent storage'}), 500

        return jsonify({'url': permanent_url}), 200

    except Exception as e:
        logger.error(f"Error finalizing upload: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/download/<path:filename>')
async def download_file(filename):
    """Download a file from storage."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        file_type = get_file_type(filename)
        if not file_type:
            return jsonify({'error': 'Invalid file type'}), 400

        # Verify ownership
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                if file_type == 'images':
                    row = await conn.fetchrow(
                        "SELECT image_url as file_url FROM user_inventory WHERE user_id = $1 AND image_url LIKE $2",
                        int(user_id), f"%{filename}"
                    )
                else:
                    row = await conn.fetchrow(
                        "SELECT file_path as file_url FROM user_documents WHERE user_id = $1 AND file_path LIKE $2",
                        int(user_id), f"%{filename}"
                    )
                if not row:
                    return jsonify({'error': 'File not found or unauthorized'}), 404

        content = await storage_manager.get_file(row['file_url'])
        if not content:
            return jsonify({'error': 'File not found'}), 404

        # Serve the file content
        file_obj = io.BytesIO(content)
        return await send_file(
            file_obj,
            mimetype=get_content_type(filename),
            as_attachment=False,
            attachment_filename=filename
        )

    except Exception as e:
        logger.error(f"Error downloading file {filename}: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/thumbnail/<path:filename>')
async def get_thumbnail(filename):
    """Generate and return a thumbnail for an image file."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        if get_file_type(filename) != 'images':
            return jsonify({'error': 'Not an image file'}), 400

        # Get original image
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT image_url as file_url FROM user_inventory WHERE user_id = $1 AND image_url LIKE $2",
                    int(user_id), f"%{filename}"
                )
                if not row:
                    return jsonify({'error': 'Image not found or unauthorized'}), 404

        content = await storage_manager.get_file(row['file_url'])
        if not content:
            return jsonify({'error': 'Image not found'}), 404

        # Generate thumbnail
        with Image.open(io.BytesIO(content)) as img:
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.thumbnail((200, 200), Image.Resampling.LANCZOS)
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr.seek(0)

        return await send_file(
            img_byte_arr,
            mimetype='image/jpeg',
            as_attachment=False,
            attachment_filename=f"thumb_{filename}"
        )

    except Exception as e:
        logger.error(f"Error generating thumbnail for {filename}: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/cleanup', methods=['POST'])
async def cleanup_files():
    """Clean up temporary files."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        storage_manager.cleanup_temp_files(int(user_id))
        return jsonify({'message': 'Cleanup completed'})

    except Exception as e:
        logger.error(f"Error during file cleanup: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/delete/<path:filename>', methods=['DELETE'])
async def delete_file(filename):
    """Delete a file from storage."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        file_type = get_file_type(filename)
        if not file_type:
            return jsonify({'error': 'Invalid file type'}), 400

        # Verify ownership and get file URL
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                if file_type == 'images':
                    row = await conn.fetchrow(
                        "SELECT image_url as file_url FROM user_inventory WHERE user_id = $1 AND image_url LIKE $2",
                        int(user_id), f"%{filename}"
                    )
                else:
                    row = await conn.fetchrow(
                        "SELECT file_path as file_url FROM user_documents WHERE user_id = $1 AND file_path LIKE $2",
                        int(user_id), f"%{filename}"
                    )
                if not row:
                    return jsonify({'error': 'File not found or unauthorized'}), 404

        # Delete the file
        success = await storage_manager.delete_file(row['file_url'])
        if not success:
            return jsonify({'error': 'Failed to delete file'}), 500

        return jsonify({'message': 'File deleted successfully'}), 200

    except Exception as e:
        logger.error(f"Error deleting file {filename}: {e}")
        return jsonify({'error': str(e)}), 500
