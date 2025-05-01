"""Base processor class for handling file processing."""
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path
from abc import ABC, abstractmethod
import json

from backend.config.storage import get_storage_config, get_temp_dir, cleanup_temp_files
from backend.config.logging import log_config

logger = log_config.get_logger(__name__)
storage = get_storage_config()

class ProcessingStatus:
    """Status tracking for processing operations."""
    
    def __init__(self):
        self.total_files: int = 0
        self.processed_files: int = 0
        self.failed_files: int = 0
        self.errors: List[Dict[str, Any]] = []
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
    
    @property
    def progress(self) -> float:
        """Calculate progress percentage."""
        if self.total_files == 0:
            return 0.0
        return (self.processed_files / self.total_files) * 100
    
    @property
    def duration(self) -> Optional[float]:
        """Calculate processing duration in seconds."""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert status to dictionary."""
        return {
            'total_files': self.total_files,
            'processed_files': self.processed_files,
            'failed_files': self.failed_files,
            'progress': self.progress,
            'duration': self.duration,
            'errors': self.errors
        }

class BaseProcessor(ABC):
    """Base class for file processors."""
    
    def __init__(self):
        self.status = ProcessingStatus()
        self.temp_dir: Optional[Path] = None
    
    async def initialize(self) -> None:
        """Initialize processor resources."""
        self.temp_dir = storage.get_temp_dir()
        self.status = ProcessingStatus()
        self.status.start_time = datetime.now()
    
    async def cleanup(self) -> None:
        """Clean up processor resources."""
        if self.temp_dir:
            cleanup_temp_files  (self.temp_dir)
        self.status.end_time = datetime.now()
    
    @abstractmethod
    async def process_file(self, file_path: Path) -> bool:
        """Process a single file."""
        pass
    
    async def process_batch(self, file_paths: List[Path], batch_size: int = 5) -> ProcessingStatus:
        """Process a batch of files with concurrency control."""                
        try:
            await self.initialize()
            self.status.total_files = len(file_paths)
            
            # Process files in batches
            for i in range(0, len(file_paths), batch_size):
                batch = file_paths[i:i + batch_size]
                tasks = [self.process_file(path) for path in batch]
                
                # Wait for batch completion
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Update status
                for path, result in zip(batch, results):
                    if isinstance(result, Exception):
                        self.status.failed_files += 1
                        self.status.errors.append({
                            'file': str(path),
                            'error': str(result),
                            'timestamp': datetime.now().isoformat()
                        })
                        logger.error(f"Failed to process {path}: {result}")
                    elif result:
                        self.status.processed_files += 1
                        logger.info(f"Successfully processed {path}")
                    else:
                        self.status.failed_files += 1
                        logger.warning(f"Processing skipped for {path}")
            
            return self.status
            
        except Exception as e:
            logger.error(f"Batch processing error: {e}")
            raise
        
        finally:
            await self.cleanup()
    
    def get_status(self) -> Dict[str, Any]:
        """Get current processing status."""
        return self.status.to_dict()
    
    @staticmethod
    def is_supported_file(file_path: Path) -> bool:
        """Check if file type is supported."""
        return False  # Override in subclasses
