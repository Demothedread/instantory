"""Database configuration and connection management."""
import os
import logging
from enum import Enum
from typing import Optional, Dict, Any, Union, TYPE_CHECKING
from urllib.parse import urlparse

import asyncpg

if TYPE_CHECKING:
    from backend.services.vector.qdrant_service import QdrantService

logger = logging.getLogger(__name__)

class DatabaseType(Enum):
    """Database types supported by the application."""
    VECTOR = 'vector'  # For vector operations
    METADATA = 'metadata'  # For metadata

class DatabaseConfig:
    """Database configuration and pool management.
    
    Supports flexible database configuration scenarios:
    1. Single database for both vector and metadata (DATABASE_URL only)
    2. Separate databases (any combination of DATABASE_URL, NEON_DATABASE_URL, 
       VECTOR_DATABASE_URL, METADATA_DATABASE_URL)
    """    
    def __init__(self):
        # Initialize connection pools
        self._pools: Dict[DatabaseType, Optional[asyncpg.Pool]] = {
            DatabaseType.VECTOR: None,
            DatabaseType.METADATA: None
        }
        # Get all possible database URLs
        self.database_urls = {
            'default': os.getenv('DATABASE_URL'),
            'neon': os.getenv('NEON_DATABASE_URL'),
            'vector': os.getenv('VECTOR_DATABASE_URL'),
            'metadata': os.getenv('METADATA_DATABASE_URL')
        }
        
        # Log which URLs are available (without passwords)
        safe_urls = {}
        for key, url in self.database_urls.items():
            if url:
                # Mask password in URL for logging
                try:
                    parsed = urlparse(url)
                    safe_url = f"{parsed.scheme}://{parsed.username}:***@{parsed.hostname}"
                    if parsed.port:
                        safe_url += f":{parsed.port}"
                    if parsed.path:
                        safe_url += parsed.path
                    safe_urls[key] = safe_url
                except:
                    safe_urls[key] = "invalid_url"
            else:
                safe_urls[key] = None
        
        logger.info("Available database URLs: %s", safe_urls)

        # Ensure at least one database URL is provided
        if not any(self.database_urls.values()):
            raise ValueError("At least one database URL environment variable is required")
        
        # Configure vector database
        self.vector_url = (
            self.database_urls['vector'] or 
            self.database_urls['neon'] or 
            self.database_urls['default']
        )
        
        # Configure metadata database
        self.metadata_url = (
            self.database_urls['metadata'] or 
            self.database_urls['default']
        )
        
        logger.info("Using vector database URL: %s", "configured" if self.vector_url else "none")
        logger.info("Using metadata database URL: %s", "configured" if self.metadata_url else "none")
        
        # Parse connection details if URLs are available
        self.vector_config = self._parse_url(self.vector_url) if self.vector_url else None
        self.metadata_config = self._parse_url(self.metadata_url) if self.metadata_url else None

    def _parse_url(self, url: str) -> Dict[str, Any]:
        """Parse database URL into connection parameters."""
        if not url:
            return {}
            
        logger.debug("Parsing database URL: %s", url[:50] + "..." if len(url) > 50 else url)
        
        try:
            parsed = urlparse(url)
            logger.debug("Parsed URL components - scheme: %s, username: %s, hostname: %s, port: %s, path: %s", 
                        parsed.scheme, parsed.username, parsed.hostname, parsed.port, parsed.path)
            
            # Handle different PostgreSQL URL formats
            # Standard format: postgresql://user:password@host:port/database
            # Render format: postgresql://user:password@host/database  
            database = None
            if parsed.path:
                # Remove leading slash
                path_without_slash = parsed.path[1:] if parsed.path.startswith('/') else parsed.path
                # Split by ? to remove query parameters
                database = path_without_slash.split('?')[0]
                # Handle malformed URLs where hostname appears in path
                if '/' in database:
                    # This might be a malformed URL, extract the actual database name
                    parts = database.split('/')
                    # Take the last non-empty part as the database name
                    database = [part for part in parts if part][-1] if parts else None
                    
            logger.debug("Extracted database name: %s", database)
            
            config = {
                'user': parsed.username,
                'password': parsed.password,
                'database': database,
                'host': parsed.hostname,
                'port': parsed.port or 5432  # Default PostgreSQL port
            }
            
            logger.debug("Final config (safe): %s", {k: v for k, v in config.items() if k != 'password'})
            return config
            
        except Exception as e:
            logger.error("Error parsing database URL: %s", e)
            return {}                                          

    async def get_pool(self, db_type: DatabaseType) -> Optional[asyncpg.Pool]:
        """Get or create a database connection pool for the specified type.
        
        Returns None if the configuration for the specified database type is not available.
        """
        # Check if the pool is already created
        if self._pools[db_type] is not None:
            return self._pools[db_type]
            
        # Get the configuration for the specified database type
        config = self.vector_config if db_type == DatabaseType.VECTOR else self.metadata_config
        
        # If no configuration is available, log a warning and return None
        if not config:
            logger.warning("No configuration available for %s database", db_type.value)
            return None
            
        try:
            # Configure SSL based on environment
            env = os.getenv('ENVIRONMENT', 'production').lower()
            ssl = 'require' if env in ['production', 'staging'] else None
            
            # Log connection attempt details (without password)
            safe_config = {k: v for k, v in config.items() if k != 'password'}
            logger.info("Attempting to create %s database pool with config: %s", db_type.value, safe_config)
            
            # Create the connection pool
            self._pools[db_type] = await asyncpg.create_pool(
                user=config['user'],
                password=config['password'],
                database=config['database'],
                host=config['host'],
                port=config['port'],
                ssl=ssl,
                min_size=1,
                max_size=10,
                command_timeout=60,
                server_settings={
                    'application_name': f'bartleby_{db_type.value}'
                }
            )
            logger.info("%s database pool created successfully", db_type.value)
            return self._pools[db_type]
        except asyncpg.exceptions.PostgresError as e:
            logger.error("Postgres error while creating %s database pool: %s", db_type.value, e)
            logger.error("Config used (safe): %s", {k: v for k, v in config.items() if k != 'password'})
            return None
        except Exception as e:
            logger.error("Unexpected error while creating %s database pool: %s", db_type.value, e)
            logger.error("Config used (safe): %s", {k: v for k, v in config.items() if k != 'password'})
            return None

    async def close_pools(self) -> None:
        """Close all database connection pools."""
        for db_type, pool in self._pools.items():
            if pool:
                await pool.close()
                self._pools[db_type] = None
                logger.info("%s database pool closed", db_type.value)
                
    async def cleanup(self) -> None:
        """Cleanup database resources on shutdown."""
        await self.close_pools()

