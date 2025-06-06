"""Storage configuration and path management."""

import os
import uuid
from pathlib import Path
from typing import Dict, Optional, Tuple, Any
import logging
from enum import Enum

try:
    from backend.config.storage_settings import (
        DEFAULT_STORAGE_BACKEND, 
        STORAGE_FALLBACK_ORDER,
        STORAGE_CONFIG,
        FILE_TYPE_STORAGE_MAPPING
    )
except ImportError:
    # Default values if settings module is not available
    DEFAULT_STORAGE_BACKEND = "vercel"
    STORAGE_FALLBACK_ORDER = ["vercel", "s3", "local"]
    STORAGE_CONFIG = {}
    FILE_TYPE_STORAGE_MAPPING = {}

logger = logging.getLogger(__name__)


class StorageType(Enum):
    """Types of storage operations."""

    DOCUMENT = "document"  # For document files (PDF, DOC, etc.)
    IMAGE = "image"  # For image files
    THUMBNAIL = "thumbnail"  # For image thumbnails
    TEMP = "temp"  # For temporary storage
    USER = "user"  # For user-specific storage paths


class StorageConfig:
    """Storage configuration and path management."""

    def __init__(self):
        # Base directories - use settings from storage_settings if available
        local_config = STORAGE_CONFIG.get('local', {})
        base_dir_env_var = local_config.get('base_dir_env_var', 'DATA_DIR')
        default_base_dir = local_config.get('default_base_dir', '/tmp/instantory')
        self.data_dir = Path(os.getenv(base_dir_env_var, default_base_dir))

        # Storage paths
        self.paths: Dict[str, Path] = {
            "TEMP_DIR": self.data_dir / "temp",
            "UPLOADS_DIR": self.data_dir / "uploads",
            "INVENTORY_IMAGES_DIR": self.data_dir / "images" / "inventory",
            "THUMBNAILS_DIR": self.data_dir / "images" / "thumbnails",
            "EXPORTS_DIR": self.data_dir / "exports",
            "DOCUMENT_DIRECTORY": self.data_dir / "documents",
            "USER_STORAGE_DIR": self.data_dir / "users",
        }

        # Storage backend configuration - use settings module or environment variable
        self.storage_backend = os.getenv("STORAGE_BACKEND", DEFAULT_STORAGE_BACKEND).lower()
        self.storage_fallbacks = STORAGE_FALLBACK_ORDER

        # Provider-specific configuration from settings module or environment variables
        vercel_config = STORAGE_CONFIG.get('vercel', {})
        vercel_token_env = vercel_config.get('token_env_var', 'BLOB_READ_WRITE_TOKEN')
        self.vercel_blob_token = os.getenv(vercel_token_env)
        
        s3_config = STORAGE_CONFIG.get('s3', {})
        self.s3_bucket = os.getenv(s3_config.get('bucket_env_var', 'AWS_S3_EXPRESS_BUCKET'))
        self.s3_region = os.getenv(s3_config.get('region_env_var', 'AWS_REGION'), "us-west-2")
        self.s3_access_key = os.getenv(s3_config.get('access_key_env_var', 'AWS_ACCESS_KEY_ID'))
        self.s3_secret_key = os.getenv(s3_config.get('secret_key_env_var', 'AWS_SECRET_ACCESS_KEY'))

        # Validate configuration (soft validation)
        self._validate_config()

        # Initialize directories
        self._initialize_directories()

    def _validate_config(self) -> None:
        """Validate storage configuration with warnings instead of errors."""
        if self.storage_backend == "vercel" and not self.vercel_blob_token:
            logger.warning(
                "BLOB_READ_WRITE_TOKEN environment variable is missing but Vercel storage is selected"
            )

        if self.storage_backend == "s3" and not all(
            [self.s3_bucket, self.s3_access_key, self.s3_secret_key]
        ):
            logger.warning(
                "AWS S3 configuration is incomplete but S3 storage is selected"
            )

    def _initialize_directories(self) -> None:
        """Create necessary directories with proper permissions."""
        for directory in self.paths.values():
            try:
                directory.mkdir(parents=True, exist_ok=True, mode=0o755)
                logger.debug(f"Created directory: {directory}")
            except Exception as e:
                logger.error(f"Error creating directory {directory}: {e}")
                # Log but don't raise - allow failover to other storage methods

    def get_storage_info(
        self, file_type: str, storage_type: StorageType
    ) -> Tuple[str, Dict[str, str]]:
        """Get storage backend and configuration for a file type."""
        # Always use local storage for temporary files
        if storage_type == StorageType.TEMP:
            return "local", {"base_path": str(self.paths["TEMP_DIR"])}

        # Default to the configured storage backend - prioritize Vercel
        if self.storage_backend == "vercel" and self.vercel_blob_token:
            # Use Vercel for most storage types including documents
            if storage_type in [StorageType.IMAGE, StorageType.THUMBNAIL, StorageType.DOCUMENT]:
                return "vercel", {
                    "token": self.vercel_blob_token,
                    "content_type": (
                        file_type if storage_type != StorageType.THUMBNAIL else "image/jpeg"
                    ),
                }

        if self.storage_backend == "s3" and all(
            [self.s3_bucket, self.s3_access_key, self.s3_secret_key]
        ):
            if storage_type == StorageType.DOCUMENT:
                return "s3", {
                    "bucket": self.s3_bucket,
                    "region": self.s3_region,
                    "access_key": self.s3_access_key,
                    "secret_key": self.s3_secret_key,
                }

        # Fallback to local storage
        path_key = {
            StorageType.DOCUMENT: "DOCUMENT_DIRECTORY",
            StorageType.IMAGE: "INVENTORY_IMAGES_DIR",
            StorageType.THUMBNAIL: "THUMBNAILS_DIR",
            StorageType.USER: "USER_STORAGE_DIR",
        }.get(storage_type, "UPLOADS_DIR")

        return "local", {"base_path": str(self.paths[path_key])}

    def get_user_storage_path(self, user_id: int) -> str:
        """
        Generate a storage path for a user based on the current storage backend.
        This is used for user-specific storage locations.
        """
        storage_path_base = f"user_{user_id}_{uuid.uuid4().hex[:8]}"

        if self.storage_backend == "vercel":
            return f"vercel/{storage_path_base}"
        elif self.storage_backend == "s3":
            return f"s3/{storage_path_base}"
        else:
            # Create a local directory
            user_dir = self.paths["USER_STORAGE_DIR"] / str(user_id)
            user_dir.mkdir(parents=True, exist_ok=True)
            return f"local/{storage_path_base}"

    def get_temp_dir(self, user_id: Optional[int] = None) -> Path:
        """Get a temporary directory for user processing."""
        if user_id:
            temp_dir = self.paths["TEMP_DIR"] / str(user_id)
        else:
            temp_dir = self.paths["TEMP_DIR"]

        temp_dir.mkdir(parents=True, exist_ok=True)
        return temp_dir

    def get_thumbnail_path(self, user_id: int, filename: str) -> Path:
        """Get the path for an image thumbnail."""
        user_thumb_dir = self.paths["THUMBNAILS_DIR"] / str(user_id)
        user_thumb_dir.mkdir(parents=True, exist_ok=True)
        return user_thumb_dir / filename

    def cleanup_temp_files(self, user_id: Optional[int] = None) -> None:
        """Clean up temporary files for a user or all users."""
        try:
            if user_id:
                temp_dir = self.paths["TEMP_DIR"] / str(user_id)
                if temp_dir.exists():
                    for item in temp_dir.iterdir():
                        if item.is_file():
                            item.unlink()
            else:
                for user_dir in self.paths["TEMP_DIR"].iterdir():
                    if user_dir.is_dir():
                        for item in user_dir.iterdir():
                            if item.is_file():
                                item.unlink()
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {e}")

    async def cleanup(self) -> None:
        """Clean up resources on shutdown."""
        # Currently a no-op, but included for compatibility with the app's lifecycle
        pass


# Global instance
storage_config = StorageConfig()


def get_storage_config() -> StorageConfig:
    """Get the storage configuration instance."""
    return storage_config


# Module-level helper for getting the temp directory
def get_temp_dir() -> Path:
    """
    Return the temporary directory path for file storage (module-level helper).
    """
    config = get_storage_config()
    # Prefer explicit TEMP_DIR override from config.paths
    temp_path = config.paths.get("TEMP_DIR")
    if temp_path:
        return temp_path
    import tempfile
    return Path(tempfile.gettempdir())

def cleanup_temp_files(user_id: Optional[int] = None) -> None:
    """
    Clean up temporary files for a user or all users.
    Module-level helper that delegates to StorageConfig.cleanup_temp_files.
    """
    config = get_storage_config()
    config.cleanup_temp_files(user_id)