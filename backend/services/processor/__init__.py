"""File processing components for handling documents and images."""
from typing import Dict, Any, Optional
import asyncpg
from openai import AsyncOpenAI

from base_processor import BaseProcessor, ProcessingStatus
from document_processor import DocumentProcessor
from image_processor import ImageProcessor
from batch_processor import BatchProcessor, BatchFiles, BatchStatus

class ProcessorFactory:
    """Factory for creating processor instances."""
    
    def __init__(self, db_pool: asyncpg.Pool, openai_client: AsyncOpenAI):
        self.db_pool = db_pool
        self.openai_client = openai_client
    
    def create_document_processor(self) -> DocumentProcessor:
        """Create a document processor instance."""
        return DocumentProcessor(self.db_pool, self.openai_client)
    
    def create_image_processor(self, instruction: Optional[str] = None) -> ImageProcessor:
        """Create an image processor instance."""
        return ImageProcessor(self.db_pool, self.openai_client, instruction)
    
    def create_batch_processor(self, image_instruction: Optional[str] = None) -> BatchProcessor:
        """Create a batch processor instance."""
        return BatchProcessor(self.db_pool, self.openai_client, image_instruction)

def create_processor_factory(db_pool: asyncpg.Pool, 
                           openai_client: AsyncOpenAI) -> ProcessorFactory:
    """Create a processor factory instance."""
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
