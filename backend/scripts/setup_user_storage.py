#!/usr/bin/env python3
"""
Script to set up user storage links in the database.
This ensures each user has a dedicated storage location in either Vercel Blob or S3.
"""

import os
import sys
import asyncio
import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from backend
parent_dir = str(Path(__file__).resolve().parent.parent)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from config.database import get_db_pool

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Determine which storage backend to use
STORAGE_BACKEND = os.getenv('STORAGE_BACKEND', 'generic').lower()
if STORAGE_BACKEND not in ['vercel', 's3', 'generic']:
    logger.warning(f"Unknown storage backend: {STORAGE_BACKEND}. Defaulting to 'generic'")
    STORAGE_BACKEND = 'generic'

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
                
                # Generate a unique storage path based on user ID and a UUID
                # This ensures each user has a dedicated storage location
                storage_path_base = f"user_{user_id}_{uuid.uuid4().hex[:8]}"
                
                if STORAGE_BACKEND == 'vercel':
                    storage_path = f"vercel/{storage_path_base}"
                elif STORAGE_BACKEND == 's3':
                    storage_path = f"s3/{storage_path_base}"
                else:
                    storage_path = f"local/{storage_path_base}"
                
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
            
            logger.warning(f"No storage path found for user {user_id} with type {storage_type}")
            return None
            
    except Exception as e:
        logger.error(f"Error getting user storage path: {e}")
        return None

async def main():
    """Main function to run the script."""
    logger.info(f"Setting up user storage for backend: {STORAGE_BACKEND}")
    success = await ensure_user_storage_exists()
    
    if success:
        logger.info("User storage setup completed successfully")
    else:
        logger.error("User storage setup failed")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
