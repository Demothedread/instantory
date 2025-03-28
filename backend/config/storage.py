"""Storage configuration and path management."""
import os
from pathlib import Path
from typing import Dict, Optional, Tuple
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class StorageType(Enum):
    """Types of storage operations."""
    DOCUMENT = 'document'  # For document files (PDF, DOC, etc.)
    IMAGE = 'image'       # For image files
    THUMBNAIL = 'thumbnail'  # For image thumbnails
    TEMP = 'temp'        # For temporary storage

class StorageConfig:
    """Storage configuration and path management."""
    
    def __init__(self):
        # Base directories
        self.data_dir = Path(os.getenv('DATA_DIR', '/tmp/instantory'))
        
        # Storage paths
        self.paths: Dict[str, Path] = {
            'TEMP_DIR': self.data_dir / 'temp',
            'UPLOADS_DIR': self.data_dir / 'uploads',
            'INVENTORY_IMAGES_DIR': self.data_dir / 'images' / 'inventory',
            'THUMBNAILS_DIR': self.data_dir / 'images' / 'thumbnails',
            'EXPORTS_DIR': self.data_dir / 'exports',
            'DOCUMENT_DIRECTORY': self.data_dir / 'documents'
        }
        
        # Storage configuration
        self.vercel_blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        self.s3_bucket = os.getenv('AWS_S3_EXPRESS_BUCKET')
        self.s3_region = os.getenv('AWS_REGION', 'us-west-2')
        self.s3_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        self.s3_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        
        # Validate configuration
        self._validate_config()
        
        # Initialize directories
        self._initialize_directories()
        
    def _validate_config(self) -> None:
        """Validate storage configuration."""
        if not self.vercel_blob_token:
            raise ValueError("BLOB_READ_WRITE_TOKEN environment variable is required")   
        if not all([self.s3_bucket, self.s3_access_key, self.s3_secret_key]):
            raise ValueError("AWS S3 configuration is incomplete")
        
    def _initialize_directories(self) -> None:
        """Create necessary directories with proper permissions."""
        for directory in self.paths.values():
            try:
                directory.mkdir(parents=True, exist_ok=True, mode=0o755)
                logger.debug(f"Created directory: {directory}")
            except Exception as e:
                logger.error(f"Error creating directory {directory}: {e}")
                raise

    def get_storage_info(self, file_type: str, storage_type: StorageType) -> Tuple[str, Dict[str, str]]:
        """Get storage backend and configuration for a file type."""
        if storage_type == StorageType.TEMP:
            return 'local', {'base_path': str(self.paths['TEMP_DIR'])}
        if storage_type == StorageType.IMAGE:
            return 'vercel', {
                'token': self.vercel_blob_token,
                'content_type': file_type
            }
        if storage_type == StorageType.THUMBNAIL:
            return 'vercel', {
                'token': self.vercel_blob_token,
                'content_type': 'image/jpeg'
            }
                 
        # Default to S3 for documents
        return 's3', {
            'bucket': self.s3_bucket,
            'region': self.s3_region,
            'access_key': self.s3_access_key,
            'secret_key': self.s3_secret_key
        }
    
    def get_temp_dir(self, user_id: int) -> Path:
        """Get a temporary directory for user processing."""
        temp_dir = self.paths['TEMP_DIR'] / str(user_id)
        temp_dir.mkdir(parents=True, exist_ok=True)
        return temp_dir
    
    def get_thumbnail_path(self, user_id: int, filename: str) -> Path:
        """Get the path for an image thumbnail."""
        return self.paths['THUMBNAILS_DIR'] / str(user_id) / filename
    
    def cleanup_temp_files(self, user_id: Optional[int] = None) -> None:
        """Clean up temporary files for a user or all users."""
        try:
            if user_id:
                temp_dir = self.paths['TEMP_DIR'] / str(user_id)
                if temp_dir.exists():
                    for item in temp_dir.iterdir():
                        if item.is_file():
                            item.unlink()
            else:
                for user_dir in self.paths['TEMP_DIR'].iterdir():
                    if user_dir.is_dir():
                        for item in user_dir.iterdir():
                            if item.is_file():
                                item.unlink()
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {e}")

# Global instance
storage_config = StorageConfig()

def get_storage_config() -> StorageConfig:
    """Get the storage configuration instance."""
    return storage_config
