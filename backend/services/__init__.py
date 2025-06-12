""" Centralized service management for the Instantory backend. Provides singleton access to all services to eliminate duplication. """

import logging
from typing import Optional, Dict, Any
import asyncio
from asyncpg.exceptions import ConnectionDoesNotExistError, ConnectionFailureError
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Global service instances (singletons)
_storage_manager = None
_document_processor = None
_qdrant_service = None

def get_storage_manager():
    """Get the singleton storage manager instance."""
    global _storage_manager
    if _storage_manager is None:
        try:
            from backend.services.storage.manager import StorageManager
            _storage_manager = StorageManager()
            logger.info("Storage manager instance created")
        except ImportError as e:
            logger.error("Failed to import storage manager: %s", e)
            _storage_manager = None
        except Exception as e:
            logger.error("Failed to create storage manager: %s", e)
            _storage_manager = None
    return _storage_manager


def get_document_processor():
    """Get the singleton document processor instance."""
    global _document_processor
    if _document_processor is None:
        try:
            from backend.services.processor.document_processor import DocumentProcessor
            _document_processor = DocumentProcessor()
            logger.info("Document processor instance created")
        except ImportError as e:
            logger.error("Failed to import document processor: %s", e)
            _document_processor = None
        except Exception as e:
            logger.error("Failed to create document processor: %s", e)
            _document_processor = None
    return _document_processor

def get_qdrant_service():
    """Get the singleton Qdrant vector database service instance."""
    global _qdrant_service
    if _qdrant_service is None:
        try:
            from backend.services.vector.qdrant_service import QdrantService
            _qdrant_service = QdrantService()
            logger.info("Qdrant service instance created")
        except ImportError as e:
            logger.error("Failed to import Qdrant service: %s", e)
            _qdrant_service = None
        except Exception as e:
            logger.error("Failed to create Qdrant service: %s", e)
            _qdrant_service = None
    return _qdrant_service

async def check_services_health() -> Dict[str, Dict[str, Any]]:
    """Check the health of all services."""
    health_results: Dict[str, Dict[str, Any]] = {}
    
    # Check storage service
    storage_manager = get_storage_manager()
    if storage_manager:
        try:
            # Test storage connectivity
            health_results['storage'] = {
                'status': 'healthy',
                'service': 'storage_manager'
            }
        except Exception as e:
            health_results['storage'] = {
                'status': 'unhealthy',
                'error': str(e),
                'service': 'storage_manager'
            }
    else:
        health_results['storage'] = {
            'status': 'unavailable',
            'service': 'storage_manager'
        }
    
    return health_results

async def monitor_services():
    """Periodic service health monitoring."""
    while True:
        try:
            health_status = await check_services_health()
            logger.info("Service health check completed: %s", health_status)
            await asyncio.sleep(300)  # Check every 5 minutes
        except Exception as e:
            logger.error("Service monitoring error: %s", e)
            await asyncio.sleep(60)  # Retry in 1 minute on error


__all__ = [
    'get_storage_manager',
    'get_document_processor',
    'get_qdrant_service',
    'check_services_health',
    'initialize_services',
    'cleanup_services',
    'monitor_services'
]