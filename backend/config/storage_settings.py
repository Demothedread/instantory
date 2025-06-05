"""
Storage configuration settings for the Instantory application.
This file contains default configuration values that can be overridden with environment variables.
"""

# Default storage backend is now Vercel Blob
DEFAULT_STORAGE_BACKEND = "vercel"

# Default fallback order for storage backends
# If the primary storage backend fails, the system will try these in order
STORAGE_FALLBACK_ORDER = ["vercel", "s3", "local"]

# Storage configurations
STORAGE_CONFIG = {
    "vercel": {
        # Environment variable name for the Vercel Blob token
        "token_env_var": "BLOB_READ_WRITE_TOKEN",
        # URL pattern for files stored in Vercel Blob
        "url_pattern": "https://{blob_path}",
        # Vercel API endpoint
        "api_endpoint": "https://api.vercel.com/v9/blob"
    },
    "s3": {
        # Environment variables for S3 configuration
        "bucket_env_var": "AWS_S3_EXPRESS_BUCKET",
        "region_env_var": "AWS_REGION",
        "access_key_env_var": "AWS_ACCESS_KEY_ID", 
        "secret_key_env_var": "AWS_SECRET_ACCESS_KEY",
        # URL pattern for files stored in S3
        "url_pattern": "s3://{bucket_name}/{object_key}"
    },
    "local": {
        # Base directory for local file storage
        "base_dir_env_var": "DATA_DIR",
        # Default base directory for local storage if not specified
        "default_base_dir": "/tmp/instantory",
        # URL pattern for files stored locally
        "url_pattern": "file://{file_path}"
    }
}

# File type mappings to determine which storage backend to use for which file types
FILE_TYPE_STORAGE_MAPPING = {
    "image/jpeg": "vercel",
    "image/png": "vercel",
    "image/gif": "vercel",
    "image/webp": "vercel",
    "application/pdf": "vercel",
    "application/msword": "vercel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "vercel",
    "text/plain": "vercel",
    "application/rtf": "vercel",
    # Default for any other file types
    "default": "vercel"
}

# Storage retry configuration
STORAGE_RETRY_CONFIG = {
    "max_retries": 3,
    "retry_delay": 1.0,  # seconds
    "backoff_factor": 2.0  # exponential backoff
}

# Cache configuration for retrieved files
FILE_CACHE_CONFIG = {
    "enabled": True,
    "max_size": 100 * 1024 * 1024,  # 100 MB cache size
    "ttl": 3600  # Cache time-to-live in seconds (1 hour)
}
