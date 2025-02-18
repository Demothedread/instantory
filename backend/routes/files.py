import aiohttp
import io
import logging
import os
import uuid
from pathlib import Path

from quart import Blueprint, jsonify, request, send_file
from PIL import Image

from ..config.storage import storage_service   # New import
from ..db import get_db_pool

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

# Helper: unified file retrieval
async def retrieve_file(user_id: str, filename: str, file_type: str) -> bytes:
    storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
    if storage_backend == 'generic':
        # Local filesystem retrieval
        data_dir = os.getenv('DATA_DIR')
        if file_type == 'images':
            file_path = Path(data_dir) / str(user_id) / 'images' / 'inventory' / filename
        else:
            file_path = Path(data_dir) / str(user_id) / 'documents' / filename
        if not file_path.exists():
            return None
        with open(file_path, 'rb') as f:
            return f.read()
    
    else:
        # If local/generic: read from filesystem
        
        # For cloud storage, get file URL from DB and use the unified storage service.
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                if file_type == 'images':
                    row = await conn.fetchrow(
                        "SELECT image_url as file_path FROM user_inventory WHERE user_id = $1 AND image_url LIKE $2",
                        int(user_id), f"%{filename}"
                    )
                else:
                    row = await conn.fetchrow(
                        "SELECT file_path FROM user_documents WHERE user_id = $1 AND file_path LIKE $2",
                        int(user_id), f"%{filename}"
                    )
                if not row:
                    return None
                file_url = row['file_path']
        # Import the unified storage service (from your s3 module, which handles S3/Vercel)
        content = await storage_service.get_document(file_url)
        return content if content else None 
    
