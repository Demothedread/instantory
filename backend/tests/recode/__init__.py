"""Service components for the backend application."""

# Import services lazily to avoid import issues during deployment
try:
    from ..services.processor import (
        BaseProcessor,
        ProcessingStatus,
        DocumentProcessor,
        ImageProcessor,
        BatchProcessor,
        BatchFiles,
        BatchStatus,
        ProcessorFactory,
        create_processor_factory
    )
    
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
except ImportError as e:
    # If imports fail during deployment, provide minimal fallbacks
    import logging
    logger = logging.getLogger(__name__)
    logger.warning(f"Failed to import processor services: {e}")
    
    __all__ = []
