"""Unified storage manager for handling file operations across different providers."""

import io
import logging
import os
from pathlib import Path
from typing import BinaryIO, Optional, Tuple, Union

from PIL import Image

# Import with fallbacks to handle different execution contexts
try:
    # Try relative imports first
    from backend.config.database import get_metadata_pool, get_vector_pool

    from ...config.storage import StorageType, storage_config
    from ...services.vector.qdrant_service import get_qdrant_service
    from .s3 import s3_service
    from .vercel_blob import vercel_blob_service
except ImportError:
    # Alternative import path for when running as a module
    try:
        from backend.config.database import get_metadata_pool, get_vector_pool
        from backend.config.storage import StorageType, storage_config
        from backend.services.storage.s3 import s3_service
        from backend.services.storage.vercel_blob import vercel_blob_service
        from backend.services.vector.qdrant_service import get_qdrant_service
    except ImportError:
        # Fallback to app context imports
        import logging
        import os

        from quart import current_app

        logger = logging.getLogger(__name__)

        # Stubs for services if imports fail
        class StubService:
            async def upload_document(self, *args, **kwargs):
                logger.error("Storage service not available")
                return None

            async def get_document(self, *args, **kwargs):
                logger.error("Storage service not available")
                return None

            async def delete_document(self, *args, **kwargs):
                logger.error("Storage service not available")
                return False

        s3_service = StubService()
        vercel_blob_service = StubService()

        # Qdrant service stub
        def get_qdrant_service():
            """Stub for qdrant service when not available"""

            class QdrantStub:
                async def search_similar(self, *args, **kwargs):
                    logger.warning(
                        "Qdrant service not available, skipping vector search"
                    )
                    return []

            return QdrantStub()

        # Storage config stub
        class StorageConfig:
            def get_temp_dir(self):
                return os.path.join(os.getcwd(), "data", "temp")

            def cleanup_temp_files(self, user_id=None):
                pass

        StorageType = type(
            "StorageType", (), {"S3": "s3", "VERCEL": "vercel", "LOCAL": "local"}
        )
        storage_config = StorageConfig()

        # Database connection stubs
        async def get_vector_pool():
            if hasattr(current_app, "db") and hasattr(current_app.db, "vector_pool"):
                return current_app.db.vector_pool
            raise RuntimeError("Vector database connection not available")

        async def get_metadata_pool():
            if hasattr(current_app, "db") and hasattr(current_app.db, "pool"):
                return current_app.db.pool
            raise RuntimeError("Metadata database connection not available")


logger = logging.getLogger(__name__)


