"""Statistics API routes for dashboard metrics"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from datetime import datetime, timedelta
from config.database import get_db
from middleware.security import verify_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the current user"""
    try:
        user_id = current_user.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid user")

        # Single optimized query to get all basic stats
        basic_stats_query = text("""
            SELECT 
                COUNT(*) as total_items,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_uploads,
                COUNT(DISTINCT CASE WHEN category IS NOT NULL AND category != '' THEN category END) as categories
            FROM inventory_items 
            WHERE user_id = :user_id
        """)
        
        result = db.execute(basic_stats_query, {"user_id": user_id})
        row = result.fetchone()
        
        if row:
            stats = {
                "totalItems": row.total_items or 0,
                "recentUploads": row.recent_uploads or 0,
                "categories": row.categories or 0
            }
        else:
            stats = {
                "totalItems": 0,
                "recentUploads": 0,
                "categories": 0
            }

        # Get recent activity (last 10 items)
        recent_activity_query = text("""
            SELECT name, category, created_at
            FROM inventory_items 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC 
            LIMIT 10
        """)
        
        recent_result = db.execute(recent_activity_query, {"user_id": user_id})
        recent_activity = [
            {
                "type": "inventory",
                "name": row.name,
                "category": row.category,
                "created_at": row.created_at.isoformat() if row.created_at else None
            }
            for row in recent_result
        ]
        
        stats["recentActivity"] = recent_activity
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/summary")
async def get_summary_stats(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get comprehensive summary statistics for the current user"""
    try:
        user_id = current_user.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid user")

        # Optimized query for time-based statistics
        time_stats_query = text("""
            SELECT 
                COUNT(*) as total_items,
                COUNT(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN 1 END) as this_month,
                COUNT(CASE WHEN created_at >= DATE_TRUNC('week', NOW()) THEN 1 END) as this_week,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days
            FROM inventory_items 
            WHERE user_id = :user_id
        """)
        
        result = db.execute(time_stats_query, {"user_id": user_id})
        time_stats = result.fetchone()

        # Get category breakdown
        category_query = text("""
            SELECT category, COUNT(*) as count
            FROM inventory_items 
            WHERE user_id = :user_id 
            AND category IS NOT NULL 
            AND category != ''
            GROUP BY category
            ORDER BY count DESC
            LIMIT 20
        """)
        
        category_result = db.execute(category_query, {"user_id": user_id})
        categories = {row.category: row.count for row in category_result}

        # Get recent items
        recent_query = text("""
            SELECT name, category, created_at
            FROM inventory_items 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC 
            LIMIT 15
        """)
        
        recent_result = db.execute(recent_query, {"user_id": user_id})
        recent_items = [
            {
                "name": row.name,
                "category": row.category,
                "createdAt": row.created_at.isoformat() if row.created_at else None
            }
            for row in recent_result
        ]

        # Weekly trend data (last 8 weeks)
        weekly_trend_query = text("""
            SELECT 
                DATE_TRUNC('week', created_at) as week,
                COUNT(*) as count
            FROM inventory_items 
            WHERE user_id = :user_id 
            AND created_at >= NOW() - INTERVAL '8 weeks'
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week ASC
        """)
        
        weekly_result = db.execute(weekly_trend_query, {"user_id": user_id})
        weekly_trend = [
            {
                "week": row.week.isoformat() if row.week else None,
                "count": row.count
            }
            for row in weekly_result
        ]

        stats = {
            "items": {
                "total": time_stats.total_items if time_stats else 0,
                "byCategory": categories,
                "recent": recent_items
            },
            "uploads": {
                "total": time_stats.total_items if time_stats else 0,
                "thisMonth": time_stats.this_month if time_stats else 0,
                "thisWeek": time_stats.this_week if time_stats else 0,
                "last7Days": time_stats.last_7_days if time_stats else 0
            },
            "trends": {
                "weekly": weekly_trend
            },
            "storage": {
                "documentsCount": 0,  # Placeholder for future implementation
                "imagesCount": 0      # Placeholder for future implementation
            }
        }
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting summary stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/categories")
async def get_category_stats(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get detailed category statistics"""
    try:
        user_id = current_user.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid user")

        # Get category statistics with recent activity
        category_stats_query = text("""
            SELECT 
                category,
                COUNT(*) as total_count,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_count,
                MAX(created_at) as last_added,
                MIN(created_at) as first_added
            FROM inventory_items 
            WHERE user_id = :user_id 
            AND category IS NOT NULL 
            AND category != ''
            GROUP BY category
            ORDER BY total_count DESC
        """)
        
        result = db.execute(category_stats_query, {"user_id": user_id})
        
        categories = []
        for row in result:
            categories.append({
                "name": row.category,
                "totalCount": row.total_count,
                "recentCount": row.recent_count,
                "lastAdded": row.last_added.isoformat() if row.last_added else None,
                "firstAdded": row.first_added.isoformat() if row.first_added else None
            })
        
        return {
            "categories": categories,
            "totalCategories": len(categories)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting category stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
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
            row = result.fetchone()
            if row:
                stats["uploads"]["thisMonth"] = row.count
        except Exception as e:
            logger.warning(f"Could not get monthly uploads: {e}")
        
        # Get uploads this week
        try:
            result = db.execute(
                text("""
                    SELECT COUNT(*) as count 
                    FROM inventory_items 
                    WHERE user_id = :user_id 
                    AND created_at >= DATE_TRUNC('week', NOW())
                """),
                {"user_id": user_id}
            )
            row = result.fetchone()
            if row:
                stats["uploads"]["thisWeek"] = row.count
        except Exception as e:
            logger.warning(f"Could not get weekly uploads: {e}")
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting summary stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
