"""Integration tests for the storage system implementation."""

import pytest
import os
import io
import uuid
from pathlib import Path

# Set test environment variables
os.environ["BLOB_READ_WRITE_TOKEN"] = os.getenv("BLOB_READ_WRITE_TOKEN", "mock_token_for_testing")
os.environ["STORAGE_BACKEND"] = "vercel"

# Import after environment variables are set
from backend.config.storage import storage_config, StorageType
from backend.services.storage.manager import storage_manager
from backend.services.storage.vercel_blob import vercel_blob_service

@pytest.mark.asyncio
async def test_storage_config_initialization():
    """Test that storage configuration is properly initialized."""
    # Check that the config object exists
    assert storage_config is not None
    
    # Check default storage backend is vercel
    assert storage_config.storage_backend == "vercel"
    
    # Check paths are initialized
    assert "TEMP_DIR" in storage_config.paths
    assert "DOCUMENT_DIRECTORY" in storage_config.paths

@pytest.mark.asyncio
async def test_get_storage_info():
    """Test the get_storage_info method."""
    # Test document storage with Vercel configuration
    backend, config = storage_config.get_storage_info(
        "application/pdf", 
        StorageType.DOCUMENT
    )
    # Vercel should be the default for documents
    assert backend == "vercel"
    
    # Test temporary storage always uses local
    backend, config = storage_config.get_storage_info(
        "application/octet-stream", 
        StorageType.TEMP
    )
    assert backend == "local"
    assert "base_path" in config

@pytest.mark.asyncio
async def test_storage_manager_initialization():
    """Test storage manager initialization."""
    # Check storage manager instance
    assert storage_manager is not None
    
    # Check default storage type
    assert storage_manager.storage_type == "vercel"

@pytest.mark.skipif(
    not os.environ.get("RUN_STORAGE_INTEGRATION_TESTS"), 
    reason="Integration tests not enabled"
)
@pytest.mark.asyncio
async def test_vercel_blob_upload():
    """
    Test uploading to Vercel Blob storage.
    Only runs when RUN_STORAGE_INTEGRATION_TESTS is set.
    Requires a valid BLOB_READ_WRITE_TOKEN.
    """
    # Create test content
    test_content = f"Test content {uuid.uuid4()}"
    test_filename = f"test_{uuid.uuid4()}.txt"
    
    # Upload to Vercel Blob
    url = await vercel_blob_service.upload_document(
        test_content.encode('utf-8'),
        test_filename,
        "text/plain"
    )
    
    # Check URL was returned
    assert url is not None
    assert isinstance(url, str)
    assert url.startswith("http")
    
    # Download and verify content
    content = await vercel_blob_service.get_document(url)
    assert content is not None
    assert content.decode('utf-8') == test_content

@pytest.mark.skipif(
    not os.environ.get("RUN_STORAGE_INTEGRATION_TESTS"), 
    reason="Integration tests not enabled"
)
@pytest.mark.asyncio
async def test_storage_manager_store_file():
    """
    Test storing a file through the storage manager.
    Only runs when RUN_STORAGE_INTEGRATION_TESTS is set.
    """
    test_user_id = 9999  # Test user ID
    test_content = f"Test file content {uuid.uuid4()}"
    test_filename = f"test_{uuid.uuid4()}.txt"
    
    # Store a file
    file_url = await storage_manager.store_file(
        test_user_id,
        test_content.encode('utf-8'),
        test_filename,
        "text/plain",
        is_temporary=False
    )
    
    # Check URL was returned
    assert file_url is not None
    
    # Retrieve the file
    content = await storage_manager.get_file(file_url)
    assert content is not None
    assert content.decode('utf-8') == test_content
