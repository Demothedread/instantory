# Bartleby Backend Testing Guide

## Overview

This guide covers the testing infrastructure for the Bartleby backend, including unit tests, integration tests, and deployment testing strategies.

## Test Structure

```
backend/
├── tests/
│   ├── conftest.py           # Test configuration and fixtures
│   ├── unit/                 # Unit tests
│   │   ├── test_auth.py
│   │   ├── test_processor.py
│   │   └── test_routes.py
│   └── integration/          # Integration tests
│       ├── test_api.py
│       └── test_database.py
├── pytest.ini               # Pytest configuration
└── requirements-test.txt    # Test dependencies
```

## Setup

1. Install test dependencies:
```bash
pip install -r requirements-test.txt
```

2. Run tests:
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=backend

# Run specific test file
pytest tests/unit/test_auth.py

# Run tests in parallel
pytest -n auto

# Run tests with verbose output
pytest -v
```

## Test Configuration

### Environment Variables

Create a `.env.test` file:
```env
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/test_db
OPENAI_API_KEY=test-key
BLOB_READ_WRITE_TOKEN=test-token
JWT_SECRET=test-secret
SESSION_SECRET=test-session-secret
COOKIE_SECRET=test-cookie-secret
```

### Database Setup

1. Create test database:
```sql
CREATE DATABASE test_db;
```

2. Run migrations:
```bash
alembic upgrade head
```

## Testing Components

### Authentication

Tests cover:
- User session management
- Token generation and validation
- Google OAuth integration
- Error handling
- Cookie management

### File Processing

Tests cover:
- Document analysis
- Image processing
- Batch operations
- OpenAI integration
- Error handling

### Database Operations

Tests cover:
- Connection pool management
- CRUD operations
- Transaction handling
- Error recovery
- Connection leaks

### API Routes

Tests cover:
- Request validation
- Response formatting
- Error handling
- Authentication middleware
- Rate limiting

## Writing Tests

### Unit Tests

Example:
```python
import pytest
from backend.services.processor import DocumentProcessor

def test_document_processor():
    processor = DocumentProcessor()
    result = processor.process_document("test.pdf")
    assert result.status == "success"
    assert result.metadata is not None
```

### Integration Tests

Example:
```python
async def test_file_upload_flow(client, auth_headers):
    # Upload file
    response = await client.post(
        "/api/files/upload",
        files={"file": ("test.pdf", b"test content")},
        headers=auth_headers
    )
    assert response.status_code == 200
    
    # Process file
    file_id = response.json()["id"]
    response = await client.post(
        f"/api/files/{file_id}/process",
        headers=auth_headers
    )
    assert response.status_code == 200
```

## Deployment Testing

### Render Deployment

1. Environment Configuration:
   - Verify environment variables in Render dashboard
   - Test database connection string
   - Validate service configuration

2. Build Process:
   ```bash
   # Test build locally
   docker build -t bartleby-backend .
   ```

3. Database Migration:
   - Test migration scripts
   - Verify rollback procedures
   - Check data integrity

### Common Issues

1. Database Connections:
   - Connection pool exhaustion
   - Transaction timeouts
   - SSL certificate validation

2. API Integration:
   - OpenAI rate limits
   - Token expiration
   - Request timeouts

3. File Processing:
   - Memory usage
   - Processing timeouts
   - Storage limitations

## Best Practices

1. Test Isolation:
   - Use fixtures for setup/teardown
   - Clean up test data
   - Mock external services

2. Database Testing:
   - Use transactions for cleanup
   - Avoid test data pollution
   - Mock long-running queries

3. API Testing:
   - Test error scenarios
   - Validate response formats
   - Check status codes

4. Performance Testing:
   - Monitor memory usage
   - Check response times
   - Test concurrent requests

## Troubleshooting

### Common Test Failures

1. Async Operations:
```python
# Wrong
result = processor.process()

# Correct
result = await processor.process()
```

2. Database Transactions:
```python
# Wrong
async def test_db():
    await db.execute(query)

# Correct
async def test_db():
    async with db.transaction():
        await db.execute(query)
```

3. Authentication:
```python
# Wrong
response = await client.get("/api/protected")

# Correct
response = await client.get("/api/protected", headers=auth_headers)
```

### Debug Strategies

1. Logging:
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_with_logging():
    logger.debug("Test debug info")
```

2. Database Queries:
```python
async def test_db_queries():
    async with db.acquire() as conn:
        await conn.execute("SET log_statement = 'all'")
        # Run test
```

3. API Responses:
```python
async def test_api():
    response = await client.get("/api/endpoint")
    print(f"Response: {response.json()}")
```

## Maintenance

1. Regular Updates:
   - Update dependencies
   - Review test coverage
   - Update documentation

2. Performance Monitoring:
   - Track test execution time
   - Monitor resource usage
   - Identify bottlenecks

3. Code Quality:
   - Run linters
   - Check type hints
   - Review error handling

## Contributing

1. Adding Tests:
   - Follow naming conventions
   - Include docstrings
   - Add type hints

2. Updating Tests:
   - Review affected components
   - Update related tests
   - Check coverage

3. Pull Requests:
   - Run full test suite
   - Update documentation
   - Review test results
