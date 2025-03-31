#!/usr/bin/env python3
"""
Script to set up user storage links in the database.
This ensures each user has a dedicated storage location in either Vercel Blob, S3,
or local storage based on the configured storage backend.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from backend
parent_dir = str(Path(__file__).resolve().parent.parent)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

root_dir = str(Path(__file__).resolve().parent.parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.config.database import get_db_pool
from backend.config.storage import get_storage_config

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get storage configuration
storage_config = get_storage_config()
STORAGE_BACKEND = storage_config.storage_backend

async def ensure_user_storage_exists():
    """
    Ensure all users have storage paths configured in the database.
    """
    try:
        logger.info("Connecting to database...")
        pool = await get_db_pool()
        if not pool:
            logger.error("Failed to connect to database")
            return False

        async with pool.acquire() as conn:
            # Check if user_storage table exists, create if it doesn't
            table_exists = await conn.fetchval("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'user_storage'
                )
            """)
            
            if not table_exists:
                logger.info("Creating user_storage table...")
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS user_storage (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                        storage_type TEXT NOT NULL,
                        storage_path TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(user_id, storage_type)
                    )
                """)
                
                # Create updated_at trigger function if it doesn't exist
                function_exists = await conn.fetchval("""
                    SELECT EXISTS (
                        SELECT FROM pg_proc
                        WHERE proname = 'update_updated_at_column'
                    )
                """)
                
                if not function_exists:
                    logger.info("Creating update_updated_at_column function...")
                    await conn.execute("""
                        CREATE OR REPLACE FUNCTION update_updated_at_column()
                        RETURNS TRIGGER AS $$
                        BEGIN
                            NEW.updated_at = CURRENT_TIMESTAMP;
                            RETURN NEW;
                        END;
                        $$ LANGUAGE plpgsql;
                    """)
                
                # Create trigger
                await conn.execute("""
                    CREATE TRIGGER update_user_storage_updated_at
                    BEFORE UPDATE ON user_storage
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
                """)
                
                # Create indexes
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
                    CREATE INDEX IF NOT EXISTS idx_user_storage_type ON user_storage(storage_type);
                """)
            
            # Get all users without storage configurations for the current backend
            rows = await conn.fetch("""
                SELECT u.id, u.email 
                FROM users u
                LEFT JOIN user_storage us ON u.id = us.user_id AND us.storage_type = $1
                WHERE us.id IS NULL
            """, STORAGE_BACKEND)

            if not rows:
                logger.info(f"All users already have {STORAGE_BACKEND} storage configured")
                return True

            logger.info(f"Found {len(rows)} users without {STORAGE_BACKEND} storage configuration")

            # Add storage configuration for each user
            for user in rows:
                user_id = user['id']
                email = user['email']
                
                # Generate storage path using the storage config
                storage_path = storage_config.get_user_storage_path(user_id)
                
                # Insert storage configuration
                await conn.execute("""
                    INSERT INTO user_storage (user_id, storage_type, storage_path)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, storage_type) DO NOTHING
                """, user_id, STORAGE_BACKEND, storage_path)
                
                logger.info(f"Created {STORAGE_BACKEND} storage path for user {email}: {storage_path}")
            
            logger.info("User storage configuration complete")
            return True
            
    except Exception as e:
        logger.error(f"Error ensuring user storage exists: {e}")
        return False

async def get_user_storage_path(user_id, storage_type=None):
    """
    Get a user's storage path. If storage_type is not specified,
    returns the path for the default storage backend.
    """
    try:
        storage_type = storage_type or STORAGE_BACKEND
        
        pool = await get_db_pool()
        if not pool:
            logger.error("Failed to connect to database")
            return None
            
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT storage_path 
                FROM user_storage 
                WHERE user_id = $1 AND storage_type = $2
            """, user_id, storage_type)
            
            if row:
                return row['storage_path']
            
            # If no storage path found, we'll create one
            logger.info(f"No storage path found for user {user_id} with type {storage_type}, creating now...")
            storage_path = storage_config.get_user_storage_path(user_id)
            
            await conn.execute("""
                INSERT INTO user_storage (user_id, storage_type, storage_path)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, storage_type) DO NOTHING
            """, user_id, storage_type, storage_path)
            
            return storage_path
            
    except Exception as e:
        logger.error(f"Error getting user storage path: {e}")
        return None

async def validate_user_storage():
    """
    Validate that user storage paths are accessible.
    For local storage, this means checking if directories exist.
    For cloud storage, this is a no-op as we rely on API access.
    """
    try:
        pool = await get_db_pool()
        if not pool:
            logger.error("Failed to connect to database")
            return False
            
        if STORAGE_BACKEND == 'local':
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT user_id, storage_path 
                    FROM user_storage 
                    WHERE storage_type = 'local'
                """)
                
                for row in rows:
                    user_id = row['user_id']
                    storage_path = row['storage_path']
                    
                    # Extract the local path part after "local/"
                    if storage_path.startswith('local/'):
                        path_suffix = storage_path.split('local/')[1]
                        user_dir = storage_config.paths['USER_STORAGE_DIR'] / str(user_id) / path_suffix
                        
                        # Ensure directory exists
                        if not user_dir.exists():
                            user_dir.mkdir(parents=True, exist_ok=True)
                            logger.info(f"Created missing local storage directory for user {user_id}: {user_dir}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error validating user storage: {e}")
        return False

async def main():
    """Main function to run the script."""
    logger.info(f"Setting up user storage for backend: {STORAGE_BACKEND}")
    
    # Ensure storage exists for all users
    storage_success = await ensure_user_storage_exists()
    
    # Validate storage paths are accessible
    validation_success = await validate_user_storage()
    
    if storage_success and validation_success:
        logger.info("User storage setup completed successfully")
    else:
        logger.error("User storage setup failed")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
