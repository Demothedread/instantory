"""Statistics routes for dashboard metrics using Quart blueprints"""

import logging
from datetime import datetime, timedelta

from auth_routes import verify_token
from quart import Blueprint, jsonify, request

from backend.config.database import get_metadata_pool

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/api/stats/dashboard", methods=["GET"])
async def get_dashboard_stats():
    """Get dashboard statistics for the current user"""
    try:
        # Extract access token from request
        access_token = request.cookies.get("access_token")
        if not access_token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
            else:
                access_token = request.args.get("access_token")

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        # Verify authentication
        current_user = verify_token(access_token, "access")
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = current_user.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        # Get database connection
        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database connection failed"}), 500

        async with metadata_pool.acquire() as conn:
            # Get total items count
            total_items_query = """
                SELECT COUNT(*) as total_items
                FROM inventory_items 
                WHERE user_id = $1
            """

            total_result = await conn.fetchrow(total_items_query, user_id)
            total_items = total_result["total_items"] if total_result else 0

            # Get recent uploads (last 7 days)
            recent_query = """
                SELECT COUNT(*) as recent_uploads
                FROM inventory_items 
                WHERE user_id = $1 
                AND created_at >= NOW() - INTERVAL '7 days'
            """

            recent_result = await conn.fetchrow(recent_query, user_id)
            recent_uploads = recent_result["recent_uploads"] if recent_result else 0

            # Get categories count
            categories_query = """
                SELECT COUNT(DISTINCT category) as categories
                FROM inventory_items 
                WHERE user_id = $1 
                AND category IS NOT NULL 
                AND category != ''
            """

            categories_result = await conn.fetchrow(categories_query, user_id)
            categories = categories_result["categories"] if categories_result else 0

            # Get storage usage (if documents table exists)
            storage_used = 0
            try:
                storage_query = """
                    SELECT COALESCE(SUM(file_size), 0) as storage_used
                    FROM processed_documents 
                    WHERE user_id = $1
                """
                storage_result = await conn.fetchrow(storage_query, user_id)
                storage_used = storage_result["storage_used"] if storage_result else 0
            except Exception as e:
                logger.warning(f"Documents table may not exist: {e}")

            stats = {
                "totalItems": total_items,
                "recentUploads": recent_uploads,
                "categories": categories,
                "storageUsed": storage_used,
                "lastUpdated": datetime.now().isoformat(),
            }

            return jsonify(stats)

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return jsonify({"error": "Failed to get dashboard statistics"}), 500


@stats_bp.route("/api/stats/inventory/by-category", methods=["GET"])
async def get_inventory_by_category():
    """Get inventory distribution by category"""
    try:
        # Extract access token from request
        access_token = request.cookies.get("access_token")
        if not access_token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
            else:
                access_token = request.args.get("access_token")

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        # Verify authentication
        current_user = verify_token(access_token, "access")
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = current_user.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        # Get database connection
        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database connection failed"}), 500

        async with metadata_pool.acquire() as conn:
            query = """
                SELECT 
                    COALESCE(category, 'Uncategorized') as category,
                    COUNT(*) as count
                FROM inventory_items 
                WHERE user_id = $1
                GROUP BY category
                ORDER BY count DESC
            """

            results = await conn.fetch(query, user_id)

            category_stats = [
                {"category": row["category"], "count": row["count"]} for row in results
            ]

            return jsonify({"categoryStats": category_stats})

    except Exception as e:
        logger.error(f"Error getting category stats: {e}")
        return jsonify({"error": "Failed to get category statistics"}), 500


@stats_bp.route("/api/stats/activity", methods=["GET"])
async def get_activity_stats():
    """Get activity statistics over time"""
    try:
        # Extract access token from request
        access_token = request.cookies.get("access_token")
        if not access_token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
            else:
                access_token = request.args.get("access_token")

        if not access_token:
            return jsonify({"error": "Unauthorized"}), 401

        # Verify authentication
        current_user = verify_token(access_token, "access")
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = current_user.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        # Get time range from query params
        days = request.args.get("days", 30, type=int)
        if days > 365:
            days = 365  # Max 1 year

        # Get database connection
        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database connection failed"}), 500

        async with metadata_pool.acquire() as conn:
            query = """
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count
                FROM inventory_items 
                WHERE user_id = $1
                AND created_at >= NOW() - INTERVAL '{} days'
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            """.format(
                days
            )

            results = await conn.fetch(query, user_id)

            activity_stats = [
                {"date": row["date"].isoformat(), "count": row["count"]}
                for row in results
            ]

            return jsonify({"activityStats": activity_stats})

    except Exception as e:
        logger.error(f"Error getting activity stats: {e}")
        return jsonify({"error": "Failed to get activity statistics"}), 500
