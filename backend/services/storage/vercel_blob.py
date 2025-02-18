import os
import aiohttp
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class VercelBlobService:
    def __init__(self):
        self.token = os.getenv('VERCEL_BLOB_READ_WRITE_TOKEN')
        if not self.token:
            raise ValueError("VERCEL_BLOB_READ_WRITE_TOKEN environment variable is required")
        # The upload endpoint per Vercel Blob API documentation.
        self.upload_endpoint = "https://api.vercel.com/v9/blob/upload"

    async def upload_document(self, file_data: bytes, filename: str, content_type: str) -> str:
        """
        Upload a document (or image) to Vercel Blob Storage.
        
        Args:
            file_data: Binary data of the file.
            filename: The original filename.
            content_type: The MIME type of the file.
            
        Returns:
            The URL at which the file can be accessed.
        """
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        payload = {
            "filename": filename,
            "contentType": content_type
        }
        # Step 1: Request an upload URL from Vercel
        async with aiohttp.ClientSession() as session:
            async with session.post(self.upload_endpoint, headers=headers, json=payload) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"Failed to get upload URL: {resp.status} {text}")
                    raise Exception("Failed to get Vercel Blob upload URL")
                data = await resp.json()
                put_url = data.get("url")
                if not put_url:
                    raise Exception("Upload URL not provided in response")
        # Step 2: Upload the file data using the provided PUT URL.
        async with aiohttp.ClientSession() as session:
            async with session.put(put_url, data=file_data, headers={"Content-Type": content_type}) as put_resp:
                if put_resp.status not in [200, 201]:
                    text = await put_resp.text()
                    logger.error(f"Failed to upload file: {put_resp.status} {text}")
                    raise Exception("Failed to upload file to Vercel Blob")
        # The put_url typically serves as the public URL to access the blob.
        return put_url

    async def get_document(self, document_url: str) -> Optional[bytes]:
        """
        Retrieve a document from Vercel Blob Storage.
        
        Args:
            document_url: The URL of the stored document.
        
        Returns:
            The document's binary data, or None if retrieval fails.
        """
        async with aiohttp.ClientSession() as session:
            async with session.get(document_url) as resp:
                if resp.status != 200:
                    logger.error(f"Failed to retrieve document: {resp.status}")
                    return None
                return await resp.read()

    async def delete_document(self, document_url: str) -> bool:
        """
        Delete a document from Vercel Blob Storage.
        
        Note:
            As of this writing, Vercel Blob may not support deletion through its public API.
            Adjust this implementation if and when deletion is available.
        
        Returns:
            False (indicating deletion is not implemented) by default.
        """
        logger.info("Vercel Blob deletion is not implemented; please configure lifecycle policies if needed.")
        return False

# Global instance to be imported elsewhere:
vercel_blob_service = VercelBlobService()