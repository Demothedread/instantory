# Bartleby Testing Guide

## Overview

This guide covers the comprehensive testing infrastructure for the Bartleby application, including unit tests, integration tests, and end-to-end testing.

## Test Structure

```
backend/tests/
├── __init__.py
├── conftest.py           # Test fixtures and configuration
├── unit/                 # Unit tests
│   ├── test_auth.py     # Authentication tests
│   ├── test_database.py # Database operations tests
│   ├── test_middleware.py # Middleware component tests
│   └── test_processor.py # File processor tests
├── integration/          # Integration tests
│   ├── test_api.py      # API endpoint tests
│   └── test_deployment.py # Deployment configuration tests
└── e2e/                 # End-to-end tests
    └── test_workflow.py # Complete workflow tests
```

## Running Tests

### Prerequisites

1. Install test dependencies:
```bash
pip install -r requirements-test.txt
```

2. Set up test environment:
```bash
# Create .env.test file
cp .env.example .env.test
# Edit .env.test with test configuration
```

3. Create test database:
```bash
createdb test_db
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/unit/          # Run unit tests
pytest tests/integration/   # Run integration tests
pytest tests/e2e/          # Run end-to-end tests

# Run with coverage report
pytest --cov=backend --cov-report=html

# Run tests in parallel
pytest -n auto

# Run tests with detailed output
pytest -v
```

## Test Categories

### Unit Tests

1. Authentication (`test_auth.py`):
   - Token generation and validation
   - Password hashing
   - Session management
   - Google OAuth integration

2. Database (`test_database.py`):
   - Connection pool management
   - Transaction handling
   - Query execution
   - Error recovery

3. Middleware (`test_middleware.py`):
   - CORS configuration
   - Security headers
   - Rate limiting
   - Request logging

4. Processor (`test_processor.py`):
   - Document processing
   - Image processing
   - Batch operations
   - Error handling

### Integration Tests

1. API Endpoints (`test_api.py`):
   - File upload
   - Document processing
   - Inventory management
   - Search functionality

2. Deployment (`test_deployment.py`):
   - Render configuration
   - Vercel configuration
   - Environment variables
   - Cross-service integration

### End-to-End Tests

Complete workflow testing (`test_workflow.py`):
- Document upload and processing
- Image upload and processing
- Batch processing
- Search functionality
- Error handling

## Troubleshooting

### Common Issues

1. Database Connection:
```python
# Error: Connection refused
# Solution: Check DATABASE_URL in .env.test
async def test_connection():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchval('SELECT 1')
        assert result == 1
```

2. Authentication:
```python
# Error: Unauthorized
# Solution: Verify auth_headers fixture
@pytest.fixture
async def auth_headers():
    token = await create_test_token()
    return {"Authorization": f"Bearer {token}"}
```

3. File Processing:
```python
# Error: Processing timeout
# Solution: Increase max_retries
max_retries = 20  # Increase for slower systems
while retry_count < max_retries:
    await asyncio.sleep(1)
```

### Debug Strategies

1. Enable verbose logging:
```bash
pytest -v --log-cli-level=DEBUG
```

2. Use pytest's built-in debugger:
```python
import pytest
def test_something():
    pytest.set_trace()  # Breakpoint
```

3. Print detailed information:
```python
def test_api_response(caplog):
    caplog.set_level(logging.DEBUG)
    response = await client.get('/api/endpoint')
    print(f"Response: {response.json()}")
```

## Deployment Testing

### Render Backend

1. Test environment variables:
```bash
pytest tests/integration/test_deployment.py::TestRenderDeployment
```

2. Test database migrations:
```bash
alembic upgrade head
pytest tests/integration/test_deployment.py::TestRenderDeployment::test_database_config
```

3. Test service configuration:
```bash
pytest tests/integration/test_deployment.py::TestRenderDeployment::test_render_yaml_structure
```

### Vercel Frontend

1. Test build configuration:
```bash
pytest tests/integration/test_deployment.py::TestVercelDeployment::test_vercel_config_structure
```

2. Test CORS settings:
```bash
pytest tests/integration/test_deployment.py::TestVercelDeployment::test_cors_config
```

## Best Practices

1. Test Isolation:
   - Use fixtures for setup/teardown
   - Clean up test data
   - Mock external services

2. Test Coverage:
   - Aim for high coverage
   - Focus on critical paths
   - Include edge cases

3. Test Organization:
   - Group related tests
   - Use descriptive names
   - Follow naming conventions

4. Asynchronous Testing:
   - Use pytest-asyncio
   - Handle timeouts
   - Clean up resources

## Contributing

1. Adding Tests:
   - Follow existing patterns
   - Include docstrings
   - Update documentation

2. Running CI:
   - Tests must pass
   - Coverage must meet threshold
   - Linting must pass

3. Code Review:
   - Review test coverage
   - Check edge cases
   - Verify documentation

## Maintenance

1. Regular Updates:
   - Update dependencies
   - Review test coverage
   - Update documentation

2. Performance:
   - Monitor test execution time
   - Optimize slow tests
   - Use parallel execution

3. Documentation:
   - Keep README updated
   - Document new features
   - Update troubleshooting guide