@files_bp.route('/upload-url', methods=['POST'])
async def get_upload_url():
    """Get upload URL for Vercel Blob (or similar service)."""
    try:
        data = await request.get_json()
        filename = data.get('filename')
        content_type = data.get('contentType')
        file_size = data.get('fileSize', 0)

        if not filename or not content_type:
            return jsonify({'error': 'Filename and content type are required'}), 400

        if not is_allowed_file(filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        if file_size > MAX_FILE_SIZE_BYTES:
            return jsonify({'error': f'File size exceeds {MAX_FILE_SIZE_MB}MB limit'}), 413

        # For cloud storage, use Vercel Blob upload.
        blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        if not blob_token:
            return jsonify({'error': 'Blob storage not configured'}), 500

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
    """Download a file using unified storage options."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        file_type = get_file_type(filename)
        if not file_type:
            return jsonify({'error': 'Invalid file type'}), 400

        storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
        if storage_backend == 'generic':
            data_dir = os.getenv('DATA_DIR')
            if file_type == 'images':
                file_path = Path(data_dir) / str(user_id) / 'images' / 'inventory' / filename
            else:
                file_path = Path(data_dir) / str(user_id) / 'documents' / filename
            if not file_path.exists():
                return jsonify({'error': 'File not found'}), 404
            # Verify ownership
            async with get_db_pool() as pool:
                async with pool.acquire() as conn:
                    if file_type == 'images':
                        row = await conn.fetchrow(
                            "SELECT 1 FROM user_inventory WHERE user_id = $1 AND image_url LIKE $2",
                            int(user_id), f"%{filename}"
                        )
                    else:
                        row = await conn.fetchrow(
                            "SELECT 1 FROM user_documents WHERE user_id = $1 AND file_path LIKE $2",
                            int(user_id), f"%{filename}"
                        )
                    if not row:
                        return jsonify({'error': 'Unauthorized'}), 403
            return await send_file(str(file_path))
        else:
            file_url = f"{user_id}/{filename}"
            try:
                content = await storage_service.get_document(file_url)
                if not content:
                    content = await retrieve_file(user_id, filename, file_type)
                    if not content:
                        return jsonify({'error': 'File not found or unauthorized'}), 404
            except Exception as e:
                logger.error(f"Error retrieving file {filename}: {e}")
                return jsonify({'error': 'Failed to retrieve file'}), 500
            # Serve the file content
            file_obj = io.BytesIO(content)
            ext = filename.lower().rsplit('.', 1)[-1]
            if ext in {'png', 'jpg', 'jpeg', 'gif', 'webp'}:
                mimetype = f"image/{'jpeg' if ext == 'jpg' else ext}"
            elif ext == 'pdf':
                mimetype = 'application/pdf'
            elif ext == 'doc':
                mimetype = 'application/msword'
            elif ext == 'docx':
                mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            elif ext == 'txt':
                mimetype = 'text/plain'
            elif ext == 'rtf':
                mimetype = 'application/rtf'
            elif ext == 'xls':
                mimetype = 'application/vnd.ms-excel'
            elif ext == 'xlsx':
                mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            else:
                mimetype = 'application/octet-stream'
            return await send_file(
                file_obj,
                mimetype=mimetype,
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

        storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
        if storage_backend == 'generic':
            file_path = Path(os.getenv('DATA_DIR')) / str(user_id) / 'images' / 'inventory' / filename
            if not file_path.exists():
                return jsonify({'error': 'Image not found'}), 404
            with Image.open(file_path) as img:
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                img.thumbnail((240, 240), Image.Resampling.LANCZOS)
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='JPEG', quality=85)
                img_byte_arr.seek(0)
            return await send_file(
                img_byte_arr,
                mimetype='image/jpeg',
                as_attachment=False,
                attachment_filename=f"thumb_{filename}"
            )
        else:
            # For cloud storage, retrieve the file content via unified service.
            content = await retrieve_file(user_id, filename, 'images')
            if not content:
                return jsonify({'error': 'Image not found or unauthorized'}), 404
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
    """Clean up orphaned files (only applicable for local storage)."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
        if storage_backend != 'generic':
            return jsonify({'message': 'Cleanup not applicable for cloud storage'}), 200

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                image_rows = await conn.fetch("SELECT image_url FROM user_inventory WHERE user_id = $1", int(user_id))
                doc_rows = await conn.fetch("SELECT file_path FROM user_documents WHERE user_id = $1", int(user_id))
                valid_paths = set()
                for row in image_rows:
                    if row['image_url']:
                        valid_paths.add(Path(row['image_url']).name)
                for row in doc_rows:
                    if row['file_path']:
                        valid_paths.add(Path(row['file_path']).name)

        removed = 0
        user_dir = Path(os.getenv('DATA_DIR')) / str(user_id)
        img_dir = user_dir / 'images' / 'inventory'
        if img_dir.exists():
            for file_path in img_dir.glob('*'):
                if file_path.name not in valid_paths:
                    file_path.unlink()
                    removed += 1
        doc_dir = user_dir / 'documents'
        if doc_dir.exists():
            for file_path in doc_dir.glob('*'):
                if file_path.name not in valid_paths:
                    file_path.unlink()
                    removed += 1

        return jsonify({'message': 'Cleanup completed', 'files_removed': removed})
    except Exception as e:
        logger.error(f"Error during file cleanup: {e}")
        return jsonify({'error': str(e)}), 500

@files_bp.route('/delete/<path:filename>', methods=['DELETE'])
async def delete_file(filename):
    """Delete a file using unified storage options."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        file_type = get_file_type(filename)
        if not file_type:
            return jsonify({'error': 'Invalid file type'}), 400

        storage_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
        if storage_backend == 'generic':
            data_dir = os.getenv('DATA_DIR')
            if file_type == 'images':
                file_path = Path(data_dir) / str(user_id) / 'images' / 'inventory' / filename
            else:
                file_path = Path(data_dir) / str(user_id) / 'documents' / filename
            if not file_path.exists():
                return jsonify({'error': 'File not found'}), 404
            # Verify ownership
            async with get_db_pool() as pool:
                async with pool.acquire() as conn:
                    if file_type == 'images':
                        row = await conn.fetchrow(
                            "SELECT 1 FROM user_inventory WHERE user_id = $1 AND image_url LIKE $2",
                            int(user_id), f"%{filename}"
                        )
                    else:
                        row = await conn.fetchrow(
                            "SELECT 1 FROM user_documents WHERE user_id = $1 AND file_path LIKE $2",
                            int(user_id), f"%{filename}"
                        )
                    if not row:
                        return jsonify({'error': 'Unauthorized'}), 403
            file_path.unlink()
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            file_url = f"{user_id}/{filename}"
            try:
                success = await storage_service.delete_document(file_url)
                if not success:
                    return jsonify({'error': 'Failed to delete file'}), 500
            except Exception as e:
                logger.error(f"Error deleting file {filename}: {e}")
                return jsonify({'error': 'Failed to delete file'}), 500
            return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {e}")
        return jsonify({'error': str(e)}), 500