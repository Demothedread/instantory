import os
import aiohttp
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Blob:
    """
    Represents a document or object stored in Vercel Blob Storage.
    """
    def __init__(self, url: str, filename: str, content_type: str):
        self.url = url
        self.filename = filename
        self.content_type = content_type

    def __repr__(self):
        return f"Blob(url={self.url}, filename={self.filename}, content_type={self.content_type})"

class VercelBlobService:
    def __init__(self):
        self.token = os.getenv('BLOB_READ_WRITE_TOKEN')
        if not self.token:
            logger.warning("BLOB_READ_WRITE_TOKEN environment variable is missing")
        # The upload endpoint per Vercel Blob API documentation.
        self.upload_endpoint = "https://api.vercel.com/v9/blob/upload"

    async def upload_document(self, file_data: bytes, filename: str, content_type: str) -> Optional[str]:
        """
        Upload a document (or image) to Vercel Blob Storage.
        
        Args:
            file_data: Binary data of the file.
            filename: The original filename.
            content_type: The MIME type of the file.
            
        Returns:
            URL of the uploaded blob, or None if the upload failed
        """
        if not self.token:
            logger.error("Cannot upload to Vercel Blob: BLOB_READ_WRITE_TOKEN not set")
            return None
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        payload = {
            "filename": filename,
            "contentType": content_type
        }
        try:
            # Step 1: Request an upload URL from Vercel
            async with aiohttp.ClientSession() as session:
                async with session.post(self.upload_endpoint, headers=headers, json=payload) as resp:
                    if resp.status != 200:
                        text = await resp.text()
                        logger.error(f"Failed to get upload URL: {resp.status} {text}")
                        return None
                    data = await resp.json()
                    put_url = data.get("url")
                    blob_url = data.get("blob", {}).get("url")
                    if not put_url:
                        logger.error("Upload URL not provided in response")
                        return None
            
            # Step 2: Upload the file data using the provided PUT URL
            async with aiohttp.ClientSession() as session:
                async with session.put(put_url, data=file_data, headers={"Content-Type": content_type}) as put_resp:
                    if put_resp.status not in [200, 201]:
                        text = await put_resp.text()
                        logger.error(f"Failed to upload file: {put_resp.status} {text}")
                        return None
            
            # Return URL for accessing the file
            return blob_url or put_url
        
        except Exception as e:
            logger.error(f"Error uploading to Vercel Blob: {e}")
            return None

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

    async def delete_document(self) -> bool:
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
