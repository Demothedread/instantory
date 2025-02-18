import os
import asyncpg
import logging
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
from pathlib import Path
import urllib.parse as urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection pools
render_pool = None
neon_pool = None

async def init_db_pools():
    """Initialize database connection pools for both Render and Neon."""
    global render_pool, neon_pool
    
    # Initialize Render DB pool
    render_url = os.getenv('DATABASE_URL')
    if not render_url:
        raise ValueError("DATABASE_URL environment variable is required")
    
    render_pool = await create_pool(render_url)
    
    # Initialize Neon DB pool
    neon_url = os.getenv('NEON_DATABASE_URL')
    if neon_url:
        neon_pool = await create_pool(neon_url)
    else:
        logger.warning("NEON_DATABASE_URL not set. Running without Neon database.")

async def create_pool(database_url: str) -> asyncpg.Pool:
    """Create a connection pool with the given database URL."""
    url = urlparse.urlparse(database_url)
    return await asyncpg.create_pool(
        user=url.username,
        password=url.password,
        database=url.path[1:],
        host=url.hostname,
        port=url.port,
        ssl='require',
        min_size=2,
        max_size=10,
        command_timeout=60
    )

@asynccontextmanager
async def get_db_pool():
    """Get the primary database pool (Render)."""
    global render_pool
    try:
        if not render_pool:
            await init_db_pools()
        yield render_pool
    except Exception as e:
        logger.error(f"Database pool error: {e}")
        raise

@asynccontextmanager
async def get_neon_pool():
    """Get the Neon database pool if available."""
    if not neon_pool:
        if not os.getenv('NEON_DATABASE_URL'):
            raise ValueError("Neon database not configured")
        await init_db_pools()
    yield neon_pool

def get_user_data_path(user_id: int) -> Dict[str, Path]:
    """Get user-specific data directory paths."""
    base_path = Path(os.getenv('DATA_DIR', os.path.join(os.path.dirname(__file__), 'data')))
    user_path = base_path / str(user_id)
    
    paths = {
        'base': user_path,
        'uploads': user_path / 'uploads',
        'inventory_images': user_path / 'images' / 'inventory',
        'documents': user_path / 'documents',
        'exports': user_path / 'exports'
    }
    
    return paths

def ensure_user_directories(user_id: int) -> None:
    """Create user-specific directories if they don't exist."""
    paths = get_user_data_path(user_id)
    for path in paths.values():
        path.mkdir(parents=True, exist_ok=True)

async def get_user_inventory(pool: asyncpg.Pool, user_id: int):
    """Get user's inventory items."""
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM user_inventory 
                WHERE user_id = $1 
                ORDER BY created_at DESC
            """, user_id)
            return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error fetching user inventory: {e}")
        return []

async def get_user_documents(pool: asyncpg.Pool, user_id: int):
    """Get user's documents."""
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM user_documents 
                WHERE user_id = $1 
                ORDER BY created_at DESC
            """, user_id)
            return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error fetching user documents: {e}")
        return []

async def create_user_inventory(pool: asyncpg.Pool, user_id: int, data: Dict[str, Any]):
    """Create a new inventory item for user."""
    try:
        async with pool.acquire() as conn:
            return await conn.fetchrow("""
                INSERT INTO user_inventory (
                    user_id, name, description, image_url, category,
                    material, color, dimensions, origin_source,
                    import_cost, retail_price, key_tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id
            """,
                user_id,
                data.get('name'),
                data.get('description'),
                data.get('image_url'),
                data.get('category'),
                data.get('material'),
                data.get('color'),
                data.get('dimensions'),
                data.get('origin_source'),
                data.get('import_cost'),
                data.get('retail_price'),
                data.get('key_tags')
            )
    except Exception as e:
        logger.error(f"Error creating inventory item: {e}")
        raise

async def create_user_document(pool: asyncpg.Pool, user_id: int, data: Dict[str, Any]):
    """Create a new document for user."""
    try:
        async with pool.acquire() as conn:
            return await conn.fetchrow("""
                INSERT INTO user_documents (
                    user_id, title, author, journal_publisher,
                    publication_year, page_length, thesis, issue,
                    summary, category, field, hashtags,
                    influenced_by, file_path, file_type, extracted_text
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING id
            """,
                user_id,
                data.get('title'),
                data.get('author'),
                data.get('journal_publisher'),
                data.get('publication_year'),
                data.get('page_length'),
                data.get('thesis'),
                data.get('issue'),
                data.get('summary'),
                data.get('category'),
                data.get('field'),
                data.get('hashtags'),
                data.get('influenced_by'),
                data.get('file_path'),
                data.get('file_type'),
                data.get('extracted_text')
            )
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        raise

async def refresh_user_inventory_summary():
    """Refresh the materialized view for user inventory."""
    try:
        if neon_pool:
            async with neon_pool.acquire() as conn:
                await conn.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY user_inventory_summary")
    except Exception as e:
        logger.error(f"Error refreshing inventory summary: {e}")

async def search_user_inventory(pool: asyncpg.Pool, user_id: int, query: str, category: Optional[str] = None):
    """Search user's inventory with optional category filter."""
    try:
        async with pool.acquire() as conn:
            where_clause = "user_id = $1"
            params = [user_id]
            
            if category:
                where_clause += " AND category = $2"
                params.append(category)
            
            if query:
                search_clause = """ AND (
                    name ILIKE $%d OR
                    description ILIKE $%d OR
                    material ILIKE $%d OR
                    origin_source ILIKE $%d
                )""" % (len(params) + 1, len(params) + 1, len(params) + 1, len(params) + 1)
                where_clause += search_clause
                params.append(f"%{query}%")
            
            query = f"""
                SELECT * FROM user_inventory 
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT 100
            """
            
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error searching inventory: {e}")
        return []

async def search_user_documents(pool: asyncpg.Pool, user_id: int, query: str, field: str = 'all'):
    """Search user's documents with field-specific search."""
    try:
        async with pool.acquire() as conn:
            where_clause = "user_id = $1"
            params = [user_id]
            
            if field == 'content':
                where_clause += " AND extracted_text ILIKE $2"
            elif field == 'metadata':
                where_clause += """ AND (
                    title ILIKE $2 OR
                    author ILIKE $2 OR
                    summary ILIKE $2 OR
                    thesis ILIKE $2 OR
                    hashtags ILIKE $2
                )"""
            else:  # 'all'
                where_clause += """ AND (
                    title ILIKE $2 OR
                    author ILIKE $2 OR
                    summary ILIKE $2 OR
                    thesis ILIKE $2 OR
                    hashtags ILIKE $2 OR
                    extracted_text ILIKE $2
                )"""
            
            params.append(f"%{query}%")
            
            query = f"""
                SELECT id, title, author, summary, extracted_text
                FROM user_documents
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT 100
            """
            
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return []
