"""Batch processor for handling mixed document and image uploads."""
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Any, NamedTuple, Optional
from dataclasses import dataclass
import asyncpg
from openai import AsyncOpenAI

from .base_processor import BaseProcessor
from .document_processor import DocumentProcessor
from .image_processor import ImageProcessor
from ...config.logging import log_config
from ...config.storage import get_storage_config

logger = log_config.get_logger(__name__)
storage = get_storage_config()

@dataclass
class BatchFiles:
    """Container for categorized files."""
    documents: List[Path]
    images: List[Path]
    unsupported: List[Path]

class BatchStatus:
    """Status tracking for batch processing."""
    
    def __init__(self):
        self.document_status = None
        self.image_status = None
        self.total_files = 0
        self.start_time = None
        self.end_time = None
    
    @property
    def overall_progress(self) -> float:
        """Calculate overall progress percentage."""
        if not self.total_files:
            return 0.0
            
        doc_progress = self.document_status.progress if self.document_status else 0
        img_progress = self.image_status.progress if self.image_status else 0
        
        # Weight progress by number of files of each type
        if self.document_status and self.image_status:
            doc_weight = len(self.document_status.total_files) / self.total_files
            img_weight = len(self.image_status.total_files) / self.total_files
            return (doc_progress * doc_weight) + (img_progress * img_weight)
        elif self.document_status:
            return doc_progress
        elif self.image_status:
            return img_progress
        return 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert status to dictionary."""
        return {
            'overall_progress': self.overall_progress,
            'document_status': self.document_status.to_dict() if self.document_status else None,
            'image_status': self.image_status.to_dict() if self.image_status else None,
            'total_files': self.total_files
        }

class BatchProcessor(BaseProcessor):
    """Processor for handling mixed batches of documents and images."""
    
    def __init__(self, db_pool: asyncpg.Pool, openai_client: AsyncOpenAI, 
                 image_instruction: Optional[str] = None):
        super().__init__()
        self.db_pool = db_pool
        self.openai_client = openai_client
        self.document_processor = DocumentProcessor(db_pool, openai_client)
        self.image_processor = ImageProcessor(db_pool, openai_client, image_instruction)
        self.batch_status = BatchStatus()
    
    def _categorize_files(self, upload_dir: Path) -> BatchFiles:
        """Categorize files in upload directory by type."""
        documents = []
        images = []
        unsupported = []
        
        for file_path in upload_dir.glob('*'):
            if not file_path.is_file():
                continue
                
            if DocumentProcessor.is_supported_file(file_path):
                documents.append(file_path)
            elif ImageProcessor.is_supported_file(file_path):
                images.append(file_path)
            else:
                unsupported.append(file_path)
        
        return BatchFiles(documents, images, unsupported)
    
    async def process_uploads(self, upload_dir: Path) -> Dict[str, Any]:
        """Process all files in the upload directory."""
        try:
            # Initialize processing
            await self.initialize()
            
            # Categorize files
            batch_files = self._categorize_files(upload_dir)
            self.batch_status.total_files = (
                len(batch_files.documents) + 
                len(batch_files.images) + 
                len(batch_files.unsupported)
            )
            
            # Log unsupported files
            for file_path in batch_files.unsupported:
                logger.warning(f"Unsupported file type: {file_path}")
            
            # Process documents and images concurrently
            processing_tasks = []
            
            if batch_files.documents:
                doc_task = self.document_processor.process_batch(batch_files.documents)
                processing_tasks.append(doc_task)
            
            if batch_files.images:
                img_task = self.image_processor.process_batch(batch_files.images)
                processing_tasks.append(img_task)
            
            # Wait for all processing to complete
            if processing_tasks:
                results = await asyncio.gather(*processing_tasks, return_exceptions=True)
                
                # Update batch status
                for result in results:
                    if isinstance(result, Exception):
                        logger.error(f"Batch processing error: {result}")
                    else:
                        if isinstance(result, DocumentProcessor.ProcessingStatus):
                            self.batch_status.document_status = result
                        elif isinstance(result, ImageProcessor.ProcessingStatus):
                            self.batch_status.image_status = result
            
            return self.get_status()
            
        except Exception as e:
            logger.error(f"Error processing uploads: {e}")
            raise
            
        finally:
            await self.cleanup()
    
    def get_status(self) -> Dict[str, Any]:
        """Get current batch processing status."""
        return self.batch_status.to_dict()
    
    @staticmethod
    def is_supported_file(file_path: Path) -> bool:
        """Check if file type is supported by any processor."""
        return (
            DocumentProcessor.is_supported_file(file_path) or
            ImageProcessor.is_supported_file(file_path)
        )
