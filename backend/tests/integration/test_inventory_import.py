"""Integration test for inventory import fix."""
import pytest
from unittest.mock import patch
import importlib

@pytest.mark.asyncio
async def test_inventory_import():
    """Test that inventory.py correctly imports get_db_pool."""
    # Use importlib to reload the module to ensure we get the latest version
    with patch('backend.config.database.get_db_pool') as mock_get_db_pool:
        # Set up the mock to return a simple value
        mock_get_db_pool.return_value = "test_pool"
        
        # Import the inventory module
        from backend.routes import inventory
        
        # Try to access get_db_pool from the module
        # This will fail if the import is incorrect
        try:
            # Attempt to use the imported function
            pool = await inventory.get_db_pool()
            assert pool == "test_pool"
        except (ImportError, AttributeError) as e:
            pytest.fail(f"Failed to import or use get_db_pool correctly: {e}")