from quart import Blueprint, jsonify, request
from db import get_db_pool
import logging

logger = logging.getLogger(__name__)

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/', methods=['GET'])
async def get_documents():
    """Get user's documents."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT id, title, author, journal_publisher, publication_year,
                           page_length, thesis, issue, summary, category, field,
                           hashtags, influenced_by, file_path, file_type, created_at
                    FROM user_documents
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                    LIMIT 1000
                """, int(user_id))
                
                return jsonify([dict(row) for row in rows])
    except Exception as e:
        logger.error(f"Error fetching documents: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:doc_id>', methods=['GET'])
async def get_document(doc_id):
    """Get a specific document."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT id, title, author, journal_publisher, publication_year,
                           page_length, thesis, issue, summary, category, field,
                           hashtags, influenced_by, file_path, file_type, created_at,
                           extracted_text
                    FROM user_documents
                    WHERE id = $1 AND user_id = $2
                """, doc_id, int(user_id))
                
                if not row:
                    return jsonify({'error': 'Document not found'}), 404
                
                return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error fetching document {doc_id}: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/', methods=['POST'])
async def create_document():
    """Create a new document."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    INSERT INTO user_documents (
                        user_id, title, author, journal_publisher,
                        publication_year, page_length, thesis, issue,
                        summary, category, field, hashtags,
                        influenced_by, file_path, file_type, extracted_text
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    RETURNING *
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
                
                return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:doc_id>', methods=['PUT'])
async def update_document(doc_id):
    """Update a document."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    UPDATE user_documents SET
                        title = $1,
                        author = $2,
                        journal_publisher = $3,
                        publication_year = $4,
                        page_length = $5,
                        thesis = $6,
                        issue = $7,
                        summary = $8,
                        category = $9,
                        field = $10,
                        hashtags = $11,
                        influenced_by = $12,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $13 AND user_id = $14
                    RETURNING *
                """,
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
                    doc_id,
                    user_id
                )
                
                if not row:
                    return jsonify({'error': 'Document not found'}), 404
                
                return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error updating document {doc_id}: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
async def delete_document(doc_id):
    """Delete a document."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    DELETE FROM user_documents
                    WHERE id = $1 AND user_id = $2
                    RETURNING id, file_path
                """, doc_id, int(user_id))
                
                if not row:
                    return jsonify({'error': 'Document not found'}), 404
                
                # Note: File deletion should be handled by a cleanup task
                return jsonify({'message': 'Document deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting document {doc_id}: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/search', methods=['POST'])
async def search_documents():
    """Search documents by content or metadata."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        query = data.get('query', '').strip()
        field = data.get('field', 'all')  # all, content, or metadata

        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                where_clause = "user_id = $1"
                params = [int(user_id)]
                
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
                
                sql = f"""
                    SELECT id, title, author, summary, extracted_text
                    FROM user_documents
                    WHERE {where_clause}
                    ORDER BY created_at DESC
                    LIMIT 100
                """
                
                rows = await conn.fetch(sql, *params)
                
                # Extract relevant excerpts for search results
                results = []
                for row in rows:
                    excerpt = extract_matching_excerpt(row['extracted_text'], query)
                    result = {
                        'id': row['id'],
                        'title': row['title'],
                        'author': row['author'],
                        'summary': row['summary'],
                        'excerpt': excerpt
                    }
                    results.append(result)
                
                return jsonify({'results': results})
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return jsonify({'error': str(e)}), 500

def extract_matching_excerpt(text: str, query: str, context_chars: int = 150) -> str:
    """Extract a relevant excerpt from text containing the search query."""
    if not text or not query:
        return ""
    
    query_pos = text.lower().find(query.lower())
    if query_pos == -1:
        return text[:300] + "..."
    
    start = max(0, query_pos - context_chars)
    end = min(len(text), query_pos + len(query) + context_chars)
    
    excerpt = text[start:end]
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(text):
        excerpt = excerpt + "..."
    
    return excerpt
