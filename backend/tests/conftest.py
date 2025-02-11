import asyncio
import os
from typing import AsyncGenerator, Dict, Generator

import asyncpg
import pytest
import pytest_asyncio
from dotenv import load_dotenv
from httpx import AsyncClient
from openai import AsyncOpenAI
from quart import Quart

# Set testing mode before importing app
os.environ['TESTING'] = 'true'

# Load test environment variables
load_dotenv(".env.test")

# Import app after setting environment
from backend.server import app

# Configure app for testing
app.config['TESTING'] = True

from backend.config.database import DatabaseConfig, get_db_pool
from backend.services.processor import create_processor_factory

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session")
async def db_pool() -> AsyncGenerator[asyncpg.Pool, None]:
    """Create a database connection pool."""
    pool = await get_db_pool()
    yield pool
    await pool.close()

@pytest_asyncio.fixture(scope="session")
async def test_client() -> AsyncGenerator[AsyncClient, None]:
    """Create a test client for making HTTP requests."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture(scope="session")
def openai_client() -> AsyncOpenAI:
    """Create an OpenAI client instance."""
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@pytest_asyncio.fixture
async def auth_headers() -> Dict[str, str]:
    """Generate authentication headers for test requests."""
    # TODO: Implement test token generation
    return {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
    }

@pytest_asyncio.fixture
async def processor_factory(db_pool: asyncpg.Pool, openai_client: AsyncOpenAI):
    """Create a processor factory instance."""
    return create_processor_factory(db_pool, openai_client)

@pytest.fixture(autouse=True)
async def setup_test_database(db_pool: asyncpg.Pool) -> AsyncGenerator[None, None]:
    """Set up a clean test database before each test."""
    async with db_pool.acquire() as conn:
        # Start a transaction
        tr = conn.transaction()
        await tr.start()
        
        try:
            # Create test tables
            await conn.execute("""
                -- Create tables if they don't exist
                CREATE TABLE IF NOT EXISTS test_users (
                    id SERIAL PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT
                );

                CREATE TABLE IF NOT EXISTS test_documents (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES test_users(id),
                    title TEXT NOT NULL,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- Add more test tables as needed
            """)
            
            yield
            
            # Rollback the transaction to clean up
            await tr.rollback()
        except Exception as e:
            await tr.rollback()
            raise e

@pytest.fixture
def mock_file_upload():
    """Create a mock file for upload testing."""
    return {
        "file": ("test.pdf", b"test content", "application/pdf")
    }

@pytest.fixture
def mock_image_upload():
    """Create a mock image for upload testing."""
    return {
        "file": ("test.jpg", b"test image content", "image/jpeg")
    }

@pytest.fixture
def mock_user_data():
    """Create mock user data for testing."""
    return {
        "id": 1,
        "email": "test@example.com",
        "name": "Test User"
    }

@pytest.fixture
def mock_document_data():
    """Create mock document data for testing."""
    return {
        "id": 1,
        "title": "Test Document",
        "content": "Test content for document analysis",
        "user_id": 1
    }

@pytest.fixture
def mock_processor_response():
    """Create mock processor response for testing."""
    return {
        "status": "completed",
        "metadata": {
            "title": "Test Document",
            "summary": "Test summary",
            "keywords": ["test", "document"],
            "category": "test"
        }
    }

@pytest_asyncio.fixture
async def cleanup_test_data(db_pool: asyncpg.Pool):
    """Clean up test data after tests."""
    yield
    async with db_pool.acquire() as conn:
        await conn.execute("""
            DELETE FROM test_documents;
            DELETE FROM test_users;
        """)

@pytest.fixture(autouse=True)
def mock_blob_storage(monkeypatch):
    """Mock blob storage operations."""
    def mock_upload(*args, **kwargs):
        return "https://test-storage.com/test-file"
    
    def mock_download(*args, **kwargs):
        return b"test content"
    
    monkeypatch.setattr("backend.services.storage.upload_blob", mock_upload)
    monkeypatch.setattr("backend.services.storage.download_blob", mock_download)

@pytest.fixture(autouse=True)
def mock_openai_response(monkeypatch):
    """Mock OpenAI API responses."""
    def mock_completion(*args, **kwargs):
        return {
            "choices": [{
                "text": "Mocked OpenAI response",
                "finish_reason": "stop"
            }]
        }
    
    monkeypatch.setattr("openai.Completion.create", mock_completion)

@pytest.fixture
def mock_env_vars(monkeypatch):
    """Set environment variables for testing."""
    test_vars = {
        "DATABASE_URL": "postgresql://test:test@localhost/test_db",
        "OPENAI_API_KEY": "test-key",
        "BLOB_READ_WRITE_TOKEN": "test-token",
        "JWT_SECRET": "test-secret",
        "SESSION_SECRET": "test-session",
        "COOKIE_SECRET": "test-cookie"
    }
    
    for key, value in test_vars.items():
        monkeypatch.setenv(key, value)
    
    return test_vars
