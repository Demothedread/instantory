"""Unified storage manager for handling file operations across different providers."""
import os
import logging
from typing import Optional, Union, BinaryIO
from pathlib import Path

from .s3 import s3_service
from .vercel_blob import vercel_blob_service
from ..config.storage import storage_config

logger = logging.getLogger(__name__)

class StorageManager:
    """
    Unified storage manager that handles file operations across different storage providers.
    Supports local storage, S3, and Vercel Blob with automatic provider selection.
    """
    
    def __init__(self):
        self.config = storage_config
        self.s3 = s3_service
        self.vercel = vercel_blob_service
        
    async def store_file(
        self,
        user_id: int,
        file_data: Union[bytes, BinaryIO],
        filename: str,
        content_type: str,
        is_temporary: bool = False
    ) -> str:
        """
        Store a file using the appropriate storage provider.
        
        Args:
            user_id: The ID of the user who owns the file
            file_data: The file content as bytes or file-like object
            filename: Original filename
            content_type: MIME type of the file
            is_temporary: Whether this is a temporary storage
            
        Returns:
            URL or path where the file is stored
        """
        try:
            if is_temporary:
                # Store in temp directory
                temp_path = self.config.get_temp_dir() / str(user_id) / filename
                temp_path.parent.mkdir(parents=True, exist_ok=True)
                
                if isinstance(file_data, bytes):
                    temp_path.write_bytes(file_data)
                else:
                    with open(temp_path, 'wb') as f:
                        f.write(file_data.read())
                
                return str(temp_path)
            
            # Determine storage provider based on content type
            if content_type.startswith('image/'):
                # Store images in Vercel Blob
                return await self.vercel.upload_document(
                    file_data if isinstance(file_data, bytes) else file_data.read(),
                    filename,
                    content_type
                )
            elif content_type in ['application/pdf', 'text/plain', 'application/msword']:
                # Store documents in S3
                return await self.s3.upload_document(
                    user_id,
                    file_data if isinstance(file_data, bytes) else file_data.read(),
                    filename
                )
            else:
                # Default to S3 for unknown types
                return await self.s3.upload_document(
                    user_id,
                    file_data if isinstance(file_data, bytes) else file_data.read(),
                    filename
                )
                
        except Exception as e:
            logger.error(f"Error storing file {filename}: {e}")
            raise
    
    async def get_file(self, file_url: str) -> Optional[bytes]:
        """
        Retrieve a file from any storage provider.
        
        Args:
            file_url: The URL or path of the file
            
        Returns:
            File content as bytes if found, None otherwise
        """
        try:
            if file_url.startswith('s3://'):
                return await self.s3.get_document(file_url)
            elif file_url.startswith('https://'):
                return await self.vercel.get_document(file_url)
            elif os.path.exists(file_url):
                return Path(file_url).read_bytes()
            else:
                logger.error(f"Unknown storage location: {file_url}")
                return None
        except Exception as e:
            logger.error(f"Error retrieving file {file_url}: {e}")
            return None
    
    async def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from any storage provider.
        
        Args:
            file_url: The URL or path of the file
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if file_url.startswith('s3://'):
                return await self.s3.delete_document(file_url)
            elif file_url.startswith('https://'):
                return await self.vercel.delete_document(file_url)
            elif os.path.exists(file_url):
                Path(file_url).unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_url}: {e}")
            return False
    
    async def move_to_permanent(
        self,
        temp_path: Union[str, Path],
        user_id: int,
        filename: str,
        content_type: str
    ) -> Optional[str]:
        """
        Move a file from temporary to permanent storage.
        
        Args:
            temp_path: Path to the temporary file
            user_id: The ID of the user who owns the file
            filename: Original filename
            content_type: MIME type of the file
            
        Returns:
            New URL or path in permanent storage if successful, None otherwise
        """
        try:
            temp_path = Path(temp_path)
            if not temp_path.exists():
                logger.error(f"Temporary file not found: {temp_path}")
                return None
            
            # Read the temporary file
            file_data = temp_path.read_bytes()
            
            # Store in permanent location
            permanent_url = await self.store_file(
                user_id,
                file_data,
                filename,
                content_type,
                is_temporary=False
            )
            
            # Clean up temporary file
            temp_path.unlink()
            
            return permanent_url
        except Exception as e:
            logger.error(f"Error moving file to permanent storage: {e}")
            return None
    
    def cleanup_temp_files(self, user_id: Optional[int] = None):
        """
        Clean up temporary files for a user or all users.
        
        Args:
            user_id: Optional user ID to clean up specific user's files
        """
        try:
            self.config.cleanup_temp_files(user_id)
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {e}")

# Global instance
storage_manager = StorageManager()
