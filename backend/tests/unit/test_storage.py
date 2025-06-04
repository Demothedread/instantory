"""Unit tests for storage components."""

import os
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from pathlib import Path

# Import with patch to avoid actual file system operations
with patch('os.makedirs'):
    from backend.config.storage import StorageType
    from backend.services.storage.vercel_blob import VercelBlobService

@pytest.fixture
def storage_config():
    """Create a test storage configuration."""
    # Set test environment variables
    with patch.dict(os.environ, {
        "STORAGE_BACKEND": "vercel",
        "BLOB_READ_WRITE_TOKEN": "test_token"
    }):
        from backend.config.storage import StorageConfig
        return StorageConfig()

def test_storage_type_enum():
    """Test the StorageType enum."""
    assert StorageType.DOCUMENT.value == "document"
    assert StorageType.IMAGE.value == "image"
    assert StorageType.THUMBNAIL.value == "thumbnail"
    assert StorageType.TEMP.value == "temp"
    assert StorageType.USER.value == "user"

def test_storage_config_paths(storage_config):
    """Test storage configuration paths are set correctly."""
    # Check that paths are initialized
    assert "TEMP_DIR" in storage_config.paths
    assert "UPLOADS_DIR" in storage_config.paths
    assert "DOCUMENT_DIRECTORY" in storage_config.paths
    
    # Check paths are Path objects
    assert isinstance(storage_config.paths["TEMP_DIR"], Path)

def test_storage_config_get_storage_info_temp(storage_config):
    """Test that get_storage_info returns local storage for temporary files."""
    backend, config = storage_config.get_storage_info(
        "application/octet-stream", 
        StorageType.TEMP
    )
    assert backend == "local"
    assert "base_path" in config

def test_storage_config_get_storage_info_vercel(storage_config):
    """Test that get_storage_info returns vercel for images."""
    backend, config = storage_config.get_storage_info(
        "image/jpeg", 
        StorageType.IMAGE
    )
    assert backend == "vercel"
    assert "token" in config
    assert "content_type" in config
    assert config["content_type"] == "image/jpeg"

@patch('aiohttp.ClientSession')
@pytest.mark.asyncio
async def test_vercel_blob_service_upload(mock_session):
    """Test the VercelBlobService upload_document method."""
    # Create mocks
    mock_session_instance = AsyncMock()
    mock_session.return_value.__aenter__.return_value = mock_session_instance
    
    mock_post_response = AsyncMock()
    mock_post_response.status = 200
    mock_post_response.json = AsyncMock(return_value={"url": "https://test-put-url", "blob": {"url": "https://test-blob-url"}})
    mock_session_instance.post.return_value.__aenter__.return_value = mock_post_response
    
    mock_put_response = AsyncMock()
    mock_put_response.status = 201
    mock_session_instance.put.return_value.__aenter__.return_value = mock_put_response
    
    # Create service with test token
    with patch.dict(os.environ, {"BLOB_READ_WRITE_TOKEN": "test_token"}):
        service = VercelBlobService()
    
    # Call upload_document
    url = await service.upload_document(
        b"test content",
        "test.txt",
        "text/plain"
    )
    
    # Check results
    assert url == "https://test-blob-url"
    
    # Check that the APIs were called correctly
    mock_session_instance.post.assert_called_once()
    mock_session_instance.put.assert_called_once()

@patch('aiohttp.ClientSession')
@pytest.mark.asyncio
async def test_vercel_blob_service_get_document(mock_session):
    """Test the VercelBlobService get_document method."""
    # Create mocks
    mock_session_instance = AsyncMock()
    mock_session.return_value.__aenter__.return_value = mock_session_instance
    
    mock_get_response = AsyncMock()
    mock_get_response.status = 200
    mock_get_response.read = AsyncMock(return_value=b"test content")
    mock_session_instance.get.return_value.__aenter__.return_value = mock_get_response
    
    # Create service
    with patch.dict(os.environ, {"BLOB_READ_WRITE_TOKEN": "test_token"}):
        service = VercelBlobService()
    
    # Call get_document
    content = await service.get_document("https://test-url")
    
    # Check results
    assert content == b"test content"
    mock_session_instance.get.assert_called_once_with("https://test-url")
