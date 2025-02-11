import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from backend.services.processor import (
    BaseProcessor,
    DocumentProcessor,
    ImageProcessor,
    BatchProcessor,
    ProcessingStatus,
)

pytestmark = pytest.mark.asyncio

class TestBaseProcessor:
    async def test_initialization(self, db_pool, openai_client):
        processor = BaseProcessor(db_pool, openai_client)
        assert processor.db_pool == db_pool
        assert processor.openai_client == openai_client

    async def test_validate_file_valid(self, db_pool, openai_client):
        processor = BaseProcessor(db_pool, openai_client)
        result = await processor.validate_file("test.pdf", b"test content")
        assert result is True

    async def test_validate_file_invalid(self, db_pool, openai_client):
        processor = BaseProcessor(db_pool, openai_client)
        with pytest.raises(ValueError):
            await processor.validate_file("test.exe", b"test content")

class TestDocumentProcessor:
    async def test_process_pdf_document(self, db_pool, openai_client, mock_processor_response):
        processor = DocumentProcessor(db_pool, openai_client)
        
        # Mock PDF text extraction
        with patch("backend.services.processor.document_processor.extract_text") as mock_extract:
            mock_extract.return_value = "Extracted text content"
            
            # Mock OpenAI API call
            openai_client.chat.completions.create = AsyncMock(
                return_value=MagicMock(
                    choices=[
                        MagicMock(
                            message=MagicMock(
                                content="""
                                {
                                    "title": "Test Document",
                                    "summary": "Test summary",
                                    "category": "research",
                                    "keywords": ["test", "document"]
                                }
                                """
                            )
                        )
                    ]
                )
            )
            
            result = await processor.process_document(
                file_url="test.pdf",
                content=b"test content",
                user_id=1
            )
            
            assert result.status == ProcessingStatus.COMPLETED
            assert "title" in result.metadata
            assert "summary" in result.metadata
            assert "category" in result.metadata

    async def test_process_invalid_document(self, db_pool, openai_client):
        processor = DocumentProcessor(db_pool, openai_client)
        
        with pytest.raises(ValueError):
            await processor.process_document(
                file_url="test.exe",
                content=b"test content",
                user_id=1
            )

    async def test_extract_metadata(self, db_pool, openai_client):
        processor = DocumentProcessor(db_pool, openai_client)
        
        # Mock OpenAI API call
        openai_client.chat.completions.create = AsyncMock(
            return_value=MagicMock(
                choices=[
                    MagicMock(
                        message=MagicMock(
                            content="""
                            {
                                "title": "Test Document",
                                "summary": "Test summary",
                                "category": "research",
                                "keywords": ["test", "document"]
                            }
                            """
                        )
                    )
                ]
            )
        )
        
        metadata = await processor.extract_metadata("Test document content")
        
        assert metadata["title"] == "Test Document"
        assert metadata["summary"] == "Test summary"
        assert metadata["category"] == "research"
        assert "test" in metadata["keywords"]

class TestImageProcessor:
    async def test_process_image(self, db_pool, openai_client, mock_processor_response):
        processor = ImageProcessor(db_pool, openai_client)
        
        # Mock OpenAI API call
        openai_client.chat.completions.create = AsyncMock(
            return_value=MagicMock(
                choices=[
                    MagicMock(
                        message=MagicMock(
                            content="""
                            {
                                "description": "Test image description",
                                "category": "product",
                                "tags": ["test", "image"]
                            }
                            """
                        )
                    )
                ]
            )
        )
        
        result = await processor.process_image(
            file_url="test.jpg",
            content=b"test content",
            user_id=1
        )
        
        assert result.status == ProcessingStatus.COMPLETED
        assert "description" in result.metadata
        assert "category" in result.metadata
        assert "tags" in result.metadata

    async def test_process_invalid_image(self, db_pool, openai_client):
        processor = ImageProcessor(db_pool, openai_client)
        
        with pytest.raises(ValueError):
            await processor.process_image(
                file_url="test.txt",
                content=b"test content",
                user_id=1
            )

class TestBatchProcessor:
    async def test_process_batch(self, db_pool, openai_client, mock_processor_response):
        processor = BatchProcessor(db_pool, openai_client)
        
        files = [
            {"url": "test1.pdf", "content": b"test content 1", "type": "document"},
            {"url": "test2.jpg", "content": b"test content 2", "type": "image"}
        ]
        
        # Mock processor methods
        processor.process_document = AsyncMock(return_value=mock_processor_response)
        processor.process_image = AsyncMock(return_value=mock_processor_response)
        
        result = await processor.process_batch(files, user_id=1)
        
        assert result.status == ProcessingStatus.COMPLETED
        assert len(result.results) == 2
        assert all(r["status"] == "completed" for r in result.results)

    async def test_batch_with_errors(self, db_pool, openai_client):
        processor = BatchProcessor(db_pool, openai_client)
        
        files = [
            {"url": "test1.pdf", "content": b"test content 1", "type": "document"},
            {"url": "test2.exe", "content": b"test content 2", "type": "unknown"}
        ]
        
        result = await processor.process_batch(files, user_id=1)
        
        assert result.status == ProcessingStatus.PARTIAL
        assert any(r["status"] == "error" for r in result.results)

    async def test_empty_batch(self, db_pool, openai_client):
        processor = BatchProcessor(db_pool, openai_client)
        
        with pytest.raises(ValueError):
            await processor.process_batch([], user_id=1)

    async def test_batch_size_limit(self, db_pool, openai_client):
        processor = BatchProcessor(db_pool, openai_client)
        
        files = [
            {"url": f"test{i}.pdf", "content": b"test", "type": "document"}
            for i in range(25)  # Exceeds default limit of 20
        ]
        
        with pytest.raises(ValueError):
            await processor.process_batch(files, user_id=1)

    async def test_progress_tracking(self, db_pool, openai_client, mock_processor_response):
        processor = BatchProcessor(db_pool, openai_client)
        
        files = [
            {"url": "test1.pdf", "content": b"test content 1", "type": "document"},
            {"url": "test2.jpg", "content": b"test content 2", "type": "image"}
        ]
        
        # Mock processor methods
        processor.process_document = AsyncMock(return_value=mock_processor_response)
        processor.process_image = AsyncMock(return_value=mock_processor_response)
        
        progress_updates = []
        
        async def progress_callback(current, total):
            progress_updates.append((current, total))
        
        result = await processor.process_batch(
            files,
            user_id=1,
            progress_callback=progress_callback
        )
        
        assert len(progress_updates) > 0
        assert progress_updates[-1] == (2, 2)  # Final update should show completion