class StorageManager:
    """
    Unified storage manager that handles file operations across different storage providers.
    Supports local storage, S3, and Vercel Blob with automatic provider selection.
    """

    def __init__(self):
        self.config = storage_config
        self.s3 = s3_service
        self.vercel = vercel_blob_service
        self.max_thumbnail_size = (300, 300)  # Maximum thumbnail dimensions

        # Determine storage type from environment variable, default to Vercel
        # The storage_type is determined once in __init__:
        self.storage_type = os.getenv("STORAGE_TYPE", "vercel").lower()

    async def check_storage_health(self) -> dict:
        """
        Check the health of all storage providers.

        Returns:
            Dictionary with health status of each storage provider
        """
        health = {"status": "healthy", "providers": {}}

        # Check Vercel Blob
        try:
            if self.vercel.token:
                # Create a small test file
                test_data = b"storage health check"
                test_url = await self.vercel.upload_document(
                    test_data, "health_check.txt", "text/plain"
                )

                if test_url:
                    # Try to read it back
                    content = await self.vercel.get_document(test_url)
                    if content == test_data:
                        health["providers"]["vercel"] = {"status": "healthy"}
                    else:
                        health["providers"]["vercel"] = {
                            "status": "degraded",
                            "details": "Content mismatch in read test",
                        }
                        health["status"] = "degraded"
                else:
                    health["providers"]["vercel"] = {
                        "status": "unhealthy",
                        "details": "Failed to upload test file",
                    }
                    health["status"] = "degraded"
            else:
                health["providers"]["vercel"] = {
                    "status": "unavailable",
                    "details": "API token not configured",
                }
        except Exception as e:
            health["providers"]["vercel"] = {"status": "unhealthy", "details": str(e)}
            health["status"] = "degraded"

        # Check S3
        try:
            if self.s3 and hasattr(self.s3, "check_health"):
                s3_health = await self.s3.check_health()
                health["providers"]["s3"] = s3_health
                if s3_health["status"] != "healthy" and self.storage_type == "s3":
                    health["status"] = "degraded"
            else:
                health["providers"]["s3"] = {"status": "not_configured"}
        except Exception as e:
            health["providers"]["s3"] = {"status": "unhealthy", "details": str(e)}
            if self.storage_type == "s3":
                health["status"] = "degraded"

        # Check local storage
        try:
            temp_dir = self.config.get_temp_dir()
            if temp_dir.exists() and os.access(temp_dir, os.W_OK):
                health["providers"]["local"] = {"status": "healthy"}
            else:
                health["providers"]["local"] = {
                    "status": "unhealthy",
                    "details": "Temp directory not accessible",
                }
                if self.storage_type == "local":
                    health["status"] = "degraded"
        except Exception as e:
            health["providers"]["local"] = {"status": "unhealthy", "details": str(e)}
            if self.storage_type == "local":
                health["status"] = "degraded"

        return health

    async def store_file(
        self,
        user_id: int,
        file_data: Union[bytes, BinaryIO],
        filename: str,
        content_type: str,
        is_temporary: bool = False,
    ) -> str:
        """
        Store a file using the appropriate storage provider.

        Args:
            user_id: The ID of the user who owns the file
            file_data: The file content as bytes or file-like object
            filename: Original filename
            content_type: MIME type of the file
            is_temporary: Whether this is a temporary storage

        Returns:
            URL or path where the file is stored
        """
        try:
            if is_temporary:
                # Store in temp directory
                temp_path = self.config.get_temp_dir() / str(user_id) / filename
                temp_path.parent.mkdir(parents=True, exist_ok=True)

                if isinstance(file_data, bytes):
                    temp_path.write_bytes(file_data)
                else:
                    with open(temp_path, "wb") as f:
                        f.write(file_data.read())

                return str(temp_path)

            # Determine storage type and process accordingly
            if content_type.startswith("image/"):
                # Process and store image with thumbnail
                original_url, thumbnail_url = await self.process_and_store_image(
                    user_id, file_data, filename, content_type
                )
                if not original_url:
                    raise ValueError("Failed to process and store image")
                return original_url

            elif content_type in [
                "application/pdf",
                "text/plain",
                "application/msword",
            ]:
                file_bytes = (
                    file_data if isinstance(file_data, bytes) else file_data.read()
                )
                # Select storage backend based on environment variable - prioritize Vercel
                if self.storage_type == "vercel":
                    document_url = await self.vercel.upload_document(
                        file_bytes, filename, content_type
                    )
                elif self.storage_type == "s3":
                    document_url = await self.s3.upload_document(
                        user_id, file_bytes, filename
                    )
                elif self.storage_type == "local":
                    # Store in local directory
                    local_dir = (
                        Path(self.config.get_temp_dir()) / "permanent" / str(user_id)
                    )
                    local_dir.mkdir(parents=True, exist_ok=True)
                    local_path = local_dir / filename
                    local_path.write_bytes(file_bytes)
                    document_url = str(local_path)
                else:
                    logger.error(f"Unknown storage type: {self.storage_type}")
                    raise ValueError("Invalid storage type")

                # Store document content for vector search
                if document_url:
                    try:
                        # Extract text content
                        text_content = await self._extract_text_content(
                            file_bytes, content_type
                        )

                        if text_content:
                            # Generate embedding
                            embedding = await self._generate_embedding(text_content)

                            if embedding:
                                # Store content and embedding in vector database
                                async with await get_vector_pool() as pool:
                                    async with pool.acquire() as conn:
                                        # Store text content
                                        await conn.execute(
                                            """
                                            INSERT INTO document_content (document_id, content)
                                            VALUES ($1, $2)
                                            """,
                                            document_url,
                                            text_content,
                                        )

                                        # Store vector embedding
                                        await conn.execute(
                                            """
                                            INSERT INTO document_vectors (
                                                document_id,
                                                content_vector,
                                                embedding_model
                                            ) VALUES ($1, $2, $3)
                                            """,
                                            document_url,
                                            embedding,
                                            "text-embedding-ada-002",
                                        )
                    except Exception as e:
                        logger.error(f"Error storing document content: {e}")
                        # Continue even if vector storage fails

                return document_url
            else:
                # Default to selected storage backend for unknown types - prioritize Vercel
                file_bytes = (
                    file_data if isinstance(file_data, bytes) else file_data.read()
                )
                if self.storage_type == "vercel":
                    return await self.vercel.upload_document(
                        file_bytes, filename, content_type
                    )
                elif self.storage_type == "s3":
                    return await self.s3.upload_document(user_id, file_bytes, filename)
                elif self.storage_type == "local":
                    local_dir = (
                        Path(self.config.get_temp_dir()) / "permanent" / str(user_id)
                    )
                    local_dir.mkdir(parents=True, exist_ok=True)
                    local_path = local_dir / filename
                    local_path.write_bytes(file_bytes)
                    return str(local_path)
                else:
                    logger.error(f"Unknown storage type: {self.storage_type}")
                    raise ValueError("Invalid storage type")

        except Exception as e:
            logger.error(f"Error storing file {filename}: {e}")
            raise

    async def get_file(self, file_url: str) -> Optional[bytes]:
        """
        Retrieve a file from any storage provider.

        Args:
            file_url: The URL or path of the file

        Returns:
            File content as bytes if found, None otherwise
        """
        try:
            if file_url.startswith("s3://"):
                return await self.s3.get_document(file_url)
            elif file_url.startswith("https://"):
                return await self.vercel.get_document(file_url)
            elif os.path.exists(file_url):
                return Path(file_url).read_bytes()
            else:
                logger.error(f"Unknown storage location: {file_url}")
                return None
        except Exception as e:
            logger.error(f"Error retrieving file {file_url}: {e}")
            return None

    async def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from any storage provider.

        Args:
            file_url: The URL or path of the file

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if file_url.startswith("s3://"):
                return await self.s3.delete_document(file_url)
            elif file_url.startswith("https://"):
                return await self.vercel.delete_document(file_url)
            elif os.path.exists(file_url):
                Path(file_url).unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_url}: {e}")
            return False

    async def move_to_permanent(
        self,
        temp_path: Union[str, Path],
        user_id: int,
        filename: str,
        content_type: str,
    ) -> Optional[str]:
        """
        Move a file from temporary to permanent storage.

        Args:
            temp_path: Path to the temporary file
            user_id: The ID of the user who owns the file
            filename: Original filename
            content_type: MIME type of the file

        Returns:
            New URL or path in permanent storage if successful, None otherwise
        """
        try:
            temp_path = Path(temp_path)
            if not temp_path.exists():
                logger.error(f"Temporary file not found: {temp_path}")
                return None

            # Read the temporary file
            file_data = temp_path.read_bytes()

            # Store in permanent location
            permanent_url = await self.store_file(
                user_id, file_data, filename, content_type, is_temporary=False
            )

            # Clean up temporary file
            temp_path.unlink()

            return permanent_url
        except Exception as e:
            logger.error(f"Error moving file to permanent storage: {e}")
            return None

    async def generate_thumbnail(
        self, image_data: bytes, filename: str
    ) -> Optional[bytes]:
        """
        Generate a thumbnail from image data.

        Args:
            image_data: Original image bytes
            filename: Original filename for determining format

        Returns:
            Thumbnail image bytes if successful, None otherwise
        """
        try:
            # Open image from bytes
            with Image.open(io.BytesIO(image_data)) as img:
                # Convert RGBA to RGB if needed
                if img.mode == "RGBA":
                    img = img.convert("RGB")

                # Generate thumbnail
                img.thumbnail(self.max_thumbnail_size, Image.Resampling.LANCZOS)

                # Save thumbnail to bytes
                output = io.BytesIO()
                img.save(output, format="JPEG", quality=85, optimize=True)
                return output.getvalue()

        except Exception as e:
            logger.error(f"Error generating thumbnail for {filename}: {e}")
            return None

    async def process_and_store_image(
        self,
        user_id: int,
        file_data: Union[bytes, BinaryIO],
        filename: str,
        content_type: str,
    ) -> Tuple[Optional[str], Optional[str]]:
        """Process and store an image with its thumbnail."""
        try:
            # Read file data if it's a file-like object
            if hasattr(file_data, "read"):
                file_data = file_data.read()

            # Generate thumbnail
            thumbnail_bytes = await self.generate_thumbnail(file_data, filename)

            # Upload original image
            original_url = await self.vercel.upload_document(
                file_data, filename, content_type
            )

            thumbnail_url = None
            if thumbnail_bytes:
                thumbnail_name = f"thumb_{filename}.jpg"
                thumbnail_url = await self.vercel.upload_document(
                    thumbnail_bytes, thumbnail_name, "image/jpeg"
                )

            # Update database with URLs
            from backend.config.database import get_metadata_pool

            async with (await get_metadata_pool()).acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO user_images (user_id, filename, original_url, thumbnail_url, content_type)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    user_id,
                    filename,
                    original_url,
                    thumbnail_url,
                    content_type,
                )

            return original_url, thumbnail_url

        except Exception as e:
            logger.error(f"Error processing image {filename}: {e}")
            return None, None

    async def _extract_text_content(
        self, file_bytes: bytes, content_type: str
    ) -> Optional[str]:
        """Extract text content from different file types."""
        try:
            if content_type == "text/plain":
                return file_bytes.decode("utf-8", errors="ignore")

            elif content_type == "application/pdf":
                # Use PyPDF2 or similar library
                from io import BytesIO

                import PyPDF2

                pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text

            elif content_type == "application/msword" or content_type.endswith(
                "wordprocessingml.document"
            ):
                # Use python-docx for Word documents
                from io import BytesIO

                import docx

                doc = docx.Document(BytesIO(file_bytes))
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                return text

            else:
                logger.warning(
                    f"Unsupported content type for text extraction: {content_type}"
                )
                return None

        except Exception as e:
            logger.error(f"Error extracting text content: {e}")
            return None

    async def _generate_embedding(self, text: str) -> Optional[list]:
        """
        Generate vector embedding for text using OpenAI API.

        Args:
            text: Text to generate embedding for

        Returns:
            Vector embedding if successful, None otherwise
        """
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = await client.embeddings.create(
                model="text-embedding-ada-002",
                input=text[:8000],  # Limit text length for API
            )
            return response.data[0].embedding

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None

    async def search_documents(
        self,
        user_id: int,
        query: str,
        match_threshold: float = 0.7,
        match_count: int = 10,
    ) -> list:
        """Search documents using vector similarity."""
        try:
            # Generate embedding for query
            query_embedding = await self._generate_embedding(query)
            if not query_embedding:
                return []

            # Search using Qdrant service
            qdrant_service = get_qdrant_service()

            if qdrant_service:
                results = await qdrant_service.search_similar(
                    query_vector=query_embedding,
                    user_id=user_id,
                    limit=match_count,
                    score_threshold=match_threshold,
                )
                return results

            # Fallback to database search
            from backend.config.database import get_metadata_pool

            async with (await get_metadata_pool()).acquire() as conn:
                documents = await conn.fetch(
                    """
                    SELECT id, title, content, file_url, similarity_score
                    FROM documents 
                    WHERE user_id = $1 
                    AND content ILIKE $2
                    ORDER BY similarity_score DESC
                    LIMIT $3
                    """,
                    user_id,
                    f"%{query}%",
                    match_count,
                )
                return [dict(doc) for doc in documents]

        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []

    def _extract_relevant_excerpt(
        self, content: str, query: str, context_chars: int = 150
    ) -> str:
        """Extract relevant excerpt from content based on query."""
        try:
            # Find query in content (case insensitive)
            query_pos = content.lower().find(query.lower())

            if query_pos == -1:
                # If exact query not found, return start of content
                return content[:300] + "..."

            # Get surrounding context
            start = max(0, query_pos - context_chars)
            end = min(len(content), query_pos + len(query) + context_chars)
            excerpt = content[start:end]

            # Add ellipsis if excerpt is truncated
            if start > 0:
                excerpt = "..." + excerpt
            if end < len(content):
                excerpt = excerpt + "..."

            return excerpt

        except Exception as e:
            logger.error(f"Error extracting excerpt: {e}")
            return ""


# Global instance
storage_manager = StorageManager()
