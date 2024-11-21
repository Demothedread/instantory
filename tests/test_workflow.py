import os
import asyncio
import shutil
from pathlib import Path
import pytest
from quart import Quart
from httpx import AsyncClient
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.server import app as quart_app
from main import DOCUMENT_DIRECTORY, initialize_database

# Test data directory
TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(TEST_DATA_DIR, exist_ok=True)

# Sample test files
SAMPLE_DOC = os.path.join(TEST_DATA_DIR, 'sample.pdf')
SAMPLE_IMAGE = os.path.join(TEST_DATA_DIR, 'sample.jpg')

def create_sample_files():
    """Create sample test files."""
    # Create a simple PDF
    with open(SAMPLE_DOC, 'w') as f:
        f.write("Sample PDF content for testing\nTitle: Test Document\nAuthor: Test Author")
    
    # Create a simple image
    from PIL import Image
    img = Image.new('RGB', (100, 100), color='red')
    img.save(SAMPLE_IMAGE)

@pytest.fixture
async def client():
    """Create test client."""
    app = Quart(__name__)
    app.config.update({
        "TESTING": True,
    })
    
    async with AsyncClient(app=quart_app, base_url="http://test") as client:
        yield client

@pytest.fixture(autouse=True)
def setup_and_cleanup():
    """Set up test environment and clean up after tests."""
    # Set up
    create_sample_files()
    
    yield
    
    # Clean up
    shutil.rmtree(TEST_DATA_DIR, ignore_errors=True)
    if os.path.exists(DOCUMENT_DIRECTORY):
        shutil.rmtree(DOCUMENT_DIRECTORY)

async def test_document_upload(client):
    """Test document upload and processing."""
    # Upload document
    files = {'files': ('test.pdf', open(SAMPLE_DOC, 'rb'), 'application/pdf')}
    response = await client.post('/process-files', files=files)
    assert response.status_code == 200
    
    # Verify document in Document Vault
    response = await client.get('/api/document-vault')
    assert response.status_code == 200
    documents = response.json()
    assert len(documents) > 0
    assert documents[0]['title'] == 'Test Document'
    
    # Verify document text retrieval
    doc_id = documents[0]['id']
    response = await client.get(f'/api/document-vault/{doc_id}/text')
    assert response.status_code == 200
    assert 'text' in response.json()

async def test_image_upload(client):
    """Test image upload and processing."""
    # Upload image
    files = {'files': ('test.jpg', open(SAMPLE_IMAGE, 'rb'), 'image/jpeg')}
    response = await client.post('/process-files', files=files)
    assert response.status_code == 200
    
    # Verify image in Products
    response = await client.get('/api/inventory')
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert 'image_url' in products[0]

async def test_document_search(client):
    """Test document search functionality."""
    # Upload document first
    files = {'files': ('test.pdf', open(SAMPLE_DOC, 'rb'), 'application/pdf')}
    await client.post('/process-files', files=files)
    
    # Test search
    response = await client.post('/api/document-vault/search', json={
        'query': 'Test Document',
        'field': 'metadata'
    })
    assert response.status_code == 200
    results = response.json()['results']
    assert len(results) > 0
    assert 'Test Document' in results[0]['title']

if __name__ == '__main__':
    pytest.main([__file__])
