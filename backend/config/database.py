"""Database configuration and connection management."""
import os
from typing import Optional
import asyncpg
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration and pool management."""
    
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        # Parse connection details
        url = urlparse(self.database_url)
        self.user = url.username
        self.password = url.password
        self.database = url.path[1:]
        self.host = url.hostname
        self.port = url.port
        
        self._pool: Optional[asyncpg.Pool] = None

    async def get_pool(self) -> asyncpg.Pool:
        """Get or create the database connection pool."""
        if self._pool is None:
            try:
                # Configure SSL based on environment
                ssl = 'require' if not os.getenv('TESTING') else None
                
                self._pool = await asyncpg.create_pool(
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    host=self.host,
                    port=self.port,
                    ssl=ssl,
                    min_size=1,
                    max_size=10,
                    command_timeout=60
                )
                logger.info("Database connection pool created successfully")
            except Exception as e:
                logger.error(f"Failed to create database pool: {e}")
                raise

        return self._pool

    async def close_pool(self) -> None:
        """Close the database connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("Database connection pool closed")

# Global instance
db_config = DatabaseConfig()

async def get_db_pool() -> asyncpg.Pool:
    """Get the database connection pool."""
    return await db_config.get_pool()
