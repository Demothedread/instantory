
"""Unit tests for inventory routes."""
import pytest
import asyncio
from unittest.mock import patch, MagicMock
from quart import Quart

from backend.routes.inventory import inventory_bp, get_inventory, create_inventory_item, search_inventory
from backend.config.database import get_db_pool


@pytest.fixture
def app():
    """Create a test app with inventory blueprint registered."""
    app = Quart(__name__)
    app.register_blueprint(inventory_bp)
    return app


@pytest.fixture
def mock_db_pool():
    """Mock database pool for testing."""
    mock_pool = MagicMock()
    mock_conn = MagicMock()
    mock_pool.__aenter__.return_value = mock_pool
    mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
    return mock_pool, mock_conn


class TestInventoryRoutes:
    """Test cases for inventory routes."""
    
    @pytest.mark.asyncio
    @patch('backend.routes.inventory.get_db_pool')
    async def test_get_inventory(self, mock_get_db_pool, app, mock_db_pool):
        """Test getting inventory items."""
        pool, conn = mock_db_pool
        mock_get_db_pool.return_value = pool
        
        # Mock database response
        mock_rows = [
            {
                'id': 1, 
                'name': 'Test Item', 
                'description': 'Test description',
                'category': 'test',
                'image_url': 'https://example.com/image.jpg'
            }
        ]
        conn.fetch.return_value = mock_rows
        
        # Test endpoint
        client = app.test_client()
        response = await client.get('/api/inventory?user_id=1')
        
        # Verify response
        assert response.status_code == 200
        data = await response.get_json()
        assert len(data) == 1
        assert data[0]['name'] == 'Test Item'
        
        # Verify correct SQL was executed
        conn.fetch.assert_called_once()
        call_args = conn.fetch.call_args[0][0]
        assert 'FROM user_inventory' in call_args
        assert 'LEFT JOIN inventory_assets' in call_args

    @pytest.mark.asyncio
    @patch('backend.routes.inventory.get_db_pool')
    async def test_get_inventory_error(self, mock_get_db_pool, app, mock_db_pool):
        """Test error handling when getting inventory items."""
        pool, conn = mock_db_pool
        mock_get_db_pool.return_value = pool
        
        # Mock database error
        conn.fetch.side_effect = Exception("Database error")
        
        # Test endpoint
        client = app.test_client()
        response = await client.get('/api/inventory?user_id=1')
        
        # Verify response
        assert response.status_code == 500
        data = await response.get_json()
        assert 'error' in data

    @pytest.mark.asyncio
    @patch('backend.routes.inventory.get_db_pool')
    async def test_create_inventory_item(self, mock_get_db_pool, app, mock_db_pool):
        """Test creating a new inventory item."""
        pool, conn = mock_db_pool
        mock_get_db_pool.return_value = pool
        
        # Mock database response
        mock_row = {
            'id': 1, 
            'name': 'New Item', 
            'description': 'New description',
            'category': 'test'
        }
        conn.fetchrow.return_value = mock_row
        
        # Test endpoint
        client = app.test_client()
        response = await client.post('/api/inventory', json={
            'user_id': 1,
            'name': 'New Item',
            'description': 'New description',
            'category': 'test',
            'image_url': 'https://example.com/image.jpg'
        })
        
        # Verify response
        assert response.status_code == 200
        data = await response.get_json()
        assert data['name'] == 'New Item'
        
        # Verify correct SQL was executed
        conn.fetchrow.assert_called_once()
        call_args = conn.fetchrow.call_args[0][0]
        assert 'INSERT INTO user_inventory' in call_args

    @pytest.mark.asyncio
    @patch('backend.routes.inventory.get_db_pool')
    async def test_search_inventory(self, mock_get_db_pool, app, mock_db_pool):
        """Test searching inventory items."""
        pool, conn = mock_db_pool
        mock_get_db_pool.return_value = pool
        
        # Mock database response
        mock_rows = [
            {
                'id': 1, 
                'name': 'Searchable Item', 
                'description': 'Contains search term',
                'category': 'test',
                'image_url': 'https://example.com/image.jpg'
            }
        ]
        conn.fetch.return_value = mock_rows
        
        # Test endpoint
        client = app.test_client()
        response = await client.get('/api/inventory/search?user_id=1&query=search&category=test')
        
        # Verify response
        assert response.status_code == 200
        data = await response.get_json()
        assert len(data) == 1
        assert 'search' in data[0]['description'].lower()
        
        # Verify correct SQL was executed
        conn.fetch.assert_called_once()
        call_args = conn.fetch.call_args[0][0]
        assert 'WHERE' in call_args
        assert 'ILIKE' in call_args


if __name__ == '__main__':
    pytest.main(['-xvs', __file__])