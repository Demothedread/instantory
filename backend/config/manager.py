""" Centralized configuration management for the Instantory backend. 
Eliminates redundant environment variable reads and provides caching. """

import os 
import logging
from typing import Dict, Any, Optional, Union, List
from functools import lru_cache

logger = logging.getLogger(__name__)

class ConfigManager:
    """Centralized configuration manager with caching and validation."""

    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._load_env_file()
        
    def _load_env_file(self):
        """Load environment variables from .env file if available."""
        try:
            from dotenv import load_dotenv
            load_dotenv()
            logger.info("Environment variables loaded from .env file")
        except ImportError:
            logger.warning("python-dotenv not available, using system environment variables only")

    @lru_cache(maxsize=128)
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value with caching."""
        return os.getenv(key, default)

    def get_int(self, key: str, default: int = 0) -> int:
        """Get integer configuration value."""
        try:
            return int(self.get(key, default))
        except (ValueError, TypeError):
            return default

    def get_bool(self, key: str, default: bool = False) -> bool:
        """Get boolean configuration value."""
        value = self.get(key, str(default)).lower()
        return value in ('true', '1', 'yes', 'on')

    def get_list(self, key: str, default: List[str] = None, separator: str = ',') -> List[str]:
        """Get list configuration value."""
        if default is None:
            default = []
        value = self.get(key)
        if not value:
            return default
        return [item.strip() for item in value.split(separator) if item.strip()]

    def is_debug(self) -> bool:
        """Check if debug mode is enabled."""
        return self.get_bool('DEBUG', False)

    def is_production(self) -> bool:
        """Check if running in production."""
        return self.get('ENVIRONMENT', 'development').lower() == 'production'

    def is_testing(self) -> bool:
        """Check if running in test mode."""
        return self.get_bool('TESTING', False)

    @lru_cache(maxsize=1)
    def get_database_config(self) -> Dict[str, Optional[Union[str, int]]]:
        """Get database configuration."""
        return {
            'metadata_url': self.get('DATABASE_URL'),
            'vector_url': self.get('NEON_DATABASE_URL') or self.get('VECTOR_DATABASE_URL'),
            'min_connections': self.get_int('DB_MIN_CONNECTIONS', 1),
            'max_connections': self.get_int('DB_MAX_CONNECTIONS', 10),
            'connection_timeout': self.get_int('DB_CONNECTION_TIMEOUT', 30)
        }

    @lru_cache(maxsize=1)
    def get_storage_config(self) -> Dict[str, Any]:
        """Get storage configuration."""
        return {
            'backend': self.get('STORAGE_BACKEND', 'vercel').lower(),
            'vercel_token': self.get('BLOB_READ_WRITE_TOKEN'),
            'aws_access_key': self.get('AWS_ACCESS_KEY_ID'),
            'aws_secret_key': self.get('AWS_SECRET_ACCESS_KEY'),
            'aws_bucket': self.get('AWS_S3_EXPRESS_BUCKET'),
            'aws_region': self.get('AWS_REGION', 'us-west-2'),
            'max_file_size': self.get_int('MAX_FILE_SIZE', 50 * 1024 * 1024)
        }

    @lru_cache(maxsize=1)
    def get_api_config(self) -> Dict[str, Any]:
        """Get API configuration."""
        return {
            'cors_enabled': self.get_bool('CORS_ENABLED', True),
            'cors_origins': self.get_list('CORS_ORIGINS', ['http://localhost:3000']),
            'allow_credentials': self.get_bool('ALLOW_CREDENTIALS', True),
            'rate_limit': self.get_int('RATE_LIMIT', 100),
            'rate_window': self.get_int('RATE_WINDOW', 60)
        }

    @lru_cache(maxsize=1)
    def get_auth_config(self) -> Dict[str, Optional[str]]:
        """Get authentication configuration."""
        return {
            'jwt_secret': self.get('JWT_SECRET', 'dev-secret-key'),
            'session_secret': self.get('SESSION_SECRET'),
            'google_client_id': self.get('GOOGLE_CLIENT_ID'),
            'google_client_secret': self.get('GOOGLE_CLIENT_SECRET'),
            'admin_override_password': self.get('ADMIN_PASSWORD_OVERRIDE')
        }

    @lru_cache(maxsize=1)
    def get_openai_config(self) -> Dict[str, Optional[str]]:
        """Get OpenAI configuration."""
        return {
            'api_key': self.get('OPENAI_API_KEY'),
            'model': self.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
            'embedding_model': self.get('OPENAI_EMBEDDING_MODEL', 'text-embedding-ada-002')
        }

    @lru_cache(maxsize=1)
    def get_qdrant_config(self) -> Dict[str, Union[str, int]]:
        """Get Qdrant vector database configuration."""
        return {
            'url': self.get('QDRANT_URL'),
            'api_key': self.get('QDRANT_API_KEY'),
            'collection_name': self.get('QDRANT_COLLECTION_NAME', 'documents'),
            'vector_size': self.get_int('QDRANT_VECTOR_SIZE', 1536)
        }

    def validate_required_config(self) -> Dict[str, bool]:
        """Validate that required configuration is present."""
        required_configs = {
            'jwt_secret': bool(self.get('JWT_SECRET')),
            'database_url': bool(self.get('DATABASE_URL')),
            'storage_backend': bool(self.get('STORAGE_BACKEND')),
        }
        
        # Check storage-specific requirements
        storage_backend = self.get('STORAGE_BACKEND', 'vercel').lower()
        if storage_backend == 'vercel':
            required_configs['vercel_token'] = bool(self.get('BLOB_READ_WRITE_TOKEN'))
        elif storage_backend == 's3':
            required_configs['aws_credentials'] = bool(
                self.get('AWS_ACCESS_KEY_ID') and 
                self.get('AWS_SECRET_ACCESS_KEY') and 
                self.get('AWS_S3_EXPRESS_BUCKET')
            )
        
        return required_configs

    def get_server_config(self) -> Dict[str, Any]:
        """Get server configuration."""
        return {
            'host': self.get('HOST', '0.0.0.0'),
            'port': self.get_int('PORT', 5000),
            'debug': self.is_debug(),
            'log_level': self.get('LOG_LEVEL', 'INFO').upper(),
            'max_content_length': self.get_int('MAX_CONTENT_LENGTH', 100 * 1024 * 1024)
        }

    def get_directory_config(self) -> Dict[str, str]:
        """Get directory paths configuration."""
        return {
            'data_dir': self.get('DATA_DIR', './data'),
            'uploads_dir': self.get('UPLOADS_DIR', './data/uploads'),
            'inventory_images_dir': self.get('INVENTORY_IMAGES_DIR', './data/images/inventory'),
            'exports_dir': self.get('EXPORTS_DIR', './data/exports'),
            'documents_dir': self.get('DOCUMENT_DIRECTORY', './data/documents'),
            'log_file': self.get('LOG_FILE', './logs/instantory.log')
        }

# Global configuration manager instance
config_manager = ConfigManager()
