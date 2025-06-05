import os
import logging

logger = logging.getLogger(__name__)

# Determine the storage backend
_backend = os.getenv('STORAGE_BACKEND', 'generic').lower()

# Import backend-specific service
if _backend == 's3':
    from backend.services.storage.s3 import s3_service  # Changed to absolute import
elif _backend == 'vercel':
    try:
        from backend.services.storage.vercel_blob import vercel_blob_service  # Changed to absolute import
    except ImportError:
        logger.error("Vercel Blob service module not found; please install it or check configuration.")
        vercel_blob_service = None
else:
    # For "generic" storage, you could implement local filesystem functions here.
    s3_service = None
    vercel_blob_service = None

class StorageService:
    def __init__(self):
        self.backend = _backend
        if self.backend == 's3':
            self.service = s3_service
        elif self.backend == 'vercel':
            if vercel_blob_service is None:
                raise ValueError("Vercel Blob service not configured properly")
            self.service = vercel_blob_service
        else:
            # Implement or fallback to generic local storage
            self.service = None
            logger.info("Using generic storage; please implement local file handling if needed.")

    async def get_document(self, document_url: str) -> bytes:
        if self.backend in ['s3', 'vercel']:
            return await self.service.get_document(document_url)
        else:
            # Generic storage implementation (if any)
            logger.info("Generic get_document not implemented")
            return None

    async def delete_document(self, document_url: str) -> bool:
        if self.backend in ['s3', 'vercel']:
            return await self.service.delete_document(document_url)
        else:
            logger.info("Generic delete_document not implemented")
            return False

# Create a global instance
storage_service = StorageService()