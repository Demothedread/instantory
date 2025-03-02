"""Document management routes with vector search capabilities."""
import logging
from io import BytesIO
from quart import Blueprint, request, jsonify, send_file
from ..db import get_db_pool
from ..services.storage.manager import storage_manager

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/api/documents', methods=['GET'])
async def get_documents():
    """Get all documents for the current user."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT id, title, author, journal_publisher, publication_year,
                           page_length, thesis, issue, summary, category, field,
                           hashtags, influenced_by, file_path, file_type, created_at
                    FROM user_documents
                    WHERE user_id = $1 
                    ORDER BY created_at DESC
                """, int(user_id))
                return jsonify([dict(row) for row in rows])
    except Exception as e:
        logger.error(f"Error fetching documents: {e}")
        return jsonify({"error": "Failed to fetch documents"}), 500

@documents_bp.route('/api/documents/content', methods=['GET'])
async def get_document_content():
    """Get document content from storage."""
    try:
        document_url = request.args.get('url')
        if not document_url:
            return jsonify({"error": "No document URL provided"}), 400

        # Get document content using storage manager
        content = await storage_manager.get_file(document_url)
        if not content:
            return jsonify({"error": "Document not found"}), 404

        # Create in-memory file
        file_obj = BytesIO(content)
        
        # Determine content type based on file extension
        content_type = 'application/octet-stream'  # Default
        if document_url.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif document_url.lower().endswith(('.doc', '.docx')):
            content_type = 'application/msword'
        elif document_url.lower().endswith('.txt'):
            content_type = 'text/plain'

        return await send_file(
            file_obj,
            mimetype=content_type,
            as_attachment=False,
            attachment_filename=document_url.split('/')[-1]
        )
    except Exception as e:
        logger.error(f"Error retrieving document content: {e}")
        return jsonify({"error": "Failed to retrieve document content"}), 500

@documents_bp.route('/api/documents', methods=['POST'])
async def create_document():
    """Create a new document with vector embedding."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Generate vector embedding for the document
        text_content = f"{data.get('title', '')} {data.get('summary', '')} {data.get('thesis', '')} {data.get('extracted_text', '')}"
        vector_embedding = await generate_vector_embedding(text_content)

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    INSERT INTO user_documents (
                        user_id, title, author, journal_publisher,
                        publication_year, page_length, thesis, issue,
                        summary, category, field, hashtags,
                        influenced_by, file_path, file_type, extracted_text,
                        content_vector
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
                    data.get('extracted_text'),
                    vector_embedding
                )
                return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/api/documents/<int:doc_id>', methods=['PUT'])
async def update_document(doc_id):
    """Update a document and its vector embedding."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Update vector embedding if text content changed
        text_content = f"{data.get('title', '')} {data.get('summary', '')} {data.get('thesis', '')} {data.get('extracted_text', '')}"
        vector_embedding = await generate_vector_embedding(text_content)

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
                        content_vector = $13,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $14 AND user_id = $15
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
                    vector_embedding,
                    doc_id,
                    int(user_id)
                )
                if not row:
                    return jsonify({'error': 'Document not found'}), 404
                return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error updating document {doc_id}: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/api/documents/search', methods=['GET'])
async def search_documents():
    """Search documents using vector similarity."""
    try:
        query = request.args.get('q')
        user_id = request.args.get('user_id')
        if not query or not user_id:
            return jsonify({"error": "Query and user ID are required"}), 400

        # Generate vector for search query
        query_vector = await generate_vector_embedding(query)

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Search using vector similarity
                rows = await conn.fetch("""
                    SELECT 
                        id, title, author, summary, category,
                        file_path, created_at,
                        content_vector <=> $1 as similarity,
                        ts_rank(
                            to_tsvector('english', 
                                COALESCE(title, '') || ' ' || 
                                COALESCE(summary, '') || ' ' || 
                                COALESCE(thesis, '') || ' ' || 
                                COALESCE(extracted_text, '')
                            ),
                            plainto_tsquery('english', $2)
                        ) as text_rank
                    FROM user_documents 
                    WHERE user_id = $3
                    ORDER BY similarity ASC, text_rank DESC
                    LIMIT 10
                """, query_vector, query, int(user_id))
                
                results = []
                for row in rows:
                    excerpt = extract_matching_excerpt(
                        row.get('extracted_text', ''), 
                        query
                    )
                    result = dict(row)
                    result['excerpt'] = excerpt
                    results.append(result)
                
                return jsonify(results)
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return jsonify({"error": "Failed to search documents"}), 500

@documents_bp.route('/api/documents/<int:doc_id>', methods=['DELETE'])
async def delete_document(doc_id):
    """Delete a document and its storage content."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        async with get_db_pool() as pool:
            async with pool.acquire() as conn:
                # Get document URL before deletion
                row = await conn.fetchrow("""
                    SELECT file_path FROM user_documents 
                    WHERE id = $1 AND user_id = $2
                """, doc_id, int(user_id))
                
                if not row:
                    return jsonify({"error": "Document not found"}), 404
                
                document_url = row['file_path']
                
                # Delete from database
                await conn.execute("""
                    DELETE FROM user_documents 
                    WHERE id = $1 AND user_id = $2
                """, doc_id, int(user_id))
                
                # Delete from storage
                if document_url:
                    success = await storage_manager.delete_file(document_url)
                    if not success:
                        logger.warning(f"Failed to delete document from storage: {document_url}")
                
                return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        return jsonify({"error": "Failed to delete document"}), 500

async def generate_vector_embedding(text: str) -> list:
    """Generate vector embedding for text using OpenAI's API."""
    try:
        # This is a placeholder - implement actual vector generation
        # For example, using OpenAI's text-embedding-ada-002 model
        return [0.0] * 1536  # OpenAI embeddings are 1536-dimensional
    except Exception as e:
        logger.error(f"Error generating vector embedding: {e}")
        return [0.0] * 1536  # Return zero vector on error

def extract_matching_excerpt(text: str, query: str, context_chars: int = 150) -> str:
    """Extract an excerpt around the query match."""
    if not text or not query:
        return ""
    query_lower = query.lower()
    text_lower = text.lower()
    pos = text_lower.find(query_lower)
    if pos == -1:
        return text[:300] + "..."
    start = max(0, pos - context_chars)
    end = min(len(text), pos + len(query) + context_chars)
    excerpt = text[start:end]
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(text):
        excerpt = excerpt + "..."
    return excerpt
