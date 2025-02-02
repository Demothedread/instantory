# db.py
import os
import urllib.parse as urlparse
import logging
import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from asyncpg import create_pool

logger = logging.getLogger(__name__)

load_dotenv()

@asynccontextmanager
async def get_db_pool():
    """Create and manage PostgreSQL connection pool."""
    pool = None
    retries = 3
    retry_delay = 1  # seconds
    last_error = None

    for attempt in range(retries):
        try:
            database_url = os.getenv('DATABASE_URL')
            if not database_url:
                logger.critical("DATABASE_URL environment variable is not set. Terminating application.")
                raise ValueError("DATABASE_URL environment variable is required")
            
            url = urlparse.urlparse(database_url)
            pool = await create_pool(
                dsn=database_url,
                ssl='require',
                min_size=2,
                max_size=20,
                command_timeout=60,
                max_inactive_connection_lifetime=300,
                setup=lambda conn: conn.execute('SET statement_timeout = 30000;')  # 30 second query timeout
            )
            logger.info("Successfully established database connection pool")
            break
        except Exception as e:
            last_error = e
            if attempt < retries - 1:
                logger.warning("Database connection attempt %d failed: %s", attempt + 1, e)
                await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
            else:
                logger.critical("Failed to establish database connection after %d attempts", retries)
                raise ValueError(f"Could not establish database connection: {str(last_error)}") from last_error
        
    try:
        yield pool
    finally:
        if pool:
            await pool.close()
            logger.info("Database connection pool closed")