import pytest
import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

from httpx import AsyncClient
from backend.server import app

pytestmark = pytest.mark.asyncio

class TestEndToEndWorkflow:
    async def test_complete_document_workflow(
        self,
        test_client: AsyncClient,
        auth_headers: dict,
        mock_file_upload: dict,
        mock_processor_response: dict
    ):
        """Test complete workflow from document upload to display."""
        
        # 1. Upload document
        upload_response = await test_client.post(
            "/api/files/upload",
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            headers=auth_headers
        )
        
        assert upload_response.status_code == 200
        file_url = upload_response.json()["url"]
        
        # 2. Process document
        process_response = await test_client.post(
            "/api/process-files",
            json={
                "files": [{
                    "originalName": "test.pdf",
                    "blobUrl": file_url,
                    "fileType": "document"
                }],
                "instruction": "Test instruction"
            },
            headers=auth_headers
        )
        
        assert process_response.status_code == 200
        task_id = process_response.json()["task_id"]
        
        # 3. Poll processing status
        max_retries = 10
        retry_count = 0
        processing_complete = False
        
        while retry_count < max_retries and not processing_complete:
            status_response = await test_client.get(
                f"/api/processing-status/{task_id}",
                headers=auth_headers
            )
            
            assert status_response.status_code == 200
            status_data = status_response.json()
            
            if status_data["status"] == "completed":
                processing_complete = True
            elif status_data["status"] == "failed":
                pytest.fail("Processing failed")
            else:
                retry_count += 1
                await asyncio.sleep(1)
        
        assert processing_complete, "Processing timed out"
        
        # 4. Verify document in database
        docs_response = await test_client.get(
            "/api/documents",
            headers=auth_headers
        )
        
        assert docs_response.status_code == 200
        documents = docs_response.json()
        assert len(documents) > 0
        
        # Find our document
        test_doc = next(
            (doc for doc in documents if doc["file_url"] == file_url),
            None
        )
        assert test_doc is not None

    async def test_complete_image_workflow(
        self,
        test_client: AsyncClient,
        auth_headers: dict,
        mock_image_upload: dict,
        mock_processor_response: dict
    ):
        """Test complete workflow from image upload to inventory display."""
        
        # 1. Upload image
        upload_response = await test_client.post(
            "/api/files/upload",
            files={"file": ("test.jpg", b"test content", "image/jpeg")},
            headers=auth_headers
        )
        
        assert upload_response.status_code == 200
        file_url = upload_response.json()["url"]
        
        # 2. Process image
        process_response = await test_client.post(
            "/api/process-files",
            json={
                "files": [{
                    "originalName": "test.jpg",
                    "blobUrl": file_url,
                    "fileType": "image"
                }],
                "instruction": "Test instruction"
            },
            headers=auth_headers
        )
        
        assert process_response.status_code == 200
        task_id = process_response.json()["task_id"]
        
        # 3. Poll processing status
        max_retries = 10
        retry_count = 0
        processing_complete = False
        
        while retry_count < max_retries and not processing_complete:
            status_response = await test_client.get(
                f"/api/processing-status/{task_id}",
                headers=auth_headers
            )
            
            assert status_response.status_code == 200
            status_data = status_response.json()
            
            if status_data["status"] == "completed":
                processing_complete = True
            elif status_data["status"] == "failed":
                pytest.fail("Processing failed")
            else:
                retry_count += 1
                await asyncio.sleep(1)
        
        assert processing_complete, "Processing timed out"
        
        # 4. Verify inventory item in database
        inventory_response = await test_client.get(
            "/api/inventory",
            headers=auth_headers
        )
        
        assert inventory_response.status_code == 200
        inventory = inventory_response.json()
        assert len(inventory) > 0
        
        # Find our item
        test_item = next(
            (item for item in inventory if item["image_url"] == file_url),
            None
        )
        assert test_item is not None

    async def test_batch_processing_workflow(
        self,
        test_client: AsyncClient,
        auth_headers: dict,
        mock_processor_response: dict
    ):
        """Test processing multiple files in a batch."""
        
        # 1. Upload multiple files
        files = {
            "file1": ("test1.pdf", b"test content 1", "application/pdf"),
            "file2": ("test2.jpg", b"test content 2", "image/jpeg"),
            "file3": ("test3.pdf", b"test content 3", "application/pdf")
        }
        
        upload_response = await test_client.post(
            "/api/files/upload",
            files=files,
            headers=auth_headers
        )
        
        assert upload_response.status_code == 200
        uploaded_files = upload_response.json()
        assert len(uploaded_files) == 3
        
        # 2. Process batch
        process_response = await test_client.post(
            "/api/process-files",
            json={
                "files": [
                    {
                        "originalName": name,
                        "blobUrl": file_info["url"],
                        "fileType": "document" if name.endswith(".pdf") else "image"
                    }
                    for name, file_info in zip(files.keys(), uploaded_files)
                ],
                "instruction": "Test batch instruction"
            },
            headers=auth_headers
        )
        
        assert process_response.status_code == 200
        task_id = process_response.json()["task_id"]
        
        # 3. Poll processing status with progress tracking
        max_retries = 15
        retry_count = 0
        processing_complete = False
        last_progress = -1
        
        while retry_count < max_retries and not processing_complete:
            status_response = await test_client.get(
                f"/api/processing-status/{task_id}",
                headers=auth_headers
            )
            
            assert status_response.status_code == 200
            status_data = status_response.json()
            
            # Verify progress is increasing
            if "progress" in status_data:
                assert status_data["progress"] >= last_progress
                last_progress = status_data["progress"]
            
            if status_data["status"] == "completed":
                processing_complete = True
            elif status_data["status"] == "failed":
                pytest.fail("Batch processing failed")
            else:
                retry_count += 1
                await asyncio.sleep(1)
        
        assert processing_complete, "Batch processing timed out"
        
        # 4. Verify results
        # Check documents
        docs_response = await test_client.get(
            "/api/documents",
            headers=auth_headers
        )
        assert docs_response.status_code == 200
        documents = docs_response.json()
        
        pdf_urls = [
            file_info["url"]
            for name, file_info in zip(files.keys(), uploaded_files)
            if name.endswith(".pdf")
        ]
        
        for url in pdf_urls:
            assert any(doc["file_url"] == url for doc in documents)
        
        # Check inventory
        inventory_response = await test_client.get(
            "/api/inventory",
            headers=auth_headers
        )
        assert inventory_response.status_code == 200
        inventory = inventory_response.json()
        
        image_urls = [
            file_info["url"]
            for name, file_info in zip(files.keys(), uploaded_files)
            if name.endswith(".jpg")
        ]
        
        for url in image_urls:
            assert any(item["image_url"] == url for item in inventory)

    async def test_error_handling_workflow(
        self,
        test_client: AsyncClient,
        auth_headers: dict
    ):
        """Test error handling throughout the workflow."""
        
        # 1. Test invalid file type
        upload_response = await test_client.post(
            "/api/files/upload",
            files={"file": ("test.exe", b"test content", "application/octet-stream")},
            headers=auth_headers
        )
        
        assert upload_response.status_code == 400
        assert "error" in upload_response.json()
        
        # 2. Test processing without files
        process_response = await test_client.post(
            "/api/process-files",
            json={"files": [], "instruction": "Test instruction"},
            headers=auth_headers
        )
        
        assert process_response.status_code == 400
        assert "error" in process_response.json()
        
        # 3. Test invalid task ID
        status_response = await test_client.get(
            "/api/processing-status/invalid-task-id",
            headers=auth_headers
        )
        
        assert status_response.status_code == 404
        
        # 4. Test unauthorized access
        unauth_response = await test_client.get(
            "/api/documents",
            headers={}  # No auth headers
        )
        
        assert unauth_response.status_code == 401

    async def test_search_functionality(
        self,
        test_client: AsyncClient,
        auth_headers: dict,
        mock_processor_response: dict
    ):
        """Test search functionality across documents and inventory."""
        
        # 1. Create test data
        # Upload and process a document
        doc_response = await test_client.post(
            "/api/documents",
            json={
                "title": "Test Search Document",
                "content": "Unique test content for searching",
                "category": "test",
                "file_url": "https://test-storage.com/test.pdf"
            },
            headers=auth_headers
        )
        assert doc_response.status_code == 200
        
        # Create inventory item
        inv_response = await test_client.post(
            "/api/inventory",
            json={
                "name": "Test Search Item",
                "description": "Unique test description for searching",
                "category": "test",
                "image_url": "https://test-storage.com/test.jpg"
            },
            headers=auth_headers
        )
        assert inv_response.status_code == 200
        
        # 2. Test document search
        doc_search_response = await test_client.post(
            "/api/documents/search",
            json={"query": "unique test content"},
            headers=auth_headers
        )
        
        assert doc_search_response.status_code == 200
        doc_results = doc_search_response.json()["results"]
        assert len(doc_results) > 0
        assert any("unique test content" in result["content"].lower() for result in doc_results)
        
        # 3. Test inventory search
        inv_search_response = await test_client.get(
            "/api/inventory/search",
            params={"query": "unique test description"},
            headers=auth_headers
        )
        
        assert inv_search_response.status_code == 200
        inv_results = inv_search_response.json()
        assert len(inv_results) > 0
        assert any("unique test description" in item["description"].lower() for item in inv_results)
        
        # 4. Test category filtering
        category_response = await test_client.get(
            "/api/inventory/search",
            params={"category": "test"},
            headers=auth_headers
        )
        
        assert category_response.status_code == 200
        category_results = category_response.json()
        assert len(category_results) > 0
        assert all(item["category"] == "test" for item in category_results)
