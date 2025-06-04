"""Qdrant vector database service for document embeddings and similarity search."""

import os
import logging
from typing import List, Optional, Dict, Any, Tuple
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, CollectionStatus, PointStruct, SearchRequest,
    SearchParams, UpdateResult, OperationInfo, Filter, FieldCondition, 
    MatchValue, UpdateStatus
)
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class QdrantService:
    """Service for managing Qdrant vector database operations."""
    
    def __init__(self):
        """Initialize Qdrant client with configuration from environment variables."""
        self.url = os.getenv('QDRANT_URL', 'https://a155b5ab-3dca-44ae-a3b7-7c8e0c472bbd.europe-west3-0.gcp.cloud.qdrant.io:6333')
        self.api_key = os.getenv('QDRANT_API_KEY')
        
        if not self.api_key:
            logger.error("QDRANT_API_KEY environment variable is required")
            raise ValueError("QDRANT_API_KEY environment variable is required")
        
        self.client = QdrantClient(
            url=self.url,
            api_key=self.api_key,
            timeout=30
        )
        
        # Collection name for document vectors
        self.collection_name = "document_vectors"
        self.vector_size = 1536  # OpenAI text-embedding-3-small dimension
        
        # Thread pool for async operations
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        logger.info(f"Qdrant client initialized with URL: {self.url[:50]}...")
        
    async def _run_in_executor(self, func, *args):
        """Run synchronous Qdrant operations in thread pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, func, *args)
    
    async def initialize_collection(self) -> bool:
        """Initialize the document vectors collection if it doesn't exist."""
        try:
            # Check if collection exists
            collections = await self._run_in_executor(self.client.get_collections)
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                logger.info(f"Creating collection: {self.collection_name}")
                await self._run_in_executor(
                    self.client.create_collection,
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Collection {self.collection_name} created successfully")
            else:
                logger.info(f"Collection {self.collection_name} already exists")
                
            return True
            
        except Exception as e:
            logger.error(f"Error initializing collection: {e}")
            return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Qdrant service health."""
        try:
            # Check client connection
            collections = await self._run_in_executor(self.client.get_collections)
            
            # Check if our collection exists and get info
            collection_info = None
            if any(col.name == self.collection_name for col in collections.collections):
                collection_info = await self._run_in_executor(
                    self.client.get_collection, 
                    self.collection_name
                )
            
            return {
                "status": "healthy",
                "collections_count": len(collections.collections),
                "collection_exists": collection_info is not None,
                "vector_count": collection_info.points_count if collection_info else 0,
                "url": self.url
            }
            
        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "url": self.url
            }
    
    async def store_document_vector(
        self, 
        document_id: int, 
        content_vector: List[float], 
        embedding_model: str = "text-embedding-3-small",
        user_id: Optional[int] = None
    ) -> bool:
        """Store a document vector in Qdrant."""
        try:
            point = PointStruct(
                id=document_id,
                vector=content_vector,
                payload={
                    "document_id": document_id,
                    "embedding_model": embedding_model,
                    "user_id": user_id
                }
            )
            
            result = await self._run_in_executor(
                self.client.upsert,
                collection_name=self.collection_name,
                points=[point]
            )
            
            if result.status == UpdateStatus.COMPLETED:
                logger.debug(f"Successfully stored vector for document {document_id}")
                return True
            else:
                logger.error(f"Failed to store vector for document {document_id}: {result}")
                return False
                
        except Exception as e:
            logger.error(f"Error storing document vector {document_id}: {e}")
            return False
    
    async def search_similar_documents(
        self, 
        query_vector: List[float], 
        user_id: Optional[int] = None,
        limit: int = 10, 
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for documents similar to the query vector."""
        try:
            # Build filter for user_id if provided
            query_filter = None
            if user_id is not None:
                query_filter = Filter(
                    must=[
                        FieldCondition(
                            key="user_id",
                            match=MatchValue(value=user_id)
                        )
                    ]
                )
            
            search_result = await self._run_in_executor(
                self.client.search,
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=limit,
                score_threshold=score_threshold
            )
            
            results = []
            for scored_point in search_result:
                results.append({
                    "document_id": scored_point.payload["document_id"],
                    "similarity": scored_point.score,
                    "user_id": scored_point.payload.get("user_id"),
                    "embedding_model": scored_point.payload.get("embedding_model")
                })
            
            logger.debug(f"Found {len(results)} similar documents")
            return results
            
        except Exception as e:
            logger.error(f"Error searching similar documents: {e}")
            return []
    
    async def delete_document_vector(self, document_id: int) -> bool:
        """Delete a document vector from Qdrant."""
        try:
            result = await self._run_in_executor(
                self.client.delete,
                collection_name=self.collection_name,
                points_selector=[document_id]
            )
            
            if result.status == UpdateStatus.COMPLETED:
                logger.debug(f"Successfully deleted vector for document {document_id}")
                return True
            else:
                logger.error(f"Failed to delete vector for document {document_id}: {result}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting document vector {document_id}: {e}")
            return False
    
    async def delete_user_vectors(self, user_id: int) -> bool:
        """Delete all vectors for a specific user."""
        try:
            # Use filter to delete all points for a user
            result = await self._run_in_executor(
                self.client.delete,
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="user_id",
                            match=MatchValue(value=user_id)
                        )
                    ]
                )
            )
            
            if result.status == UpdateStatus.COMPLETED:
                logger.info(f"Successfully deleted all vectors for user {user_id}")
                return True
            else:
                logger.error(f"Failed to delete vectors for user {user_id}: {result}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting vectors for user {user_id}: {e}")
            return False
    
    async def get_document_vector(self, document_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve a specific document vector."""
        try:
            points = await self._run_in_executor(
                self.client.retrieve,
                collection_name=self.collection_name,
                ids=[document_id],
                with_vectors=True
            )
            
            if points and len(points) > 0:
                point = points[0]
                return {
                    "document_id": point.payload["document_id"],
                    "vector": point.vector,
                    "user_id": point.payload.get("user_id"),
                    "embedding_model": point.payload.get("embedding_model")
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving document vector {document_id}: {e}")
            return None
    
    async def count_user_vectors(self, user_id: int) -> int:
        """Count vectors for a specific user."""
        try:
            result = await self._run_in_executor(
                self.client.count,
                collection_name=self.collection_name,
                count_filter=Filter(
                    must=[
                        FieldCondition(
                            key="user_id",
                            match=MatchValue(value=user_id)
                        )
                    ]
                )
            )
            
            return result.count
            
        except Exception as e:
            logger.error(f"Error counting vectors for user {user_id}: {e}")
            return 0
    
    async def close(self):
        """Close the Qdrant client and cleanup resources."""
        try:
            if hasattr(self, 'executor'):
                self.executor.shutdown(wait=True)
            if hasattr(self, 'client'):
                await self._run_in_executor(self.client.close)
            logger.info("Qdrant client closed successfully")
        except Exception as e:
            logger.error(f"Error closing Qdrant client: {e}")

# Global instance
qdrant_service = QdrantService()
