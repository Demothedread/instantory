"""Tests for Qdrant vector database service."""

import pytest
import os
from unittest.mock import patch, MagicMock, AsyncMock
from backend.services.vector.qdrant_service import QdrantService


class TestQdrantService:
    """Test cases for QdrantService."""

    def test_init_with_api_key(self):
        """Test QdrantService initialization with API key."""
        with patch.dict(os.environ, {
            'QDRANT_API_KEY': 'test_api_key',
            'QDRANT_URL': 'https://test.qdrant.io'
        }):
            with patch('backend.services.vector.qdrant_service.QdrantClient') as mock_client:
                service = QdrantService()
                assert service.api_key == 'test_api_key'
                assert service.url == 'https://test.qdrant.io'
                mock_client.assert_called_once_with(
                    url='https://test.qdrant.io',
                    api_key='test_api_key',
                    timeout=30
                )

    def test_init_without_api_key_raises_error(self):
        """Test QdrantService initialization without API key raises ValueError."""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="QDRANT_API_KEY environment variable is required"):
                QdrantService()

    def test_init_with_default_url(self):
        """Test QdrantService initialization with default URL."""
        with patch.dict(os.environ, {
            'QDRANT_API_KEY': 'test_api_key'
        }):
            with patch('backend.services.vector.qdrant_service.QdrantClient') as mock_client:
                service = QdrantService()
                expected_url = 'https://a155b5ab-3dca-44ae-a3b7-7c8e0c472bbd.europe-west3-0.gcp.cloud.qdrant.io:6333'
                assert service.url == expected_url
                mock_client.assert_called_once_with(
                    url=expected_url,
                    api_key='test_api_key',
                    timeout=30
                )

    @pytest.mark.asyncio
    async def test_health_check_healthy(self):
        """Test health check when Qdrant is healthy."""
        with patch.dict(os.environ, {'QDRANT_API_KEY': 'test_api_key'}):
            with patch('backend.services.vector.qdrant_service.QdrantClient') as mock_client_class:
                mock_client = MagicMock()
                mock_client_class.return_value = mock_client
                
                # Mock collections response
                mock_collections = MagicMock()
                mock_collections.collections = [MagicMock(name='document_vectors')]
                
                # Mock collection info
                mock_collection_info = MagicMock()
                mock_collection_info.points_count = 100
                
                service = QdrantService()
                
                # Mock the executor calls
                service._run_in_executor = AsyncMock()
                service._run_in_executor.side_effect = [
                    mock_collections,  # get_collections call
                    mock_collection_info  # get_collection call
                ]
                
                result = await service.health_check()
                
                assert result['status'] == 'healthy'
                assert result['collections_count'] == 1
                assert result['collection_exists'] is True
                assert result['vector_count'] == 100

    @pytest.mark.asyncio
    async def test_health_check_unhealthy(self):
        """Test health check when Qdrant is unhealthy."""
        with patch.dict(os.environ, {'QDRANT_API_KEY': 'test_api_key'}):
            with patch('backend.services.vector.qdrant_service.QdrantClient') as mock_client_class:
                mock_client_class.return_value = MagicMock()
                
                service = QdrantService()
                
                # Mock the executor to raise an exception
                service._run_in_executor = AsyncMock()
                service._run_in_executor.side_effect = Exception("Connection failed")
                
                result = await service.health_check()
                
                assert result['status'] == 'unhealthy'
                assert 'error' in result
                assert result['error'] == 'Connection failed'

    @pytest.mark.asyncio
    async def test_store_document_vector(self):
        """Test storing a document vector."""
        with patch.dict(os.environ, {'QDRANT_API_KEY': 'test_api_key'}):
            with patch('backend.services.vector.qdrant_service.QdrantClient') as mock_client_class:
                mock_client_class.return_value = MagicMock()
                
                service = QdrantService()
                
                # Mock successful upsert
                mock_result = MagicMock()
                mock_result.status = 'completed'
                
                service._run_in_executor = AsyncMock()
                service._run_in_executor.return_value = mock_result
                
                # Test vector data
                document_id = 123
                content_vector = [0.1, 0.2, 0.3] + [0.0] * 1533  # 1536 dimensions
                
                result = await service.store_document_vector(
                    document_id=document_id,
                    content_vector=content_vector,
                    user_id=456
                )
                
                assert result is True
                service._run_in_executor.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_similar_documents(self):
        """Test searching for similar documents."""
        with patch.dict(os.environ, {'QDRANT_API_KEY': 'test_api_key'}):
            with patch('backend.services.vector.qdrant_service.QdrantClient') as mock_client_class:
                mock_client_class.return_value = MagicMock()
                
                service = QdrantService()
                
                # Mock search results
                mock_scored_point = MagicMock()
                mock_scored_point.payload = {
                    'document_id': 123,
                    'user_id': 456,
                    'embedding_model': 'text-embedding-3-small'
                }
                mock_scored_point.score = 0.85
                
                service._run_in_executor = AsyncMock()
                service._run_in_executor.return_value = [mock_scored_point]
                
                # Test search
                query_vector = [0.1, 0.2, 0.3] + [0.0] * 1533  # 1536 dimensions
                
                results = await service.search_similar_documents(
                    query_vector=query_vector,
                    user_id=456,
                    limit=10
                )
                
                assert len(results) == 1
                assert results[0]['document_id'] == 123
                assert results[0]['similarity'] == 0.85
                assert results[0]['user_id'] == 456
