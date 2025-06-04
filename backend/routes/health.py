"""Health check routes for monitoring system health."""

import logging
import os
from quart import Blueprint, jsonify
from backend.config.database import get_vector_pool, get_metadata_pool
from backend.services.storage.manager import storage_manager

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
async def health_check():
    """Check overall system health."""
    result = {
        "status": "healthy",
        "components": {}
    }
    
    # Check database connections
    try:
        # Check metadata database
        metadata_pool = None
        try:
            metadata_pool = await get_metadata_pool()
            if metadata_pool:
                async with metadata_pool.acquire() as conn:
                    await conn.fetchval("SELECT 1")
                result["components"]["metadata_db"] = {"status": "healthy"}
            else:
                result["components"]["metadata_db"] = {"status": "unavailable"}
                result["status"] = "degraded"
        except Exception as e:
            result["components"]["metadata_db"] = {"status": "unhealthy", "details": str(e)}
            result["status"] = "degraded"
            
        # Check vector database
        try:
            vector_pool = await get_vector_pool()
            if vector_pool:
                async with vector_pool.acquire() as conn:
                    await conn.fetchval("SELECT 1")
                result["components"]["vector_db"] = {"status": "healthy"}
            else:
                result["components"]["vector_db"] = {"status": "unavailable"}
                # If vector DB is separate from metadata DB
                if os.getenv('VECTOR_DATABASE_URL') or os.getenv('NEON_DATABASE_URL'):
                    result["status"] = "degraded"
        except Exception as e:
            result["components"]["vector_db"] = {"status": "unhealthy", "details": str(e)}
            # If vector DB is separate from metadata DB
            if os.getenv('VECTOR_DATABASE_URL') or os.getenv('NEON_DATABASE_URL'):
                result["status"] = "degraded"
    except Exception as e:
        result["components"]["database"] = {"status": "unhealthy", "details": str(e)}
        result["status"] = "critical"
    
    # Check storage systems
    try:
        storage_health = await storage_manager.check_storage_health()
        result["components"]["storage"] = storage_health
        if storage_health["status"] != "healthy":
            result["status"] = "degraded"
    except Exception as e:
        result["components"]["storage"] = {"status": "unhealthy", "details": str(e)}
        result["status"] = "degraded"
    
    # Return health check results with appropriate status code
    status_code = 200
    if result["status"] == "critical":
        status_code = 503  # Service Unavailable
    elif result["status"] == "degraded":
        status_code = 207  # Multi-Status
        
    return jsonify(result), status_code

@health_bp.route('/api/health/storage', methods=['GET'])
async def storage_health_check():
    """Check storage system health specifically."""
    try:
        health = await storage_manager.check_storage_health()
        status_code = 200 if health["status"] == "healthy" else 207
        return jsonify(health), status_code
    except Exception as e:
        logger.error(f"Error checking storage health: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
