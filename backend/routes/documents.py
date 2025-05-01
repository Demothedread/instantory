import os
import logging
import asyncio
import json
from io import BytesIO
from quart import Blueprint, request, jsonify, send_file
from backend.config.database import get_vector_pool, get_metadata_pool
from backend.config.storage import storage_service
# Import necessary storage modules, but don't reference specific exports
from backend.services.storage import vercel_blob as vercel_module
from backend.services.storage import s3 as s3_module
from openai import AsyncOpenAI

# Initialize OpenAI client for vector embeddings
openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
documents_bp = Blueprint('documents', __name__)
  
def client_fn(self):
    # Logic for the client function
    pass
def create_client(self):
    # Logic for the create_client function
    pass

# Unified storage service interface
class StorageService:
    def __init__(self):
        self.backend = os.getenv('STORAGE_BACKEND', 'generic').lower()
        if self.backend == 's3':
            import boto3
            from botocore.exceptions import BotoCoreError, ClientError
            self.boto3 = boto3
            self.BotoCoreError = BotoCoreError
            self.ClientError = ClientError
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
            )
            self.bucket_name = os.getenv('S3_BUCKET_NAME')
        elif self.backend == 'vercel':
            self.vercel_blob = vercel_module
            self.vercel_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        elif self.backend == 'generic':
            # Fallback implementation; extend as needed.
            pass
        else:
            raise ValueError("Unsupported STORAGE_BACKEND specified.")

    async def get_document(self, document_url: str) -> bytes:
        if self.backend == 's3':
            return await self._get_document_s3(document_url)
        elif self.backend == 'vercel':
            return await self._get_document_vercel(document_url)
        elif self.backend == 'generic':
            return await self._get_document_generic(document_url)

    async def delete_document(self, document_url: str) -> bool:
        if self.backend == 's3':
            return await self._delete_document_s3(document_url)
        elif self.backend == 'vercel':
            return await self._delete_document_vercel(document_url)
        elif self.backend == 'generic':
            return await self._delete_document_generic(document_url)

    # --- S3 Methods ---
    async def _get_document_s3(self, document_url: str) -> bytes:
        try:
            bucket, key = self._parse_s3_url(document_url)
            response = await asyncio.to_thread(
                self.s3_client.get_object, Bucket=bucket, Key=key
            )
            return await asyncio.to_thread(response['Body'].read)
        except (self.BotoCoreError, self.ClientError) as e:
            logger.error(f"Error fetching document from S3: {e}")
            return None

    async def _delete_document_s3(self, document_url: str) -> bool:
        try:
            bucket, key = self._parse_s3_url(document_url)
            await asyncio.to_thread(
                self.s3_client.delete_object, Bucket=bucket, Key=key
            )
            return True
        except (self.BotoCoreError, self.ClientError) as e:
            logger.error(f"Error deleting document from S3: {e}")
            return False

    def _parse_s3_url(self, url: str):
        # Assumes URL in format: s3://bucket/key
        parts = url.replace("s3://", "").split("/", 1)
        return parts[0], parts[1]
   

    # --- Vercel Blob Methods ---
    async def _get_document_vercel(self, document_url: str) -> bytes:
        """Get document from Vercel Blob Storage using available API."""
        try:
            # Implement with flexibility to handle different vercel_blob implementations
            vercel_api = self.vercel_blob
            
            # Try different possible API patterns based on what's available in the module
            if hasattr(vercel_api, 'get_blob'):
                # Try direct function approach first
                blob_data = await asyncio.to_thread(
                    vercel_api.get_blob,
                    token=self.vercel_token,
                    url=document_url
                )
                return blob_data

            elif hasattr(vercel_api, 'get'):
                # Try direct get method
                blob_data = await asyncio.to_thread(
                    vercel_api.get,
                    url=document_url,
                    token=self.vercel_token
                )
                return blob_data

            else:
                # Fall back to client pattern if available
                client_fn = getattr(vercel_api, 'create_client', None)
                logger.debug(f"create_client = {client_fn}, type = {type(client_fn)}")
                # Check if client_fn exists AND is callable
                if client_fn and callable(client_fn):
                    client = client_fn(self.vercel_token)
                    if hasattr(client, 'get') and callable(client.get):
                        response = await asyncio.to_thread(client.get, document_url)
                        # Attempt to extract content based on common response attributes
                        if hasattr(response, 'body'):
                            return response.body
                        elif hasattr(response, 'content'):
                            return response.content
                        else:
                            # Assume the response itself might be the content if no specific attribute found
                            logger.warning("Response object from client.get has no 'body' or 'content', returning response directly.")
                            return response
                    else:
                        # Log if the created client object doesn't have a usable 'get' method
                        logger.error("Client object created via 'create_client' does not have a callable 'get' method.")
                        return None # Cannot proceed without a get method
                else:
                    # Log if 'create_client' attribute exists but is not callable
                    logger.error("Attribute 'create_client' in vercel_blob module is not a callable function.")
                    return None

            # This part might be unreachable if the logic above covers all cases, but kept for safety.
            logger.error("Fell through all checks: No compatible API method found in vercel_blob module for getting document.")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching document from Vercel Blob: {e}")
            logger.debug(f"URL: {document_url}, Error details: {str(e)}")
            return None

    async def _delete_document_vercel(self, document_url: str) -> bool:
        """Delete document from Vercel Blob Storage using available API."""
        try:
            # Implement with flexibility to handle different vercel_blob implementations
            vercel_api = self.vercel_blob
            
            # Try different possible API patterns based on what's available in the module
            if hasattr(vercel_api, 'delete_blob'):
                # Try direct function approach first
                await asyncio.to_thread(
                    vercel_api.delete_blob,
                    token=self.vercel_token,
                    url=document_url
                )
                return True
            elif hasattr(vercel_api, 'delete'):
                # Try direct delete method
                await asyncio.to_thread(
                    vercel_api.delete,
                    url=document_url,
                    token=self.vercel_token
                )
                return True
            else:
                # Fall back to client pattern
                client_fn = getattr(vercel_api, 'create_client', None)
                if client_fn:
                    client = client_fn(self.vercel_token)
                    await asyncio.to_thread(client.delete, document_url)
                    return True
            
            # If we can't figure it out, log an error
            logger.error("No compatible delete method found in vercel_blob module")
            return False
            
        except Exception as e:
            logger.error(f"Error deleting document from Vercel Blob: {e}")
            logger.debug(f"URL: {document_url}, Error details: {str(e)}")
            return False

    # --- Generic Storage Methods ---
    async def _get_document_generic(self, document_url: str) -> bytes:
        # Implement your generic storage access here.
        logger.info("Generic storage: get_document not implemented")
        return None

    async def _delete_document_generic(self, document_url: str) -> bool:
        logger.info("Generic storage: delete_document not implemented")
        return False

