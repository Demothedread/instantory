"""Storage configuration and provider management."""
import os
from enum import Enum
from typing import Optional

class StorageProvider(Enum):
    """Available storage providers."""
    VERCEL = 'vercel'
    S3 = 's3'
    LOCAL = 'local'

class StorageType(Enum):
    """Types of storage needs."""
    TEMP = 'temp'
    PERMANENT = 'permanent'
    VECTOR = 'vector'

class StorageConfig:
    """Configuration for file storage."""
    
    def __init__(self):
        # Base paths
        self.temp_dir = os.path.join(os.getenv('DATA_DIR', '/data'), 'temp')
        self.permanent_dir = os.path.join(os.getenv('DATA_DIR', '/data'), 'permanent')
        
        # Document storage
        self.documents_dir = os.path.join(self.permanent_dir, 'documents')
        self.vector_store_dir = os.path.join(self.permanent_dir, 'vectors')
        
        # Image storage
        self.images_dir = os.path.join(self.permanent_dir, 'images')
        self.inventory_images_dir = os.path.join(self.images_dir, 'inventory')
        
        # Provider configuration
        self.default_provider = StorageProvider(os.getenv('DEFAULT_STORAGE_PROVIDER', 'vercel'))
        self.document_provider = StorageProvider(os.getenv('DOCUMENT_STORAGE_PROVIDER', 's3'))
        self.image_provider = StorageProvider(os.getenv('IMAGE_STORAGE_PROVIDER', 'vercel'))
        
        # Provider-specific settings
        self.s3_bucket = os.getenv('AWS_S3_EXPRESS_BUCKET')
        self.vercel_blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        
        # Create required directories for local storage
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create required directories if they don't exist."""
        directories = [
            self.temp_dir,
            self.permanent_dir,
            self.documents_dir,
            self.vector_store_dir,
            self.images_dir,
            self.inventory_images_dir
        ]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def get_provider(self, storage_type: StorageType, file_type: str) -> StorageProvider:
        """Get the appropriate storage provider based on type and context."""
        if storage_type == StorageType.TEMP:
            return StorageProvider.LOCAL
            
        if file_type.startswith('image/'):
            return self.image_provider
            
        if file_type in ['application/pdf', 'text/plain', 'application/msword']:
            return self.document_provider
            
        return self.default_provider
    
    def get_path(self, user_id: int, filename: str, storage_type: StorageType) -> str:
        """Get the appropriate storage path for a file."""
        if storage_type == StorageType.TEMP:
            return os.path.join(self.temp_dir, str(user_id), filename)
            
        # For permanent storage, organize by file type
        ext = filename.split('.')[-1].lower()
        if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            return os.path.join(self.inventory_images_dir, str(user_id), filename)
            
        if ext in ['pdf', 'doc', 'docx', 'txt']:
            return os.path.join(self.documents_dir, str(user_id), filename)
            
        return os.path.join(self.permanent_dir, str(user_id), filename)
    
    def get_vector_store_path(self, user_id: int) -> str:
        """Get the path for vector store data."""
        return os.path.join(self.vector_store_dir, str(user_id))
    
    def cleanup_temp_files(self, user_id: Optional[int] = None):
        """Clean up temporary files for a user or all users."""
        if user_id:
            user_temp_dir = os.path.join(self.temp_dir, str(user_id))
            if os.path.exists(user_temp_dir):
                for file in os.listdir(user_temp_dir):
                    os.remove(os.path.join(user_temp_dir, file))
        else:
            for user_dir in os.listdir(self.temp_dir):
                user_temp_dir = os.path.join(self.temp_dir, user_dir)
                if os.path.isdir(user_temp_dir):
                    for file in os.listdir(user_temp_dir):
                        os.remove(os.path.join(user_temp_dir, file))

# Global instance
storage_config = StorageConfig()
