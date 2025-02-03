from quart import Blueprint, jsonify, request
from ..db import get_db_pool

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/', methods=['GET'])
async def get_inventory():
    """Get user's inventory items."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT * FROM user_inventory 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC
                """, int(user_id))
                
                return jsonify([dict(row) for row in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/', methods=['POST'])
async def create_inventory_item():
    """Create a new inventory item."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    INSERT INTO user_inventory (
                        user_id, name, description, image_url, category,
                        material, color, dimensions, origin_source,
                        import_cost, retail_price, key_tags
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING *
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
                
                return jsonify(dict(row))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/<int:item_id>', methods=['PUT'])
async def update_inventory_item(item_id):
    """Update an inventory item."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    UPDATE user_inventory SET
                        name = $1,
                        description = $2,
                        image_url = $3,
                        category = $4,
                        material = $5,
                        color = $6,
                        dimensions = $7,
                        origin_source = $8,
                        import_cost = $9,
                        retail_price = $10,
                        key_tags = $11,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $12 AND user_id = $13
                    RETURNING *
                """,
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
                    data.get('key_tags'),
                    item_id,
                    user_id
                )
                
                if not row:
                    return jsonify({'error': 'Item not found'}), 404
                
                return jsonify(dict(row))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
async def delete_inventory_item(item_id):
    """Delete an inventory item."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    DELETE FROM user_inventory
                    WHERE id = $1 AND user_id = $2
                    RETURNING id
                """, item_id, int(user_id))
                
                if not row:
                    return jsonify({'error': 'Item not found'}), 404
                
                return jsonify({'message': 'Item deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/search', methods=['GET'])
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
                where_clause = "user_id = $1"
                params = [int(user_id)]
                
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
                
                sql = f"""
                    SELECT * FROM user_inventory 
                    WHERE {where_clause}
                    ORDER BY created_at DESC
                    LIMIT 100
                """
                
                rows = await conn.fetch(sql, *params)
                return jsonify([dict(row) for row in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
