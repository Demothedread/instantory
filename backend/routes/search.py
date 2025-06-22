"""Search routes for inventory and document search using Quart blueprints"""

import logging

from quart import Blueprint, jsonify, request

from backend.config.database import get_metadata_pool
from backend.middleware.security import verify_token

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
search_bp = Blueprint("search", __name__)


@search_bp.route("/api/search", methods=["POST"])
async def search_inventory():
    """Search inventory items and documents using keyword search"""
    try:
        # Verify authentication
        current_user = await verify_token()
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = current_user.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        # Get search parameters
        data = await request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Search query is required"}), 400

        query = data.get("query", "").strip()
        if not query:
            return jsonify({"error": "Search query cannot be empty"}), 400

        search_type = data.get("search_type", "keyword")
        limit = min(data.get("limit", 20), 100)  # Max 100 results

        # Get database connection
        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database connection failed"}), 500

        results = []
        search_pattern = f"%{query.lower()}%"

        async with metadata_pool.acquire() as conn:
            # Search inventory items
            inventory_query = """
                SELECT 
                    id,
                    name,
                    description,
                    category,
                    image_url,
                    'inventory_item' as type,
                    CASE 
                        WHEN LOWER(name) LIKE $2 THEN 1
                        WHEN LOWER(description) LIKE $2 THEN 2
                        WHEN LOWER(category) LIKE $2 THEN 3
                        ELSE 4
                    END as relevance_score
                FROM inventory_items 
                WHERE user_id = $1 
                AND (
                    LOWER(name) LIKE $2
                    OR LOWER(description) LIKE $2 
                    OR LOWER(category) LIKE $2
                )
                ORDER BY relevance_score, name
                LIMIT $3
            """

            inventory_results = await conn.fetch(
                inventory_query, user_id, search_pattern, limit
            )

            for row in inventory_results:
                results.append(
                    {
                        "id": str(row["id"]),
                        "type": row["type"],
                        "name": row["name"],
                        "description": row["description"],
                        "category": row["category"],
                        "image_url": row["image_url"],
                        "score": 0.8
                        - (
                            row["relevance_score"] * 0.1
                        ),  # Higher score for more relevant matches
                    }
                )

            # Search documents if table exists and we have remaining capacity
            remaining_limit = limit - len(results)
            if remaining_limit > 0:
                try:
                    document_query = """
                        SELECT 
                            id,
                            filename as title,
                            content,
                            file_path as url,
                            'document' as type,
                            CASE 
                                WHEN LOWER(filename) LIKE $2 THEN 1
                                WHEN LOWER(content) LIKE $2 THEN 2
                                ELSE 3
                            END as relevance_score
                        FROM processed_documents 
                        WHERE user_id = $1 
                        AND (
                            LOWER(filename) LIKE $2
                            OR LOWER(content) LIKE $2
                        )
                        ORDER BY relevance_score, filename
                        LIMIT $3
                    """

                    doc_results = await conn.fetch(
                        document_query, user_id, search_pattern, remaining_limit
                    )

                    for row in doc_results:
                        # Truncate content for display
                        content = row["content"]
                        if content and len(content) > 200:
                            content = content[:200] + "..."

                        results.append(
                            {
                                "id": str(row["id"]),
                                "type": row["type"],
                                "title": row["title"],
                                "content": content,
                                "url": row["url"],
                                "score": 0.7 - (row["relevance_score"] * 0.1),
                            }
                        )

                except Exception as e:
                    logger.warning(
                        f"Could not search documents (table may not exist): {e}"
                    )

        return jsonify(
            {
                "results": results,
                "total": len(results),
                "query": query,
                "search_type": search_type,
            }
        )

    except Exception as e:
        logger.error(f"Error in search: {e}")
        return jsonify({"error": "Search failed"}), 500


@search_bp.route("/api/search/categories", methods=["GET"])
async def get_search_categories():
    """Get available categories for filtering search results"""
    try:
        # Verify authentication
        current_user = await verify_token()
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
                SELECT DISTINCT category
                FROM inventory_items 
                WHERE user_id = $1 
                AND category IS NOT NULL 
                AND category != ''
                ORDER BY category
            """

            results = await conn.fetch(query, user_id)
            categories = [row["category"] for row in results]

            return jsonify({"categories": categories})

    except Exception as e:
        logger.error(f"Error getting search categories: {e}")
        return jsonify({"error": "Failed to get categories"}), 500


@search_bp.route("/api/search/suggestions", methods=["GET"])
async def get_search_suggestions():
    """Get search suggestions based on query prefix"""
    try:
        # Verify authentication
        current_user = await verify_token()
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = current_user.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        # Get query prefix
        prefix = request.args.get("q", "").strip()
        if len(prefix) < 2:
            return jsonify({"suggestions": []})

        # Get database connection
        metadata_pool = await get_metadata_pool()
        if not metadata_pool:
            return jsonify({"error": "Database connection failed"}), 500

        suggestions = []
        search_pattern = f"{prefix.lower()}%"

        async with metadata_pool.acquire() as conn:
            # Get suggestions from item names
            name_query = """
                SELECT DISTINCT name
                FROM inventory_items 
                WHERE user_id = $1 
                AND LOWER(name) LIKE $2
                ORDER BY name
                LIMIT 5
            """

            name_results = await conn.fetch(name_query, user_id, search_pattern)
            suggestions.extend([row["name"] for row in name_results])

            # Get suggestions from categories
            category_query = """
                SELECT DISTINCT category
                FROM inventory_items 
                WHERE user_id = $1 
                AND LOWER(category) LIKE $2
                AND category IS NOT NULL
                AND category != ''
                ORDER BY category
                LIMIT 3
            """

            category_results = await conn.fetch(category_query, user_id, search_pattern)
            suggestions.extend([row["category"] for row in category_results])

        # Remove duplicates and limit
        unique_suggestions = list(dict.fromkeys(suggestions))[:8]

        return jsonify({"suggestions": unique_suggestions})

    except Exception as e:
        logger.error(f"Error getting search suggestions: {e}")
        return jsonify({"error": "Failed to get suggestions"}), 500
