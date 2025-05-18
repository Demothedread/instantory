"""Document routes and storage logic for document management."""

import os
import logging
import asyncio
from io import BytesIO
from quart import Blueprint, request, jsonify, send_file
from openai import AsyncOpenAI
from asyncpg import PostgresError
from backend.config.database import get_vector_pool, get_metadata_pool
from backend.config.storage import storage_service
from backend.services.storage import vercel_blob

# Initialize OpenAI client for vector embeddings
openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/api/documents', methods=['GET'])
async def get_documents():
    """Get all documents for a user."""
    try:
        async with get_metadata_pool() as pool:
            async with pool.acquire() as conn:
                # Get user_id from request or headers
                user_id = getattr(request, 'user_id', request.headers.get('X-User-ID'))
                if not user_id:
                    return jsonify({"error": "User ID is required"}), 400
                rows = await conn.fetch(
                    """
                    SELECT id, title, author, journal_publisher, publication_year,
                    page_length, thesis, issue, summary, category, field,
                    hashtags, influenced_by, file_path, file_type, created_at
                    FROM user_documents
                    WHERE user_id = $1 
                    ORDER BY created_at DESC
                    """,
                    int(user_id)
                )
                return jsonify([dict(row) for row in rows])
    except PostgresError as e:
        logger.error("Error fetching documents: %s", e)
        return jsonify({"error": "Failed to fetch documents"}), 500
    except Exception as e:
        logger.error("Unexpected error fetching documents: %s", e)
        return jsonify({"error": "Failed to fetch documents"}), 500

@documents_bp.route('/api/documents/content', methods=['GET'])
async def get_document_content():
    """Get document content from storage."""
    try:
        document_url = request.args.get('url')
        if not document_url:
            return jsonify({"error": "URL parameter is required"}), 400

        # Retrieve document content
        content = await storage_service.get_document(document_url)
        if not content:
            return jsonify({"error": "Document not found"}), 404

        # Prepare file in-memory
        file_obj = BytesIO(content)

        # Determine content type based on file extension
        content_type = 'application/octet-stream'
        if document_url.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif document_url.lower().endswith(('.doc', '.docx')):
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
    """Create a new document."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_metadata_pool() as pool:
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

@documents_bp.route('/api/documents/<int:doc_id>', methods=['PUT'])
async def update_document(doc_id):
    """Update a document."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_metadata_pool() as pool:
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
                    int(user_id)
                )
                if not row:
                    return jsonify({'error': 'Document not found'}), 404
                return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error updating document {doc_id}: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/api/documents/<int:doc_id>', methods=['DELETE'])
async def delete_document(doc_id):
    """Delete a document and its storage content."""
    try:
        async with get_metadata_pool() as pool:
            async with pool.acquire() as conn:
                user_id = getattr(request, 'user_id', request.headers.get('X-User-ID'))
                if not user_id:
                    return jsonify({"error": "User ID is required"}), 400

                # Get document URL before deletion
                row = await conn.fetchrow("""
                    SELECT file_path FROM user_documents 
                    WHERE id = $1 AND user_id = $2
                """, doc_id, int(user_id))
                if not row:
                    return jsonify({"error": "Document not found"}), 404

                document_url = row['file_path']

                # Delete record from database
                await conn.execute("""
                    DELETE FROM user_documents 
                    WHERE id = $1 AND user_id = $2
                """, doc_id, int(user_id))

                # Delete from storage if URL exists
                if document_url:
                    await storage_service.delete_document(document_url)

                return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        return jsonify({"error": "Failed to delete document"}), 500

