from quart import Blueprint, jsonify, request, send_file
from db import get_db_pool
import aiohttp
import logging
import os
import uuid
from pathlib import Path
from PIL import Image
import io

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
    """Check if file has allowed extension."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return ext in (ALLOWED_EXTENSIONS['images'] | ALLOWED_EXTENSIONS['documents'])

def get_file_type(filename: str) -> str:
    """Get file type category (image/document) or None if invalid."""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext in ALLOWED_EXTENSIONS['images']:
        return 'images'
    if ext in ALLOWED_EXTENSIONS['documents']:
        return 'documents'
    return None

@files_bp.route('/upload-url', methods=['POST'])
async def get_upload_url():
    """Get Vercel Blob upload URL."""
    try:
        data = await request.get_json()
        filename = data.get('filename')
        content_type = data.get('contentType')
        file_size = data.get('fileSize', 0)

        if not filename or not content_type:
            return jsonify({'error': 'Filename and content type are required'}), 400

        # Validate file type
        if not is_allowed_file(filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        if file_size > MAX_FILE_SIZE_BYTES:
            return jsonify({'error': f'File size exceeds {MAX_FILE_SIZE_MB}MB limit'}), 413

        # Get Vercel Blob token from environment
        blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        if not blob_token:
            return jsonify({'error': 'Blob storage not configured'}), 500

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{filename}"

        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.vercel.com/v9/blob/upload",
                headers={"Authorization": f"Bearer {blob_token}"},
                json={"filename": unique_filename, "contentType": content_type}
            ) as response:
                if response.status != 200:
                    return jsonify({'error': 'Failed to get Vercel upload URL'}), 500
                upload_data = await response.json()
        
        return jsonify({'url': upload_data['url']}), 200

    except Exception as e:
        logger.error(f"Error generating blob URL: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/download/<path:filename>')
async def download_file(filename):
    """Download a file from user's data directory."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Get file type to determine directory
        file_type = get_file_type(filename)
        if not file_type:
            return jsonify({'error': 'Invalid file type'}), 400

        # Construct file path based on type
        if file_type == 'images':
            file_path = Path(os.getenv('DATA_DIR')) / str(user_id) / 'images' / 'inventory' / filename
        else:
            file_path = Path(os.getenv('DATA_DIR')) / str(user_id) / 'documents' / filename

        if not file_path.exists():
            return jsonify({'error': 'File not found'}), 404

        # Verify file belongs to user
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                if file_type == 'images':
                    row = await conn.fetchrow("""
                        SELECT 1 FROM user_inventory
                        WHERE user_id = $1 AND image_url LIKE $2
                    """, int(user_id), f"%{filename}")
                else:
                    row = await conn.fetchrow("""
                        SELECT 1 FROM user_documents
                        WHERE user_id = $1 AND file_path LIKE $2
                    """, int(user_id), f"%{filename}")

                if not row:
                    return jsonify({'error': 'Unauthorized'}), 403

        return await send_file(str(file_path))

    except Exception as e:
        logger.error(f"Error downloading file {filename}: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/thumbnail/<path:filename>')
async def get_thumbnail(filename):
    """Get thumbnail of an image file."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Verify file type is image
        if get_file_type(filename) != 'images':
            return jsonify({'error': 'Not an image file'}), 400

        file_path = Path(os.getenv('DATA_DIR')) / str(user_id) / 'images' / 'inventory' / filename
        if not file_path.exists():
            return jsonify({'error': 'Image not found'}), 404

        # Verify image belongs to user
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT 1 FROM user_inventory
                    WHERE user_id = $1 AND image_url LIKE $2
                """, int(user_id), f"%{filename}")

                if not row:
                    return jsonify({'error': 'Unauthorized'}), 403

        # Generate thumbnail
        with Image.open(file_path) as img:
            # Convert RGBA to RGB if needed
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Resize maintaining aspect ratio
            img.thumbnail((200, 200), Image.Resampling.LANCZOS)
            
            # Save to bytes
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
    """Clean up orphaned files."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Get all valid file paths
                image_rows = await conn.fetch("""
                    SELECT image_url FROM user_inventory WHERE user_id = $1
                """, int(user_id))
                doc_rows = await conn.fetch("""
                    SELECT file_path FROM user_documents WHERE user_id = $1
                """, int(user_id))

                valid_paths = set()
                for row in image_rows:
                    if row['image_url']:
                        valid_paths.add(Path(row['image_url']).name)
                for row in doc_rows:
                    if row['file_path']:
                        valid_paths.add(Path(row['file_path']).name)

                # Check and remove orphaned files
                removed = 0
                user_dir = Path(os.getenv('DATA_DIR')) / str(user_id)
                
                # Check images
                img_dir = user_dir / 'images' / 'inventory'
                if img_dir.exists():
                    for file_path in img_dir.glob('*'):
                        if file_path.name not in valid_paths:
                            file_path.unlink()
                            removed += 1

                # Check documents
                doc_dir = user_dir / 'documents'
                if doc_dir.exists():
                    for file_path in doc_dir.glob('*'):
                        if file_path.name not in valid_paths:
                            file_path.unlink()
                            removed += 1

                return jsonify({
                    'message': 'Cleanup completed',
                    'files_removed': removed
                })

    except Exception as e:
        logger.error(f"Error during file cleanup: {e}")
        return jsonify({'error': str(e)}), 500
