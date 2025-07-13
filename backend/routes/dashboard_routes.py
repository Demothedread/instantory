"""
Dashboard API routes for providing summary statistics and insights.
Provides endpoints for dashboard widgets and analytics.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List

from quart import Blueprint, jsonify, request

from backend.config.database import get_metadata_pool
from backend.routes.auth_routes import verify_token
from backend.services.openai_service import openai_service
from backend.utils.decorators import async_error_handler

logger = logging.getLogger(__name__)

# Create blueprint
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
@verify_token
@async_error_handler
async def get_dashboard_summary():
    """
    Get comprehensive dashboard summary including statistics and AI insights.
    
    Query parameters:
    - period: 'week', 'month', 'quarter', 'year' (default: 'month')
    - include_insights: 'true'/'false' (default: 'true')
    """
    try:
        # Get query parameters
        period = request.args.get('period', 'month')
        include_insights = request.args.get('include_insights', 'true').lower() == 'true'
        
        # Calculate date range
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'quarter':
            start_date = now - timedelta(days=90)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)  # Default to month
        
        # Initialize summary data
        summary = {
            "period": period,
            "date_range": {
                "start": start_date.isoformat(),
                "end": now.isoformat()
            },
            "statistics": {},
            "insights": {},
            "generated_at": now.isoformat()
        }
        
        # Get database statistics
        try:
            async with get_metadata_pool().acquire() as conn:
                # Inventory statistics
                inventory_stats = await _get_inventory_statistics(conn, start_date)
                summary["statistics"]["inventory"] = inventory_stats
                
                # Document statistics
                document_stats = await _get_document_statistics(conn, start_date)
                summary["statistics"]["documents"] = document_stats
                
                # Processing statistics
                processing_stats = await _get_processing_statistics(conn, start_date)
                summary["statistics"]["processing"] = processing_stats
                
                # User activity statistics
                activity_stats = await _get_activity_statistics(conn, start_date)
                summary["statistics"]["activity"] = activity_stats
                
        except Exception as db_error:
            logger.warning(f"⚠️ Database statistics error: {db_error}")
            summary["statistics"] = {
                "error": "Statistics temporarily unavailable",
                "inventory": {"total": 0, "recent": 0},
                "documents": {"total": 0, "recent": 0},
                "processing": {"total": 0, "recent": 0},
                "activity": {"total_sessions": 0, "active_users": 0}
            }
        
        # Generate AI insights if requested
        if include_insights and openai_service.is_available:
            try:
                logger.info("🔄 Generating AI insights for dashboard summary")
                
                insight_data = {
                    "statistics": summary["statistics"],
                    "period": period,
                    "date_range": summary["date_range"]
                }
                
                insights_result = await openai_service.generate_insights(
                    data_type="dashboard",
                    data=insight_data,
                    context=f"Dashboard summary for {period} period"
                )
                
                if insights_result["success"]:
                    summary["insights"] = insights_result["insights"]
                    logger.info("✅ AI insights generated successfully")
                else:
                    logger.warning(f"⚠️ AI insights generation failed: {insights_result.get('error')}")
                    summary["insights"] = {"error": "AI insights temporarily unavailable"}
                    
            except Exception as ai_error:
                logger.warning(f"⚠️ AI insights error: {ai_error}")
                summary["insights"] = {"error": "AI insights temporarily unavailable"}
        else:
            summary["insights"] = {"status": "AI insights disabled or unavailable"}
        
        return jsonify(summary), 200
        
    except Exception as e:
        logger.error(f"❌ Dashboard summary error: {e}")
        return jsonify({
            "error": f"Failed to generate dashboard summary: {str(e)}",
            "generated_at": datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/stats/inventory', methods=['GET'])
@verify_token
@async_error_handler
async def get_inventory_stats():
    """Get detailed inventory statistics"""
    try:
        period = request.args.get('period', 'month')
        start_date = _get_start_date(period)
        
        async with get_metadata_pool().acquire() as conn:
            stats = await _get_inventory_statistics(conn, start_date)
            
        return jsonify({
            "period": period,
            "statistics": stats,
            "generated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Inventory stats error: {e}")
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route('/stats/documents', methods=['GET'])
@verify_token
@async_error_handler
async def get_document_stats():
    """Get detailed document statistics"""
    try:
        period = request.args.get('period', 'month')
        start_date = _get_start_date(period)
        
        async with get_metadata_pool().acquire() as conn:
            stats = await _get_document_statistics(conn, start_date)
            
        return jsonify({
            "period": period,
            "statistics": stats,
            "generated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Document stats error: {e}")
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route('/insights/trends', methods=['GET'])
@verify_token
@async_error_handler
async def get_trend_insights():
    """Get AI-powered trend insights"""
    try:
        if not openai_service.is_available:
            return jsonify({
                "error": "AI insights service not available",
                "trends": []
            }), 503
        
        period = request.args.get('period', 'month')
        start_date = _get_start_date(period)
        
        # Gather trend data
        async with get_metadata_pool().acquire() as conn:
            trend_data = await _get_trend_data(conn, start_date)
        
        # Generate AI insights
        insights_result = await openai_service.generate_insights(
            data_type="trends",
            data=trend_data,
            context=f"Trend analysis for {period} period"
        )
        
        if insights_result["success"]:
            return jsonify({
                "period": period,
                "trends": insights_result["insights"],
                "generated_at": datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                "error": insights_result.get("error", "Failed to generate insights"),
                "trends": []
            }), 500
        
    except Exception as e:
        logger.error(f"❌ Trend insights error: {e}")
        return jsonify({"error": str(e)}), 500

# Helper functions

def _get_start_date(period: str) -> datetime:
    """Get start date for the given period"""
    now = datetime.utcnow()
    if period == 'week':
        return now - timedelta(days=7)
    elif period == 'month':
        return now - timedelta(days=30)
    elif period == 'quarter':
        return now - timedelta(days=90)
    elif period == 'year':
        return now - timedelta(days=365)
    else:
        return now - timedelta(days=30)

async def _get_inventory_statistics(conn, start_date: datetime) -> Dict[str, Any]:
    """Get inventory statistics from database"""
    try:
        # Total inventory count
        total_result = await conn.fetchrow("SELECT COUNT(*) as total FROM inventory_items")
        total_count = total_result['total'] if total_result else 0
        
        # Recent inventory count
        recent_result = await conn.fetchrow(
            "SELECT COUNT(*) as recent FROM inventory_items WHERE created_at >= $1",
            start_date
        )
        recent_count = recent_result['recent'] if recent_result else 0
        
        # Categories
        categories_result = await conn.fetch(
            "SELECT category, COUNT(*) as count FROM inventory_items GROUP BY category ORDER BY count DESC LIMIT 10"
        )
        categories = [{"name": row['category'] or 'Uncategorized', "count": row['count']} 
                     for row in categories_result]
        
        # Average price
        price_result = await conn.fetchrow(
            "SELECT AVG(CAST(price AS FLOAT)) as avg_price FROM inventory_items WHERE price IS NOT NULL AND price != 'null'"
        )
        avg_price = round(price_result['avg_price'], 2) if price_result and price_result['avg_price'] else 0
        
        return {
            "total": total_count,
            "recent": recent_count,
            "categories": categories,
            "average_price": avg_price,
            "growth_rate": round((recent_count / max(total_count - recent_count, 1)) * 100, 2)
        }
        
    except Exception as e:
        logger.warning(f"⚠️ Error getting inventory statistics: {e}")
        return {"total": 0, "recent": 0, "categories": [], "average_price": 0, "growth_rate": 0}

async def _get_document_statistics(conn, start_date: datetime) -> Dict[str, Any]:
    """Get document statistics from database"""
    try:
        # Check if documents table exists
        table_exists = await conn.fetchrow(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents')"
        )
        
        if not table_exists or not table_exists['exists']:
            return {"total": 0, "recent": 0, "types": [], "processing_status": {}}
        
        # Total documents count
        total_result = await conn.fetchrow("SELECT COUNT(*) as total FROM documents")
        total_count = total_result['total'] if total_result else 0
        
        # Recent documents count
        recent_result = await conn.fetchrow(
            "SELECT COUNT(*) as recent FROM documents WHERE created_at >= $1",
            start_date
        )
        recent_count = recent_result['recent'] if recent_result else 0
        
        # Document types
        types_result = await conn.fetch(
            "SELECT document_type, COUNT(*) as count FROM documents GROUP BY document_type ORDER BY count DESC LIMIT 10"
        )
        types = [{"type": row['document_type'] or 'Unknown', "count": row['count']} 
                for row in types_result]
        
        return {
            "total": total_count,
            "recent": recent_count,
            "types": types,
            "growth_rate": round((recent_count / max(total_count - recent_count, 1)) * 100, 2)
        }
        
    except Exception as e:
        logger.warning(f"⚠️ Error getting document statistics: {e}")
        return {"total": 0, "recent": 0, "types": [], "growth_rate": 0}

async def _get_processing_statistics(conn, start_date: datetime) -> Dict[str, Any]:
    """Get processing statistics from database"""
    try:
        # This would depend on having a processing_tasks or similar table
        # For now, return basic stats
        return {
            "total_processed": 0,
            "recent_processed": 0,
            "success_rate": 0,
            "average_processing_time": 0
        }
        
    except Exception as e:
        logger.warning(f"⚠️ Error getting processing statistics: {e}")
        return {"total_processed": 0, "recent_processed": 0, "success_rate": 0, "average_processing_time": 0}

async def _get_activity_statistics(conn, start_date: datetime) -> Dict[str, Any]:
    """Get user activity statistics from database"""
    try:
        # Check if user sessions table exists
        sessions_exist = await conn.fetchrow(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_sessions')"
        )
        
        if not sessions_exist or not sessions_exist['exists']:
            return {"total_sessions": 0, "active_users": 0, "recent_sessions": 0}
        
        # Total sessions
        total_sessions = await conn.fetchrow("SELECT COUNT(*) as total FROM user_sessions")
        total_count = total_sessions['total'] if total_sessions else 0
        
        # Recent sessions
        recent_sessions = await conn.fetchrow(
            "SELECT COUNT(*) as recent FROM user_sessions WHERE created_at >= $1",
            start_date
        )
        recent_count = recent_sessions['recent'] if recent_sessions else 0
        
        # Active users (unique users with sessions in period)
        active_users = await conn.fetchrow(
            "SELECT COUNT(DISTINCT user_id) as active FROM user_sessions WHERE created_at >= $1",
            start_date
        )
        active_count = active_users['active'] if active_users else 0
        
        return {
            "total_sessions": total_count,
            "recent_sessions": recent_count,
            "active_users": active_count
        }
        
    except Exception as e:
        logger.warning(f"⚠️ Error getting activity statistics: {e}")
        return {"total_sessions": 0, "active_users": 0, "recent_sessions": 0}

async def _get_trend_data(conn, start_date: datetime) -> Dict[str, Any]:
    """Get data for trend analysis"""
    try:
        # Daily inventory additions
        daily_inventory = await conn.fetch("""
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM inventory_items 
            WHERE created_at >= $1 
            GROUP BY DATE(created_at) 
            ORDER BY date
        """, start_date)
        
        # Category trends
        category_trends = await conn.fetch("""
            SELECT category, DATE(created_at) as date, COUNT(*) as count 
            FROM inventory_items 
            WHERE created_at >= $1 
            GROUP BY category, DATE(created_at) 
            ORDER BY date, count DESC
        """, start_date)
        
        return {
            "daily_inventory": [{"date": str(row['date']), "count": row['count']} 
                              for row in daily_inventory],
            "category_trends": [{"category": row['category'] or 'Uncategorized', 
                               "date": str(row['date']), "count": row['count']} 
                              for row in category_trends]
        }
        
    except Exception as e:
        logger.warning(f"⚠️ Error getting trend data: {e}")
        return {"daily_inventory": [], "category_trends": []}

# Export blueprint
__all__ = ['dashboard_bp']
