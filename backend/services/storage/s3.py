from boto3 import client
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        try:
            self.s3 = client('s3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name='us-west-2'
            )
            self.bucket = os.getenv('AWS_S3_EXPRESS_BUCKET')
            if not self.bucket:
                raise ValueError("AWS_S3_EXPRESS_BUCKET environment variable is required")
            logger.info("S3 service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize S3 service: {e}")
            raise

    async def upload_document(self, user_id: int, file_data: bytes, filename: str) -> str:
        """
        Upload a document to S3 Express in the user's directory.
        
        Args:
            user_id: The ID of the user
            file_data: The document's binary data
            filename: Original filename
            
        Returns:
            S3 URL of the uploaded document
        """
        try:
            key = f"documents/{user_id}/{filename}"
            self.s3.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_data
            )
            url = f"s3://{self.bucket}/{key}"
            logger.info(f"Successfully uploaded document to {url}")
            return url
        except Exception as e:
            logger.error(f"Failed to upload document to S3: {e}")
            raise

    async def get_document(self, document_url: str) -> Optional[bytes]:
        """
        Retrieve a document from S3 Express.
        
        Args:
            document_url: The S3 URL of the document
            
        Returns:
            Document binary data if found, None otherwise
        """
        try:
            if not document_url.startswith(f"s3://{self.bucket}/"):
                raise ValueError("Invalid S3 URL format")
                
            key = document_url.split(f"s3://{self.bucket}/")[1]
            response = self.s3.get_object(Bucket=self.bucket, Key=key)
            return response['Body'].read()
        except Exception as e:
            logger.error(f"Failed to retrieve document from S3: {e}")
            return None

    async def delete_document(self, document_url: str) -> bool:
        """
        Delete a document from S3 Express.
        
        Args:
            document_url: The S3 URL of the document
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if not document_url.startswith(f"s3://{self.bucket}/"):
                raise ValueError("Invalid S3 URL format")
                
            key = document_url.split(f"s3://{self.bucket}/")[1]
            self.s3.delete_object(Bucket=self.bucket, Key=key)
            logger.info(f"Successfully deleted document at {document_url}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete document from S3: {e}")
            return False

# Global instance
s3_service = S3Service()
