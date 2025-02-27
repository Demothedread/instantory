"""Database configuration and connection management."""
import os
from typing import Optional, Dict
import asyncpg
import logging
from urllib.parse import urlparse
from enum import Enum

logger = logging.getLogger(__name__)

class DatabaseType(Enum):
    """Database types supported by the application."""
    VECTOR = 'vector'  # Neon PostgreSQL for vector operations
    METADATA = 'metadata'  # Render PostgreSQL for metadata

class DatabaseConfig:
    """Database configuration and pool management."""
    
    def __init__(self):
        # Initialize connection pools
        self._pools: Dict[DatabaseType, Optional[asyncpg.Pool]] = {
            DatabaseType.VECTOR: None,
            DatabaseType.METADATA: None
        }
        
        # Configure vector database (Neon)
        self.vector_url = os.getenv('NEON_DATABASE_URL')
        if not self.vector_url:
            raise ValueError("NEON_DATABASE_URL environment variable is required")
        
        # Configure metadata database (Render)
        self.metadata_url = os.getenv('DATABASE_URL')
        if not self.metadata_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        # Parse connection details
        self.vector_config = self._parse_url(self.vector_url)
        self.metadata_config = self._parse_url(self.metadata_url)

    def _parse_url(self, url: str) -> dict:
        """Parse database URL into connection parameters."""
        parsed = urlparse(url)
        return {
            'user': parsed.username,
            'password': parsed.password,
            'database': parsed.path[1:],
            'host': parsed.hostname,
            'port': parsed.port
        }

    async def get_pool(self, db_type: DatabaseType) -> asyncpg.Pool:
        """Get or create a database connection pool for the specified type."""
        if self._pools[db_type] is None:
            try:
                # Configure SSL based on environment
                ssl = 'require' if not os.getenv('TESTING') else None
                
                # Select configuration based on database type
                config = (
                    self.vector_config if db_type == DatabaseType.VECTOR 
                    else self.metadata_config
                )
                
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
            except Exception as e:
                logger.error(f"Failed to create {db_type.value} database pool: {e}")
                raise

        return self._pools[db_type]

    async def close_pools(self) -> None:
        """Close all database connection pools."""
        for db_type, pool in self._pools.items():
            if pool:
                await pool.close()
                self._pools[db_type] = None
                logger.info(f"{db_type.value} database pool closed")

# Global instance
db_config = DatabaseConfig()

async def get_db_pool() -> asyncpg.Pool:
    """Get the default (metadata) database connection pool."""
    return await db_config.get_pool(DatabaseType.METADATA)

async def get_vector_pool() -> asyncpg.Pool:
    """Get the vector database connection pool."""
    return await db_config.get_pool(DatabaseType.VECTOR)

async def get_metadata_pool() -> asyncpg.Pool:
    """Get the metadata database connection pool."""
    return await db_config.get_pool(DatabaseType.METADATA)
