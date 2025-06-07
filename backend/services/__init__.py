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
            from backend.config.database import get_metadata_pool
            from backend.config.client_factory import create_openai_client
            
            # Get required dependencies
            db_pool = None
            openai_client = None
            
            try:
                db_pool = get_metadata_pool()
                openai_client = create_openai_client()
            except Exception as dep_error:
                logger.error("Failed to get dependencies for document processor: %s", dep_error)
                return None
                
            if db_pool and openai_client:
                _document_processor = DocumentProcessor(db_pool, openai_client)
                logger.info("Document processor instance created")
            else:
                logger.error("Missing required dependencies for document processor")
                _document_processor = None
        except ImportError as e:
            logger.error("Failed to import document processor dependencies: %s", e)
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
            from backend.services.vector.qdrant_service import qdrant_service
            _qdrant_service = qdrant_service
            logger.info("Qdrant service instance retrieved")
        except ImportError as e:
            logger.error("Failed to import Qdrant service: %s", e)
            _qdrant_service = None
        except Exception as e:
            logger.error("Failed to get Qdrant service: %s", e)
            _qdrant_service = None
    return _qdrant_service


async def check_services_health() -> Dict[str, Dict[str, Any]]:
    """Check the health of all services."""
    health_results: Dict[str, Dict[str, Any]] = {}

    # Check storage service
    storage_manager = get_storage_manager()
    if storage_manager:
        try:
            storage_health = await storage_manager.check_storage_health()
            health_results['storage'] = {
                'status': 'healthy' if storage_health.get('status') == 'healthy' else 'unhealthy',
                'service': 'storage_manager',
                'details': storage_health
            }
        except (ConnectionDoesNotExistError, ConnectionFailureError) as e:
            health_results['storage'] = {
                'status': 'unhealthy',
                'error': f"Connection error: {e}",
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

    # Check document processor availability (no health check method)
    document_processor = get_document_processor()
    if document_processor:
        health_results['document_processor'] = {
            'status': 'healthy',
            'service': 'document_processor'
        }
    else:
        health_results['document_processor'] = {
            'status': 'unavailable',
            'service': 'document_processor'
        }

    # Check database connections
    try:
        from backend.config.database import get_metadata_pool, get_vector_pool

        # Check metadata database
        try:
            metadata_pool = await asyncio.wait_for(get_metadata_pool(), timeout=2.0)
            if metadata_pool:
                async with asyncio.wait_for(metadata_pool.acquire(), timeout=1.0) as conn:
                    await conn.fetchval("SELECT 1")
                health_results['metadata_db'] = {
                    'status': 'healthy',
                    'service': 'metadata_database'
                }
            else:
                health_results['metadata_db'] = {
                    'status': 'unhealthy',
                    'error': 'Pool not available',
                    'service': 'metadata_database'
                }
        except asyncio.TimeoutError:
            health_results['metadata_db'] = {
                'status': 'unhealthy',
                'error': 'Connection timeout',
                'service': 'metadata_database'
            }
        except Exception as e:
            health_results['metadata_db'] = {
                'status': 'unhealthy',
                'error': str(e),
                'service': 'metadata_database'
            }

        # Check vector database (Qdrant service)
        try:
            qdrant_service = get_qdrant_service()
            if qdrant_service:
                qdrant_health = await qdrant_service.health_check()
                health_results['qdrant_vector_db'] = {
                    'status': qdrant_health.get('status', 'unknown'),
                    'service': 'qdrant_service',
                    'collections_count': qdrant_health.get('collections_count', 0),
                    'vector_count': qdrant_health.get('vector_count', 0),
                    'collection_exists': qdrant_health.get('collection_exists', False)
                }
                if qdrant_health.get('status') != 'healthy':
                    health_results['qdrant_vector_db']['error'] = qdrant_health.get('error', 'Unknown error')
            else:
                health_results['qdrant_vector_db'] = {
                    'status': 'unavailable',
                    'service': 'qdrant_service'
                }
        except Exception as e:
            health_results['qdrant_vector_db'] = {
                'status': 'unhealthy',
                'error': str(e),
                'service': 'qdrant_service'
            }

        # Check vector database (fallback to PostgreSQL)
        try:
            vector_pool = await asyncio.wait_for(get_vector_pool(), timeout=2.0)
            if vector_pool:
                # Check if it's Qdrant service or PostgreSQL pool
                from backend.config.database import is_qdrant_service
                if is_qdrant_service(vector_pool):
                    # Already checked above
                    pass
                else:
                    # PostgreSQL pool
                    async with asyncio.wait_for(vector_pool.acquire(), timeout=1.0) as conn:
                        await conn.fetchval("SELECT 1")
                    health_results['vector_db'] = {
                        'status': 'healthy',
                        'service': 'postgresql_vector_database'
                    }
            else:
                health_results['vector_db'] = {
                    'status': 'unavailable',
                    'service': 'vector_database'
                }
        except asyncio.TimeoutError:
            health_results['vector_db'] = {
                'status': 'unhealthy',
                'error': 'Connection timeout',
                'service': 'vector_database'
            }
        except Exception as e:
            health_results['vector_db'] = {
                'status': 'degraded',
                'error': str(e),
                'service': 'vector_database'
            }
    except ImportError as e:
        health_results['database_import'] = {
            'status': 'unhealthy',
            'error': "Database module import failed: %s" % e,
            'service': 'database_config'
        }

    return health_results


def initialize_services():
    """Initialize all services at startup."""
    logger.info("Initializing all services...")
    get_storage_manager()
    get_document_processor()
    
    # Initialize Qdrant service and collection
    qdrant_service = get_qdrant_service()
    if qdrant_service:
        try:
            # Run initialization in a new event loop if needed
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # Create a task for initialization
                    asyncio.create_task(qdrant_service.initialize_collection())
                else:
                    loop.run_until_complete(qdrant_service.initialize_collection())
            except RuntimeError:
                # No event loop, create one
                asyncio.run(qdrant_service.initialize_collection())
            logger.info("Qdrant collection initialization scheduled")
        except Exception as e:
            logger.error("Failed to initialize Qdrant collection: %s", e)
    
    logger.info("Service initialization completed")


def cleanup_services():
    """Cleanup all services."""
    global _storage_manager, _document_processor, _qdrant_service
    logger.info("Cleaning up services...")
    
    # Cleanup Qdrant service
    if _qdrant_service:
        try:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(_qdrant_service.close())
                else:
                    loop.run_until_complete(_qdrant_service.close())
            except RuntimeError:
                asyncio.run(_qdrant_service.close())
        except Exception as e:
            logger.error("Error cleaning up Qdrant service: %s", e)
    
    # Reset global instances
    _storage_manager = None
    _document_processor = None
    _qdrant_service = None
    logger.info("Service cleanup completed")                                                                                                                                           


async def monitor_services():
    """Periodic service health monitoring."""
    while True:
        try:
            await asyncio.sleep(300)  # Check every 5 minutes
            health_results = await check_services_health()
            unhealthy_services = [
                service for service, status in health_results.items()
                if status.get('status') == 'unhealthy'
            ]
            if unhealthy_services:
                logger.warning("Unhealthy services detected: %s", unhealthy_services)
            else:
                logger.debug("All services healthy")
        except Exception as e:
            logger.error("Service monitoring error: %s", e)


__all__ = [
    'get_storage_manager',
    'get_document_processor',
    'get_qdrant_service',
    'check_services_health',
    'initialize_services',
    'cleanup_services',
    'monitor_services'
]
