"""File processing components for handling documents and images.

This module provides a factory pattern for creating different types of processors
(document, image, and batch) with shared database and OpenAI client dependencies.

Example usage:
    >>> from backend.services.processor import create_processor_factory
    >>> factory = create_processor_factory(db_pool, openai_client)
    >>> doc_processor = factory.create_document_processor()
    >>> batch_processor = factory.create_batch_processor()
"""
from typing import Dict, Any, Optional, Union, Protocol
import logging
import asyncpg
from openai import AsyncOpenAI

from .base_processor import BaseProcessor, ProcessingStatus
from .document_processor import DocumentProcessor
from .image_processor import ImageProcessor
from .batch_processor import BatchProcessor, BatchFiles, BatchStatus

# Configure logging for this module
logger = logging.getLogger(__name__)


class ProcessorProtocol(Protocol):
    """Protocol defining the interface for all processors."""
    
    async def process_file(self, file_path) -> bool:
        """Process a single file."""
        ...
    
    def get_status(self) -> Dict[str, Any]:
        """Get current processing status."""
        ...


class ProcessorFactory:
    """Factory for creating processor instances with dependency injection.
    
    This factory provides a centralized way to create processors with shared
    dependencies (database pool and OpenAI client), ensuring consistent
    configuration across all processor instances.
    
    Attributes:
        db_pool: AsyncPG connection pool for database operations
        openai_client: Async OpenAI client for AI-powered processing
    
    Example:
        >>> factory = ProcessorFactory(db_pool, openai_client)
        >>> doc_processor = factory.create_document_processor()
        >>> img_processor = factory.create_image_processor("Extract metadata")
    """
    
    def __init__(self, db_pool: asyncpg.Pool, openai_client: AsyncOpenAI):
        """Initialize the factory with required dependencies.
        
        Args:
            db_pool: Database connection pool for processor operations
            openai_client: OpenAI client for AI-powered content analysis
            
        Raises:
            TypeError: If dependencies are not of expected types
        """
        if not isinstance(db_pool, asyncpg.Pool):
            raise TypeError("db_pool must be an asyncpg.Pool instance")
        if not isinstance(openai_client, AsyncOpenAI):
            raise TypeError("openai_client must be an AsyncOpenAI instance")
            
        self.db_pool = db_pool
        self.openai_client = openai_client
        
        logger.info("ProcessorFactory initialized with database pool and OpenAI client")
    
    def create_document_processor(self) -> DocumentProcessor:
        """Create a document processor instance.
        
        Returns:
            DocumentProcessor: Configured processor for document files
            
        Example:
            >>> processor = factory.create_document_processor()
            >>> status = await processor.process_file(Path("document.pdf"))
        """
        logger.debug("Creating DocumentProcessor instance")
        return DocumentProcessor(self.db_pool, self.openai_client)
    
    def create_image_processor(self, instruction: Optional[str] = None) -> ImageProcessor:
        """Create an image processor instance.
        
        Args:
            instruction: Optional custom instruction for image processing
            
        Returns:
            ImageProcessor: Configured processor for image files
            
        Example:
            >>> processor = factory.create_image_processor("Extract product details")
            >>> status = await processor.process_file(Path("product.jpg"))
        """
        logger.debug(f"Creating ImageProcessor instance with instruction: {instruction}")
        return ImageProcessor(self.db_pool, self.openai_client, instruction)
    
    def create_batch_processor(self, image_instruction: Optional[str] = None) -> BatchProcessor:
        """Create a batch processor instance.
        
        Args:
            image_instruction: Optional custom instruction for image processing
            
        Returns:
            BatchProcessor: Configured processor for mixed file batches
            
        Example:
            >>> processor = factory.create_batch_processor("Catalog items")
            >>> status = await processor.process_uploads(upload_dir)
        """
        logger.debug(f"Creating BatchProcessor instance with image instruction: {image_instruction}")
        return BatchProcessor(self.db_pool, self.openai_client, image_instruction)
    
    async def create_processor_for_file(self, file_path, instruction: Optional[str] = None) -> Union[DocumentProcessor, ImageProcessor]:
        """Create the appropriate processor for a given file type.
        
        Args:
            file_path: Path to the file to be processed
            instruction: Optional instruction for image processing
            
        Returns:
            Appropriate processor instance for the file type
            
        Raises:
            ValueError: If file type is not supported
            
        Example:
            >>> processor = await factory.create_processor_for_file(Path("file.pdf"))
            >>> isinstance(processor, DocumentProcessor)  # True
        """
        from pathlib import Path
        
        file_path = Path(file_path)
        
        if DocumentProcessor.is_supported_file(file_path):
            return self.create_document_processor()
        elif ImageProcessor.is_supported_file(file_path):
            return self.create_image_processor(instruction)
        else:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")
    
    def get_supported_file_types(self) -> Dict[str, list]:
        """Get all supported file types by processor category.
        
        Returns:
            Dictionary mapping processor types to supported file extensions
        """
        return {
            'documents': getattr(DocumentProcessor, 'SUPPORTED_EXTENSIONS', ['.pdf', '.docx', '.txt']),
            'images': getattr(ImageProcessor, 'SUPPORTED_EXTENSIONS', ['.jpg', '.jpeg', '.png', '.webp'])
        }
    
    async def validate_dependencies(self) -> bool:
        """Validate that all dependencies are healthy and accessible.
        
        Returns:
            True if all dependencies are healthy, False otherwise
        """
        try:
            # Test database connection
            async with self.db_pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            
            # OpenAI client validation would require an actual API call
            # For now, just check if the client is properly configured
            if not hasattr(self.openai_client, 'api_key') or not self.openai_client.api_key:
                logger.warning("OpenAI client may not be properly configured")
                return False
                
            logger.info("All factory dependencies validated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Dependency validation failed: {e}")
            return False


def create_processor_factory(db_pool: asyncpg.Pool, openai_client: AsyncOpenAI) -> ProcessorFactory:
    """Create a processor factory instance with dependency validation.
    
    This is the recommended way to create a ProcessorFactory, as it includes
    basic validation of the provided dependencies.
    
    Args:
        db_pool: Database connection pool for processor operations
        openai_client: OpenAI client for AI-powered content analysis
        
    Returns:
        ProcessorFactory: Configured factory instance
        
    Raises:
        TypeError: If dependencies are not of expected types
        
    Example:
        >>> factory = create_processor_factory(db_pool, openai_client)
        >>> doc_processor = factory.create_document_processor()
    """
    logger.info("Creating ProcessorFactory through factory function")
    return ProcessorFactory(db_pool, openai_client)

__all__ = [
    'BaseProcessor',
    'ProcessingStatus',
    'DocumentProcessor',
    'ImageProcessor',
    'BatchProcessor',
    'BatchFiles',
    'BatchStatus',
    'ProcessorFactory',
    'create_processor_factory'
]