# Global instance
db_config = DatabaseConfig()

async def get_db_pool() -> Optional[asyncpg.Pool]:
    """Get the default (metadata) database connection pool.
    
    Returns None if not available. Check the return value before use.
    """
    pool = await db_config.get_pool(DatabaseType.METADATA)
    if pool is None:
        logger.error("Failed to retrieve metadata database pool. Ensure the configuration is correct.")
        raise RuntimeError("Metadata database pool is not available.")
    return pool

async def get_vector_pool() -> Optional[Union[asyncpg.Pool, 'QdrantService']]:
    """Get the vector database connection.
    
    Returns Qdrant service instance for vector operations.
    Falls back to PostgreSQL pool if Qdrant is unavailable.
    """
    try:
        # Try to import and use Qdrant service
        from backend.services.vector.qdrant_service import qdrant_service
        
        # Test Qdrant connection
        health = await qdrant_service.health_check()
        if health.get("status") == "healthy":
            logger.debug("Using Qdrant for vector operations")
            return qdrant_service
        else:
            logger.warning("Qdrant unhealthy, falling back to PostgreSQL: %s", health.get("error"))
            
    except Exception as e:
        logger.warning("Qdrant service unavailable, falling back to PostgreSQL: %s", e)
    
    # Fallback to PostgreSQL vector pool
    pool = await db_config.get_pool(DatabaseType.VECTOR)
    if pool is None:
        # Try to use metadata pool as fallback for vector operations
        logger.warning("Vector database unavailable, attempting to use metadata database as fallback")
        return await db_config.get_pool(DatabaseType.METADATA)
    return pool

async def get_metadata_pool() -> Optional[asyncpg.Pool]:
    """Get the metadata database connection pool.
    
    Returns None if not available. Check the return value before use.
    """
    return await db_config.get_pool(DatabaseType.METADATA)

def is_qdrant_service(vector_client) -> bool:
    """Check if the vector client is a Qdrant service instance."""
    try:
        from backend.services.vector.qdrant_service import QdrantService
        return isinstance(vector_client, QdrantService)
    except ImportError:
        return False