# Initialize storage service
storage_service = StorageService()

# --- Routes ---

@documents_bp.route('/api/documents', methods=['GET'])
async def get_documents():
    """Get all documents for the current user."""
    try:
        async with get_metadata_pool() as pool:
            async with pool.acquire() as conn:
                # Assume auth middleware sets request.user_id or use header fallback.
                user_id = getattr(request, 'user_id', request.headers.get('X-User-ID'))
                if not user_id:
                    return jsonify({"error": "User ID is required"}), 400
                rows = await conn.fetch("""""
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

        # Retrieve document regardless of backend (URL format is validated in the service)
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

@documents_bp.route('/api/documents/search', methods=['GET'])
async def get_search_documents():
    """Search documents using vector similarity."""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"error": "No search query provided"}), 400

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
                
                try:
                    # Try querying with vector similarity (<=> is the cosine distance operator)
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
                                SELECT id, title, author, summary, category, file_path, created_at
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
                            
                except Exception as vector_error:
                    # Fallback to regular search if vector search fails
                    logger.warning(f"Vector search failed, falling back to text search: {vector_error}")
                    return jsonify({"error": "Vector search unavailable"}), 500
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return jsonify({"error": "Failed to search documents"}), 500

@documents_bp.route('/api/documents/<int:doc_id>', methods=['DELETE'])
async def delete_document(doc_id):
    """Delete a document and its storage content."""
    try:
        # First, get document details from metadata DB
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

                # Delete from storage if supported
                if document_url:
                    deleted = await storage_service.delete_document(document_url)
                    if not deleted:
                        logger.warning(f"Failed to delete document from storage: {document_url}")

                return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        return jsonify({"error": "Failed to delete document"}), 500

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
            
            # Search by vector similarity in vector database
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
                        # Get matching documents from metadata database
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
                return jsonify({'results': results})
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
