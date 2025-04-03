import os
import logging
import asyncio
# Removed unused global import of boto3
from io import BytesIO
from pathlib import Path

from quart import Blueprint, request, jsonify, send_file

from .cleanup import get_metadata_pool, get_vector_pool
# Import all potential storage modules upfront
try:
    from .services.storage import vercel_blob
except ImportError:
    vercel_blob = None

logger = logging.getLogger(__name__)

# Create blueprints for document and inventory routes
documents_bp = Blueprint('documents', __name__)
inventory_bp = Blueprint('inventory', __name__)

class StorageService:
    """
    Provides a unified interface to different storage backends (S3, Vercel, Generic).
    Chooses the backend based on the STORAGE_BACKEND environment variable.
    """
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
            # Check if vercel_blob module was successfully imported
            if vercel_blob is None:
                logger.error("vercel_blob module not found; ensure it is installed or the file is present.")
                raise ImportError("vercel_blob module not found")
            self.vercel_blob = vercel_blob
            self.vercel_token = os.getenv('VERCEL_BLOB_READ_WRITE_TOKEN')

        elif self.backend == 'generic':
            # Placeholder for generic storage (e.g., local filesystem)
            pass
        else:
            raise ValueError("Unsupported STORAGE_BACKEND specified.")

    async def get_document(self, document_url: str) -> bytes:
        """Retrieve a document's raw bytes from the configured backend."""
        if self.backend == 's3':
            return await self._get_document_s3(document_url)
        elif self.backend == 'vercel':
            return await self._get_document_vercel(document_url)
        elif self.backend == 'generic':
            return await self._get_document_generic(document_url)

    async def delete_document(self, document_url: str) -> bool:
        """Delete a document from the configured backend."""
        if self.backend == 's3':
            return await self._delete_document_s3(document_url)
        elif self.backend == 'vercel':
            return await self._delete_document_vercel(document_url)
        elif self.backend == 'generic':
            return await self._delete_document_generic(document_url)

    # --- S3 Methods ---
    async def _get_document_s3(self, document_url: str) -> bytes:
        """Retrieve a document from S3."""
        try:
            bucket, key = self._parse_s3_url(document_url)
            response = await asyncio.to_thread(
                self.s3_client.get_object,
                Bucket=bucket,
                Key=key
            )
            return await asyncio.to_thread(response['Body'].read)
        except (self.BotoCoreError, self.ClientError) as e:
            logger.error(f"S3 fetch error: {e}")
            return None

    async def _delete_document_s3(self, document_url: str) -> bool:
        """Delete a document from S3."""
        try:
            bucket, key = self._parse_s3_url(document_url)
            await asyncio.to_thread(
                self.s3_client.delete_object,
                Bucket=bucket,
                Key=key
            )
            return True
        except (self.BotoCoreError, self.ClientError) as e:
            logger.error("S3 delete error: %s", e)
            return False

    def _parse_s3_url(self, url: str):
        """Extract bucket and key from an S3 URL."""
        parts = url.replace("s3://", "").split("/", 1)
        if len(parts) != 2:
            raise ValueError("Invalid S3 URL format")
        return parts[0], parts[1]

    # --- Vercel Blob Methods ---
    async def _get_document_vercel(self, document_url: str) -> Optional[bytes]:
        """Retrieve a document from Vercel Blob."""
        try:
            blob = self.vercel_blob.Blob(self.vercel_token, filename=document_url, content_type='application/octet-stream')
            response = await asyncio.to_thread(blob.get, document_url)
            return response.content
        except AttributeError as e:
            logger.error(f"Attribute error while fetching document from Vercel Blob: {e}, URL: {document_url}")
        except ConnectionError as e:
            logger.error(f"Connection error while fetching document from Vercel Blob: {e}, URL: {document_url}")
        except Exception as e:
            logger.error("Unexpected error while fetching document from Vercel Blob: %s, URL: %s", e, document_url)
        return None

    async def _delete_document_vercel(self, document_url: str) -> bool:
        """Delete a document from Vercel Blob."""
        try:
            blob = self.vercel_blob.Blob(
                self.vercel_token,
                filename=document_url,
                content_type='application/octet-stream'
            ) 
            await asyncio.to_thread(Blob.delete, document_url)
            return True
        except Exception as e:
            logger.error(f"Vercel Blob delete error: {e}")
            return False

    # --- Generic Storage Methods ---
    async def _get_document_generic(self, document_url: str) -> bytes:
        """Retrieve a document from a generic/local storage (placeholder)."""
        logger.info(f"Generic storage: get_document not implemented for URL: {document_url}")
        return None

    async def _delete_document_generic(self, document_url: str) -> bool:
        """Delete a document from a generic/local storage (placeholder)."""
        logger.info("Generic storage: delete_document not implemented")
        return False


# Instantiate a single global StorageService for all routes
storage_service = StorageService()

# --- Helper Functions for Document Processing ---

