"""Inventory management routes with image handling."""
import logging
from quart import Blueprint, jsonify, request
from ..db import get_db_pool
from ..services.storage.manager import storage_manager

logger = logging.getLogger(__name__)

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory', methods=['GET'])
async def get_inventory():
    """Get user's inventory items."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Join with inventory_assets to get image URLs
                rows = await conn.fetch("""
                    SELECT i.*, a.asset_url as image_url
                    FROM user_inventory i
                    LEFT JOIN inventory_assets a ON i.id = a.inventory_id
                    WHERE i.user_id = $1 
                    ORDER BY i.created_at DESC
                """, int(user_id))
                
                return jsonify([dict(row) for row in rows])
    except Exception as e:
        logger.error(f"Error fetching inventory: {e}")
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/api/inventory', methods=['POST'])
async def create_inventory_item():
    """Create a new inventory item with image."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Start transaction
        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    # Create inventory item
                    row = await conn.fetchrow("""
                        INSERT INTO user_inventory (
                            user_id, name, description, category,
                            material, color, dimensions, origin_source,
                            import_cost, retail_price, key_tags
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        RETURNING *
                    """,
                        int(user_id),
                        data.get('name'),
                        data.get('description'),
                        data.get('category'),
                        data.get('material'),
                        data.get('color'),
                        data.get('dimensions'),
                        data.get('origin_source'),
                        data.get('import_cost'),
                        data.get('retail_price'),
                        data.get('key_tags')
                    )
                    
                    # If image URL provided, create asset record
                    image_url = data.get('image_url')
                    if image_url:
                        await conn.execute("""
                            INSERT INTO inventory_assets (
                                inventory_id, asset_url, asset_type
                            ) VALUES ($1, $2, $3)
                        """,
                            row['id'],
                            image_url,
                            'image'
                        )
                
                result = dict(row)
                result['image_url'] = image_url
                return jsonify(result)
    except Exception as e:
        logger.error(f"Error creating inventory item: {e}")
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/api/inventory/<int:item_id>', methods=['PUT'])
async def update_inventory_item(item_id):
    """Update an inventory item and its image."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    # Update inventory item
                    row = await conn.fetchrow("""
                        UPDATE user_inventory SET
                            name = $1,
                            description = $2,
                            category = $3,
                            material = $4,
                            color = $5,
                            dimensions = $6,
                            origin_source = $7,
                            import_cost = $8,
                            retail_price = $9,
                            key_tags = $10,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $11 AND user_id = $12
                        RETURNING *
                    """,
                        data.get('name'),
                        data.get('description'),
                        data.get('category'),
                        data.get('material'),
                        data.get('color'),
                        data.get('dimensions'),
                        data.get('origin_source'),
                        data.get('import_cost'),
                        data.get('retail_price'),
                        data.get('key_tags'),
                        item_id,
                        int(user_id)
                    )
                    
                    if not row:
                        return jsonify({'error': 'Item not found'}), 404
                    
                    # Update image if provided
                    image_url = data.get('image_url')
                    if image_url:
                        # Get existing asset
                        asset_row = await conn.fetchrow("""
                            SELECT asset_url FROM inventory_assets
                            WHERE inventory_id = $1
                        """, item_id)
                        
                        if asset_row:
                            # Delete old image from storage
                            old_url = asset_row['asset_url']
                            if old_url:
                                await storage_manager.delete_file(old_url)
                            
                            # Update asset record
                            await conn.execute("""
                                UPDATE inventory_assets
                                SET asset_url = $1, updated_at = CURRENT_TIMESTAMP
                                WHERE inventory_id = $2
                            """, image_url, item_id)
                        else:
                            # Create new asset record
                            await conn.execute("""
                                INSERT INTO inventory_assets (
                                    inventory_id, asset_url, asset_type
                                ) VALUES ($1, $2, $3)
                            """, item_id, image_url, 'image')
                    
                    result = dict(row)
                    result['image_url'] = image_url
                    return jsonify(result)
    except Exception as e:
        logger.error(f"Error updating inventory item {item_id}: {e}")
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/api/inventory/<int:item_id>', methods=['DELETE'])
async def delete_inventory_item(item_id):
    """Delete an inventory item and its associated image."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    # Get image URL before deletion
                    asset_row = await conn.fetchrow("""
                        SELECT asset_url FROM inventory_assets
                        WHERE inventory_id = $1
                    """, item_id)
                    
                    # Delete inventory item (cascades to assets)
                    row = await conn.fetchrow("""
                        DELETE FROM user_inventory
                        WHERE id = $1 AND user_id = $2
                        RETURNING id
                    """, item_id, int(user_id))
                    
                    if not row:
                        return jsonify({'error': 'Item not found'}), 404
                    
                    # Delete image from storage if it exists
                    if asset_row and asset_row['asset_url']:
                        await storage_manager.delete_file(asset_row['asset_url'])
                    
                    return jsonify({'message': 'Item deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting inventory item {item_id}: {e}")
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/api/inventory/search', methods=['GET'])
async def search_inventory():
    """Search inventory items."""
    try:
        user_id = request.args.get('user_id')
        query = request.args.get('query', '').strip()
        category = request.args.get('category')

        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                where_clause = "i.user_id = $1"
                params = [int(user_id)]
                
                if category:
                    where_clause += " AND i.category = $2"
                    params.append(category)
                
                if query:
                    search_clause = """ AND (
                        i.name ILIKE $%d OR
                        i.description ILIKE $%d OR
                        i.material ILIKE $%d OR
                        i.origin_source ILIKE $%d
                    )""" % (len(params) + 1, len(params) + 1, len(params) + 1, len(params) + 1)
                    where_clause += search_clause
                    params.append(f"%{query}%")
                
                sql = f"""
                    SELECT i.*, a.asset_url as image_url
                    FROM user_inventory i
                    LEFT JOIN inventory_assets a ON i.id = a.inventory_id
                    WHERE {where_clause}
                    ORDER BY i.created_at DESC
                    LIMIT 100
                """
                
                rows = await conn.fetch(sql, *params)
                return jsonify([dict(row) for row in rows])
    except Exception as e:
        logger.error(f"Error searching inventory: {e}")
        return jsonify({'error': str(e)}), 500
