"""Statistics routes for dashboard analytics."""

import logging
from datetime import datetime, timedelta
from quart import Blueprint, jsonify, request
from backend.config.database import get_metadata_pool

logger = logging.getLogger(__name__)

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/api/stats/dashboard', methods=['GET'])
async def get_dashboard_stats():
    """Get dashboard statistics for a user."""
    try:
        # Get user_id from request args or headers
        user_id = request.args.get('user_id') or request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database unavailable"}), 503

        async with metadata_pool.acquire() as conn:
            # Get document count
            doc_count = await conn.fetchval(
                "SELECT COUNT(*) FROM user_documents WHERE user_id = $1",
                int(user_id)
            )
            
            # Get inventory count
            inventory_count = await conn.fetchval(
                "SELECT COUNT(*) FROM user_inventory WHERE user_id = $1",
                int(user_id)
            )
            
            # Get recent activity (last 10 items from both documents and inventory)
            recent_docs = await conn.fetch(
                """
                SELECT 'document' as type, title as name, created_at
                FROM user_documents 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 5
                """,
                int(user_id)
            )
            
            recent_inventory = await conn.fetch(
                """
                SELECT 'inventory' as type, name, created_at
                FROM user_inventory 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 5
                """,
                int(user_id)
            )
            
            # Combine and sort recent activity
            recent_activity = []
            for row in recent_docs:
                recent_activity.append({
                    "type": row["type"],
                    "name": row["name"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None
                })
            
            for row in recent_inventory:
                recent_activity.append({
                    "type": row["type"],
                    "name": row["name"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None
                })
            
            # Sort by created_at descending
            recent_activity.sort(key=lambda x: x["created_at"] or "", reverse=True)
            recent_activity = recent_activity[:10]  # Limit to 10 most recent
            
            # Get processing statistics (if available)
            # Check if processing tasks table exists
            processing_count = 0
            try:
                processing_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM processing_tasks WHERE user_id = $1 AND status = 'completed'",
                    int(user_id)
                )
            except Exception:
                # Table might not exist, that's okay
                processing_count = 0
                
            return jsonify({
                "documentsProcessed": doc_count or 0,
                "inventoryItems": inventory_count or 0,
                "processingTasksCompleted": processing_count or 0,
                "recentActivity": recent_activity
            })
            
    except Exception as e:
        logger.error("Error fetching dashboard stats: %s", e)
        return jsonify({"error": "Failed to fetch statistics"}), 500

@stats_bp.route('/api/stats/processing-history', methods=['GET'])
async def get_processing_history():
    """Get processing history for a user."""
    try:
        user_id = request.args.get('user_id') or request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database unavailable"}), 503

        async with metadata_pool.acquire() as conn:
            # Try to get processing history
            try:
                processing_history = await conn.fetch(
                    """
                    SELECT task_id, status, progress, created_at, updated_at, 
                           error_message, result_summary
                    FROM processing_tasks 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT 50
                    """,
                    int(user_id)
                )
                
                history = []
                for row in processing_history:
                    history.append({
                        "task_id": row["task_id"],
                        "status": row["status"],
                        "progress": row["progress"],
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                        "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
                        "error_message": row.get("error_message"),
                        "result_summary": row.get("result_summary")
                    })
                
                return jsonify(history)
                
            except Exception:
                # Processing tasks table might not exist
                return jsonify([])
                
    except Exception as e:
        logger.error("Error fetching processing history: %s", e)
        return jsonify({"error": "Failed to fetch processing history"}), 500

@stats_bp.route('/api/stats/overview', methods=['GET'])
async def get_stats_overview():
    """Get comprehensive statistics overview."""
    try:
        user_id = request.args.get('user_id') or request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database unavailable"}), 503

        async with metadata_pool.acquire() as conn:
            # Get counts by category for documents
            doc_categories = await conn.fetch(
                """
                SELECT category, COUNT(*) as count
                FROM user_documents 
                WHERE user_id = $1 AND category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC
                """,
                int(user_id)
            )
            
            # Get counts by category for inventory
            inventory_categories = await conn.fetch(
                """
                SELECT category, COUNT(*) as count
                FROM user_inventory 
                WHERE user_id = $1 AND category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC
                """,
                int(user_id)
            )
            
            # Get weekly activity (last 4 weeks)
            four_weeks_ago = datetime.now() - timedelta(weeks=4)
            weekly_docs = await conn.fetch(
                """
                SELECT DATE_TRUNC('week', created_at) as week, COUNT(*) as count
                FROM user_documents 
                WHERE user_id = $1 AND created_at >= $2
                GROUP BY week
                ORDER BY week
                """,
                int(user_id), four_weeks_ago
            )
            
            weekly_inventory = await conn.fetch(
                """
                SELECT DATE_TRUNC('week', created_at) as week, COUNT(*) as count
                FROM user_inventory 
                WHERE user_id = $1 AND created_at >= $2
                GROUP BY week
                ORDER BY week
                """,
                int(user_id), four_weeks_ago
            )
            
            return jsonify({
                "documentCategories": [
                    {"category": row["category"], "count": row["count"]} 
                    for row in doc_categories
                ],
                "inventoryCategories": [
                    {"category": row["category"], "count": row["count"]} 
                    for row in inventory_categories
                ],
                "weeklyDocuments": [
                    {"week": row["week"].isoformat() if row["week"] else None, "count": row["count"]} 
                    for row in weekly_docs
                ],
                "weeklyInventory": [
                    {"week": row["week"].isoformat() if row["week"] else None, "count": row["count"]} 
                    for row in weekly_inventory
                ]
            })
            
    except Exception as e:
        logger.error("Error fetching stats overview: %s", e)
        return jsonify({"error": "Failed to fetch statistics overview"}), 500