async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF bytes.
    Replace this placeholder with a proper PDF extraction library (e.g., pdfminer.six or PyMuPDF).
    """
    return pdf_bytes.decode('latin1', errors='ignore')

async def get_summary_and_metadata(text: str) -> dict:
    """
    Call an AI service (e.g., OpenAI API) to generate a summary and extract metadata.
    Placeholder implementation – replace with an actual API call.
    """
    await asyncio.sleep(1)
    return {
        "summary": f"Summary (first 100 chars): {text[:100]}...",
        "metadata": {"word_count": len(text.split()), "sample_info": "example"}
    }

async def compute_embedding(text: str) -> list:
    """
    Compute a vector embedding for the text.
    Returns a dummy 768-dimensional vector; replace with your actual embedding logic.
    """
    await asyncio.sleep(0.5)
    return [0.0] * 768

async def get_query_vector(query: str) -> list:
    """
    Generate a vector for the search query.
    Dummy implementation returning a 300-dimensional vector.
    """
    await asyncio.sleep(0.1)
    return [0.0] * 300

async def process_document(doc_id: int, file_path: str):
    """
    Background task to process a document:
        - Retrieve the file from storage.
        - Extract text from the PDF.
        - Generate a summary and metadata via an AI service.
        - Compute a vector embedding.
        - Update the PostgreSQL record with the processed data.
    """
    logger.info(f"Processing document {doc_id} from {file_path}")
    content = await storage_service.get_document(file_path)
    if not content:
        logger.error(f"Failed to retrieve document for doc_id {doc_id}")
        return

    text = await extract_text_from_pdf(content)
    results = await get_summary_and_metadata(text)
    summary = results.get('summary', '')
    metadata = results.get('metadata', {})
    embedding = await compute_embedding(text)

    try:
        async with get_vector_pool() as pool:
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    UPDATE user_documents
                    SET summary = $1,
                        metadata = $2,
                        content_vector = $3
                    WHERE id = $4
                    """,
                    summary,
                    metadata,
                    embedding,
                    doc_id
                )
        logger.info(f"Document {doc_id} processed and updated.")
    except Exception as e:
        logger.error(f"Error updating document {doc_id}: {e}")

# --- Document Routes ---

@documents_bp.route('/api/documents', methods=['GET'])
async def get_documents():
    """Retrieve all documents for the current user."""
    try:
        async with get_vector_pool() as pool:
            async with pool.acquire() as conn:
                user_id = getattr(request, 'user_id', request.args.get('user_id'))
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
    except Exception as e:
        logger.error(f"Error fetching documents: {e}")
        return jsonify({"error": "Failed to fetch documents"}), 500

@documents_bp.route('/api/documents/content', methods=['GET'])
async def get_document_content():
    """Retrieve document content from storage."""
    try:
        document_url = request.args.get('url')
        if not document_url:
            return jsonify({"error": "No document URL provided"}), 400

        content = await storage_service.get_document(document_url)
        if not content:
            return jsonify({"error": "Document not found"}), 404

        file_obj = BytesIO(content)
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
            attachment_filename=Path(document_url).name
        )
    except Exception as e:
        logger.error(f"Error retrieving document content: {e}")
        return jsonify({"error": "Failed to retrieve document content"}), 500

@documents_bp.route('/api/documents', methods=['POST'])
async def create_document():
    """Create a new document record and initiate background processing."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_vector_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    INSERT INTO user_documents (
                        user_id, title, author, journal_publisher,
                        publication_year, page_length, thesis, issue,
                        summary, category, field, hashtags,
                        influenced_by, file_path, file_type, extracted_text
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8,
                        '', $9, $10, $11,
                        $12, $13, $14, ''
                    )
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
                    data.get('category'),
                    data.get('field'),
                    data.get('hashtags'),
                    data.get('influenced_by'),
                    data.get('file_path'),
                    data.get('file_type')
                )
                doc_id = row["id"]

        # Trigger background processing for the document
        asyncio.create_task(process_document(doc_id, row.get('file_path')))
        return jsonify(dict(row))
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/api/documents/<int:doc_id>', methods=['PUT'])
async def update_document(doc_id):
    """Update an existing document."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_metadata_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    UPDATE user_documents
                    SET title = $1,
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
    """Delete a document and its associated storage file."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        async with get_vector_pool() as pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    DELETE FROM user_documents
                    WHERE id = $1 AND user_id = $2
                    RETURNING id, file_path
                    """,
                    doc_id,
                    int(user_id)
                )
                if not row:
                    return jsonify({'error': 'Document not found'}), 404

                # File deletion can be handled asynchronously (e.g., via a cleanup task)
                return jsonify({'message': 'Document deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting document {doc_id}: {e}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/api/documents/search', methods=['POST'])
async def search_documents():
    """Search documents by content or metadata."""
    try:
        data = await request.get_json()
        user_id = data.get('user_id')
        query = data.get('query', '').strip()
        field = data.get('field', 'all')  # options: all, content, or metadata

        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        async with get_vector_pool() & get_metadata_pool as pool:
            async with pool.acquire() as conn:
                where_clause = "user_id = $1"
                params = [int(user_id)]

                if field == 'content':
                    where_clause += " AND extracted_text ILIKE $2"
                elif field == 'metadata':
                    where_clause += """
                        AND (
                            title ILIKE $2
                            OR author ILIKE $2
                            OR summary ILIKE $2
                            OR thesis ILIKE $2
                            OR hashtags ILIKE $2
                        )
                    """
                else:
                    where_clause += """
                        AND (
                            title ILIKE $2
                            OR author ILIKE $2
                            OR summary ILIKE $2
                            OR thesis ILIKE $2
                            OR hashtags ILIKE $2
                            OR extracted_text ILIKE $2
                        )
                    """

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
    """
    Extract an excerpt from text containing the search query.
    Returns a snippet of ~context_chars around the first occurrence of the query.
    """
    if not text or not query:
        return ""
    query_pos = text.lower().find(query.lower())
    if query_pos == -1:
        # No match found, return the first 300 chars as a fallback
        return text[:300] + "..."

    start = max(0, query_pos - context_chars)
    end = min(len(text), query_pos + len(query) + context_chars)
    excerpt = text[start:end]

    if start > 0:
        excerpt = "..." + excerpt
    if end < len(text):
        excerpt = excerpt + "..."
    return excerpt