@documents_bp.route('/api/documents/search', methods=['GET'])
async def get_search_documents():
    """Search documents using vector similarity."""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"results": [], "message": "No search query provided"}), 200

        # Generate vector embedding for the query
        try:
            response = await openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=query
            )
            query_vector = response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating query embedding: {e}")
            return jsonify({"error": "Failed to process query"}), 500

        # Search in vector database for similar documents
        async with get_vector_pool() as pool:
            async with pool.acquire() as conn:
                user_id = getattr(request, 'user_id', request.headers.get('X-User-ID'))
                if not user_id:
                    return jsonify({"error": "User ID is required"}), 400

                rows = await conn.fetch("""
                    SELECT document_id, 1 - (content_vector <=> $1) as similarity
                    FROM document_vectors 
                    WHERE 1 - (content_vector <=> $1) > 0.7
                    ORDER BY similarity DESC
                    LIMIT 10
                """, query_vector)

                # Get metadata for the matching documents
                document_ids = [row['document_id'] for row in rows]
                if not document_ids:
                    return jsonify({"results": [], "message": "No similar documents found"}), 200

                # Get document details from metadata database
                async with get_metadata_pool() as metadata_pool:
                    async with metadata_pool.acquire() as metadata_conn:
                        doc_rows = await metadata_conn.fetch("""
                            SELECT id, title, author, summary, category, field, file_path, created_at
                            FROM user_documents 
                            WHERE id = ANY($1) AND user_id = $2
                        """, document_ids, int(user_id))

                        # Combine with similarity scores
                        results = []
                        for doc in doc_rows:
                            doc_dict = dict(doc)
                            # Find matching similarity
                            for row in rows:
                                if row['document_id'] == doc_dict['id']:
                                    doc_dict['similarity'] = row['similarity']
                                    break
                            results.append(doc_dict)

                        return jsonify({"results": results})
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return jsonify({"error": "Failed to search documents"}), 500

@documents_bp.route('/api/documents/search', methods=['POST'])
async def search_documents():
    """Search documents by content or metadata."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        query = data.get('query', '').strip()
        field = data.get('field', 'all')  # options: 'all', 'content', 'metadata'

        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        # Try vector search first
        try:
            # Generate embedding for the query
            response = await openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=query
            )
            query_vector = response.data[0].embedding

            # Search by vector similarity
            async with get_vector_pool() as pool:
                async with pool.acquire() as conn:
                    rows = await conn.fetch("""
                        SELECT document_id, 1 - (content_vector <=> $1) as similarity
                        FROM document_vectors 
                        WHERE 1 - (content_vector <=> $1) > 0.6
                        ORDER BY similarity DESC
                        LIMIT 20
                    """, query_vector)
                    
                    if rows:
                        document_ids = [row['document_id'] for row in rows]
                        
                        async with get_metadata_pool() as metadata_pool:
                            async with metadata_pool.acquire() as metadata_conn:
                                # Get full document details
                                doc_rows = await metadata_conn.fetch("""
                                    SELECT id, title, author, summary, category, extracted_text
                                    FROM user_documents 
                                    WHERE id = ANY($1) AND user_id = $2
                                """, document_ids, int(user_id))

                                # Combine results with similarity scores and excerpts
                                results = []
                                for doc in doc_rows:
                                    doc_dict = dict(doc)
                                    doc_dict['excerpt'] = extract_matching_excerpt(doc_dict.get('extracted_text', ''), query)
                                    # Find matching similarity score
                                    for row in rows:
                                        if row['document_id'] == doc_dict['id']:
                                            doc_dict['similarity'] = row['similarity']
                                            break
                                    results.append(doc_dict)

                                return jsonify({'results': results, 'search_type': 'vector'})
        except Exception as vector_error:
            logger.warning(f"Vector search failed, falling back to text search: {vector_error}")
            # Fall through to text search below

        # Fallback to traditional text search
        async with get_metadata_pool() as pool:
            async with pool.acquire() as conn:
                where_clause = "user_id = $1"
                params = [int(user_id)]
                
                if field == 'content':
                    where_clause += " AND extracted_text ILIKE $2"
                elif field == 'metadata':
                    where_clause += " AND (title ILIKE $2 OR author ILIKE $2 OR summary ILIKE $2 OR thesis ILIKE $2 OR hashtags ILIKE $2)"
                else:  # 'all'
                    where_clause += " AND (title ILIKE $2 OR author ILIKE $2 OR summary ILIKE $2 OR thesis ILIKE $2 OR hashtags ILIKE $2 OR extracted_text ILIKE $2)"
                
                params.append(f"%{query}%")
                
                sql = f"""
                    SELECT id, title, author, summary, extracted_text, created_at
                    FROM user_documents
                    WHERE {where_clause}
                    ORDER BY created_at DESC
                    LIMIT 100
                """
                
                rows = await conn.fetch(sql, *params)
                
                results = []
                for row in rows:
                    excerpt = extract_matching_excerpt(row['extracted_text'], query)
                    results.append({
                        'id': row['id'],
                        'title': row['title'],
                        'author': row['author'],
                        'summary': row['summary'],
                        'excerpt': excerpt
                    })
                    
                return jsonify({'results': results, 'search_type': 'text'})
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return jsonify({'error': str(e)}), 500

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
