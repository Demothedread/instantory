"""Core settings and configuration management."""
import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class Paths:
    """Application path configuration."""
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / 'data'
    UPLOADS_DIR: Path = DATA_DIR / 'uploads'
    INVENTORY_IMAGES_DIR: Path = DATA_DIR / 'images' / 'inventory'
    TEMP_DIR: Path = DATA_DIR / 'temp'
    EXPORTS_DIR: Path = DATA_DIR / 'exports'
    DOCUMENT_DIR: Path = DATA_DIR / 'documents'
    LOGS_DIR: Path = DATA_DIR / 'logs'

class Settings:
    """Core application settings."""
    
    def __init__(self):
        self.paths = Paths()
        self._initialize_directories()
        self._load_environment()
        
    def _initialize_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        for path in [
            self.paths.DATA_DIR,
            self.paths.UPLOADS_DIR,
            self.paths.INVENTORY_IMAGES_DIR,
            self.paths.TEMP_DIR,
            self.paths.EXPORTS_DIR,
            self.paths.DOCUMENT_DIR,
            self.paths.LOGS_DIR
        ]:
            path.mkdir(parents=True, exist_ok=True)
    
    def _load_environment(self) -> None:
        """Load and validate environment variables."""
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.testing = os.getenv('TESTING', '').lower() == 'true'
        self.debug = os.getenv('DEBUG', 'false').lower() == 'true'
        
        # Server settings
        self.port = int(os.getenv('PORT', '5000'))
        self.workers = int(os.getenv('WORKERS', '4'))
        
        # Security settings
        self.cors_enabled = os.getenv('CORS_ENABLED', 'true').lower() == 'true'
        self.allow_credentials = os.getenv('ALLOW_CREDENTIALS', 'true').lower() == 'true'
        self.cors_origins = os.getenv('CORS_ORIGIN', 'http://localhost:3000').split(',')
        
        # Storage settings
        self.storage_backend = os.getenv('STORAGE_BACKEND', 'vercel')
        self.document_storage = os.getenv('DOCUMENT_STORAGE_PROVIDER', 's3')
        self.image_storage = os.getenv('IMAGE_STORAGE_PROVIDER', 'vercel')
        
        # Performance settings
        self.cache_ttl = int(os.getenv('CACHE_TTL', '300'))
        self.max_cache_size = int(os.getenv('MAX_CACHE_SIZE', '100'))
        self.compression_enabled = os.getenv('COMPRESSION_ENABLED', 'true').lower() == 'true'
        self.compression_level = int(os.getenv('COMPRESSION_LEVEL', '6'))
    
    def get_path(self, name: str) -> Optional[Path]:
        """Get a path by name."""
        return getattr(self.paths, f"{name.upper()}_DIR", None)
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == 'production'
    
    def get_database_config(self) -> Dict[str, Any]:
        """Get database configuration."""
        return {
            'metadata_url': os.getenv('DATABASE_URL'),
            'vector_url': os.getenv('NEON_DATABASE_URL'),
            'min_connections': 1,
            'max_connections': 10,
            'command_timeout': 60,
            'ssl': None if self.testing else 'require'
        }
    
    def get_storage_config(self) -> Dict[str, Any]:
        """Get storage configuration."""
        return {
            'backend': self.storage_backend,
            'document_provider': self.document_storage,
            'image_provider': self.image_storage,
            'vercel_token': os.getenv('BLOB_READ_WRITE_TOKEN'),
            's3_bucket': os.getenv('AWS_S3_EXPRESS_BUCKET'),
            's3_region': os.getenv('AWS_REGION', 'us-west-2'),
            's3_access_key': os.getenv('AWS_ACCESS_KEY_ID'),
            's3_secret_key': os.getenv('AWS_SECRET_ACCESS_KEY')
        }

    def get_api_key(self, service: str) -> str:
        """Get API key for a service."""
        key_mapping = {
            'openai': 'OPENAI_API_KEY',
            'google': 'GOOGLE_API_KEY',
            'vercel': 'BLOB_READ_WRITE_TOKEN'
        }
        env_var = key_mapping.get(service.lower())
        if not env_var:
            raise ValueError(f"Unknown service: {service}")
        
        key = os.getenv(env_var)
        if not key:
            raise ValueError(f"API key not found for service: {service}")
        
        return key

    def get_max_content_length(self) -> int:
        """Get maximum content length in bytes."""
        return int((os.getenv('MAX_CONTENT_LENGTH'), 16 * 1024 * 1024))

    def validate_required_vars(self) -> None:
        """Validate required environment variables."""
        required_vars = {
            'DATABASE_URL': 'Render database connection string is required',
            'NEON_DATABASE_URL': 'Neon database connection string is required',
            'OPENAI_API_KEY': 'OpenAI API key is required',
            'BLOB_READ_WRITE_TOKEN': 'Vercel Blob token is required',
            'AWS_S3_EXPRESS_BUCKET': 'S3 bucket name is required',
            'AWS_ACCESS_KEY_ID': 'AWS access key is required',
            'AWS_SECRET_ACCESS_KEY': 'AWS secret key is required'
        }
        
        for var, message in required_vars.items():
            if not os.getenv(var):
                if self.testing:
                    os.environ[var] = f'test-{var.lower()}'
                    logger.warning(f"{var} not set - using test value")
                else:
                    raise ValueError(f"Environment variable {var} is not set. {message}")

    def get_env(self, key: str, default: str = None) -> str:
        """Get environment variable with testing fallback."""
        value = os.getenv(key, default)
        if value is None and self.testing:
            value = f'test-{key.lower()}'
            os.environ[key] = value
            logger.warning(f"{key} not set - using test value: {value}")
        return value

    def get_cors_config(self) -> Dict[str, Any]:
        """Get CORS configuration."""
        return {
            'allow_origin': self.cors_origins,
            'allow_credentials': self.allow_credentials,
            'allow_methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            'allow_headers': [
                'Content-Type',
                'Authorization',
                'Accept',
                'Origin',
                'X-Requested-With',
                'google-oauth-token'
            ]
        }