import json
from pathlib import Path
from typing import Dict

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

class TestFileUploadAPI:
    async def test_upload_single_file(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str],
        mock_file_upload: Dict
    ):
        response = await test_client.post(
            "/api/files/upload",
            files=mock_file_upload,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert data["url"].startswith("https://")

    async def test_upload_multiple_files(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str],
        mock_file_upload: Dict,
        mock_image_upload: Dict
    ):
        files = {
            "file1": mock_file_upload["file"],
            "file2": mock_image_upload["file"]
        }
        
        response = await test_client.post(
            "/api/files/upload",
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert all("url" in item for item in data)

    async def test_upload_invalid_file_type(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        files = {
            "file": ("test.exe", b"test content", "application/octet-stream")
        }
        
        response = await test_client.post(
            "/api/files/upload",
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["error"]

    async def test_upload_without_auth(
        self,
        test_client: AsyncClient,
        mock_file_upload: Dict
    ):
        response = await test_client.post(
            "/api/files/upload",
            files=mock_file_upload
        )
        
        assert response.status_code == 401

class TestFileProcessingAPI:
    async def test_process_document(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str],
        mock_processor_response: Dict
    ):
        # First upload a file
        upload_response = await test_client.post(
            "/api/files/upload",
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            headers=auth_headers
        )
        
        file_url = upload_response.json()["url"]
        
        # Then process it
        response = await test_client.post(
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
        
        assert response.status_code == 200
        data = response.json()
        assert "task_id" in data

    async def test_process_image(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str],
        mock_processor_response: Dict
    ):
        # First upload an image
        upload_response = await test_client.post(
            "/api/files/upload",
            files={"file": ("test.jpg", b"test content", "image/jpeg")},
            headers=auth_headers
        )
        
        file_url = upload_response.json()["url"]
        
        # Then process it
        response = await test_client.post(
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
        
        assert response.status_code == 200
        data = response.json()
        assert "task_id" in data

    async def test_processing_status(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        # First start a processing task
        process_response = await test_client.post(
            "/api/process-files",
            json={
                "files": [{
                    "originalName": "test.pdf",
                    "blobUrl": "https://test-storage.com/test.pdf",
                    "fileType": "document"
                }],
                "instruction": "Test instruction"
            },
            headers=auth_headers
        )
        
        task_id = process_response.json()["task_id"]
        
        # Then check its status
        response = await test_client.get(
            f"/api/processing-status/{task_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "progress" in data
        assert "message" in data

    async def test_invalid_task_id(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        response = await test_client.get(
            "/api/processing-status/invalid-task-id",
            headers=auth_headers
        )
        
        assert response.status_code == 404

class TestInventoryAPI:
    async def test_create_inventory_item(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str],
        mock_processor_response: Dict
    ):
        response = await test_client.post(
            "/api/inventory",
            json={
                "name": "Test Item",
                "description": "Test description",
                "category": "test",
                "image_url": "https://test-storage.com/test.jpg"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Item"
        assert "id" in data

    async def test_get_inventory_items(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        response = await test_client.get(
            "/api/inventory",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_search_inventory(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        response = await test_client.get(
            "/api/inventory/search",
            params={"query": "test", "category": "test"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestDocumentsAPI:
    async def test_create_document(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str],
        mock_processor_response: Dict
    ):
        response = await test_client.post(
            "/api/documents",
            json={
                "title": "Test Document",
                "content": "Test content",
                "category": "test",
                "file_url": "https://test-storage.com/test.pdf"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Document"
        assert "id" in data

    async def test_get_documents(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        response = await test_client.get(
            "/api/documents",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_search_documents(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        response = await test_client.post(
            "/api/documents/search",
            json={"query": "test content"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)

    async def test_download_document(
        self,
        test_client: AsyncClient,
        auth_headers: Dict[str, str]
    ):
        # First create a document
        create_response = await test_client.post(
            "/api/documents",
            json={
                "title": "Test Document",
                "content": "Test content",
                "category": "test",
                "file_url": "https://test-storage.com/test.pdf"
            },
            headers=auth_headers
        )
        
        doc_id = create_response.json()["id"]
        
        # Then try to download it
        response = await test_client.get(
            f"/api/documents/{doc_id}/file",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
