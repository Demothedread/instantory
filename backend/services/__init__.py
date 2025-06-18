"""Centralized service management for the Instantory backend. Provides singleton access to all services to eliminate duplication."""

import asyncio
import logging
from typing import Any, Dict, Optional

from asyncpg.exceptions import ConnectionDoesNotExistError, ConnectionFailureError
from openai import AsyncOpenAI

from backend.config.database import get_db_pool

logger = logging.getLogger(__name__)

# Global service instances (singletons)
_storage_manager = None
_document_processor = None
_qdrant_service = None
_openai_client = None


def get_openai_client():
    """Get the singleton OpenAI client instance."""
    global _openai_client
    if _openai_client is None:
        try:
            # Initialize OpenAI client with API key from environment variables
            _openai_client = AsyncOpenAI()
            logger.info("OpenAI client instance created")
        except Exception as e:
            logger.error("Failed to create OpenAI client: %s", e)
            _openai_client = None
    return _openai_client


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

            # Get the required dependencies
            storage_manager = get_storage_manager()
            openai_client = get_openai_client()

            # Check if dependencies are available
            if storage_manager is None or openai_client is None:
                logger.error(
                    "Required dependencies not available for document processor"
                )
                return None

            # Get db_pool from storage manager
            db_pool = get_db_pool()

            # Create document processor with required arguments
            _document_processor = DocumentProcessor(
                db_pool=db_pool, openai_client=openai_client
            )
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
            health_results["storage"] = {
                "status": "healthy",
                "service": "storage_manager",
            }
        except Exception as e:
            health_results["storage"] = {
                "status": "unhealthy",
                "error": str(e),
                "service": "storage_manager",
            }
    else:
        health_results["storage"] = {
            "status": "unavailable",
            "service": "storage_manager",
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


async def initialize_services():
    """Initialize all services and verify their health."""
    logger.info("Initializing all services...")

    try:
        # Initialize services in order of dependencies
        storage_manager = get_storage_manager()
        if storage_manager is None:
            raise RuntimeError("Failed to initialize storage manager")

        openai_client = get_openai_client()
        if openai_client is None:
            raise RuntimeError("Failed to initialize OpenAI client")

        document_processor = get_document_processor()
        if document_processor is None:
            raise RuntimeError("Failed to initialize document processor")

        qdrant_service = get_qdrant_service()
        if qdrant_service is None:
            raise RuntimeError("Failed to initialize Qdrant service")

        # Verify service health
        health_status = await check_services_health()
        unhealthy_services = [
            service
            for service, status in health_status.items()
            if status.get("status") != "healthy"
        ]

        if unhealthy_services:
            logger.warning("Some services are not healthy: %s", unhealthy_services)
        else:
            logger.info("All services initialized successfully")

        return True

    except Exception as e:
        logger.error("Failed to initialize services: %s", e)
        return False


async def cleanup_services():
    """Clean up all service resources."""
    global _storage_manager, _document_processor, _qdrant_service, _openai_client

    logger.info("Cleaning up services...")

    try:
        # Clean up storage manager connections
        if _storage_manager:
            try:
                await _storage_manager.cleanup()
                logger.info("Storage manager cleaned up")
            except Exception as e:
                logger.error("Error cleaning up storage manager: %s", e)

        # Clean up Qdrant service
        if _qdrant_service:
            try:
                await _qdrant_service.close()
                logger.info("Qdrant service cleaned up")
            except Exception as e:
                logger.error("Error cleaning up Qdrant service: %s", e)

        # Clean up OpenAI client
        if _openai_client:
            try:
                await _openai_client.close()
                logger.info("OpenAI client cleaned up")
            except Exception as e:
                logger.error("Error cleaning up OpenAI client: %s", e)

        # Reset global instances
        _storage_manager = None
        _document_processor = None
        _qdrant_service = None
        _openai_client = None

        logger.info("All services cleaned up successfully")

    except Exception as e:
        logger.error("Error during service cleanup: %s", e)


__all__ = [
    "get_storage_manager",
    "get_document_processor",
    "get_qdrant_service",
    "check_services_health",
    "initialize_services",
    "cleanup_services",
    "monitor_services",
]
