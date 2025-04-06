"""Database configuration and connection management."""
import os
from typing import Optional, Dict, Any
import asyncpg
import logging
from urllib.parse import urlparse
from enum import Enum

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
        
        # Parse connection details if URLs are available
        self.vector_config = self._parse_url(self.vector_url) if self.vector_url else None
        self.metadata_config = self._parse_url(self.metadata_url) if self.metadata_url else None

    def _parse_url(self, url: str) -> Dict[str, Any]:
        """Parse database URL into connection parameters."""
        if not url:
            return {}
            
        parsed = urlparse(url)
        return {
            'user': parsed.username,
            'password': parsed.password,
            'database': parsed.path[1:] if parsed.path else None,
            'host': parsed.hostname,
            'port': parsed.port
        }                                          

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
                command_timeout=60
            )
            logger.info(f"{db_type.value} database pool created successfully")
            return self._pools[db_type]
        except Exception as e:
            logger.error(f"Failed to create {db_type.value} database pool: {e}")
            return None

    async def close_pools(self) -> None:
        """Close all database connection pools."""
        for db_type, pool in self._pools.items():
            if pool:
                await pool.close()
                self._pools[db_type] = None
                logger.info(f"{db_type.value} database pool closed")
                
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

async def get_vector_pool() -> Optional[asyncpg.Pool]:
    """Get the vector database connection pool.
    
    Returns None if not available. Check the return value before use.
    Falls back to the metadata pool if vector-specific pool is unavailable.
    """
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
