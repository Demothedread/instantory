import pytest
import asyncpg
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

from backend.config.database import DatabaseConfig, get_db_pool

pytestmark = pytest.mark.asyncio

class TestDatabaseConfig:
    def test_database_url_required(self):
        with patch.dict('os.environ', clear=True):
            with pytest.raises(ValueError) as exc_info:
                DatabaseConfig()
            assert "DATABASE_URL" in str(exc_info.value)

    def test_parse_database_url(self):
        with patch.dict('os.environ', {'DATABASE_URL': 'postgresql://user:pass@host:5432/db'}):
            config = DatabaseConfig()
            assert config.user == 'user'
            assert config.password == 'pass'
            assert config.host == 'host'
            assert config.port == 5432
            assert config.database == 'db'

    async def test_pool_creation(self):
        config = DatabaseConfig()
        pool = await config.get_pool()
        
        assert isinstance(pool, asyncpg.Pool)
        assert pool._working_params.user == config.user
        assert pool._working_params.database == config.database
        
        await config.close_pool()

    async def test_pool_reuse(self):
        config = DatabaseConfig()
        pool1 = await config.get_pool()
        pool2 = await config.get_pool()
        
        assert pool1 is pool2
        
        await config.close_pool()

class TestConnectionPool:
    async def test_get_db_pool(self):
        pool = await get_db_pool()
        assert isinstance(pool, asyncpg.Pool)
        
        async with pool.acquire() as conn:
            result = await conn.fetchval('SELECT 1')
            assert result == 1

    async def test_pool_connection_limit(self):
        pool = await get_db_pool()
        connections = []
        
        # Try to acquire more connections than the pool limit
        for _ in range(15):  # Pool max_size is 10
            try:
                conn = await pool.acquire()
                connections.append(conn)
            except asyncpg.exceptions.TooManyConnectionsError:
                break
        
        assert len(connections) <= 10
        
        # Release all connections
        for conn in connections:
            await pool.release(conn)

    async def test_connection_timeout(self):
        pool = await get_db_pool()
        
        with pytest.raises(asyncpg.exceptions.ConnectionDoesNotExistError):
            async with pool.acquire(timeout=0.1) as conn:
                # Simulate a long-running query
                await conn.execute('SELECT pg_sleep(1)')

class TestTransactions:
    async def test_transaction_commit(self, db_pool):
        async with db_pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute("""
                    CREATE TEMP TABLE test_table (
                        id SERIAL PRIMARY KEY,
                        value TEXT
                    )
                """)
                
                await conn.execute(
                    "INSERT INTO test_table (value) VALUES ($1)",
                    "test value"
                )
                
                result = await conn.fetchval(
                    "SELECT value FROM test_table WHERE id = 1"
                )
                assert result == "test value"

    async def test_transaction_rollback(self, db_pool):
        async with db_pool.acquire() as conn:
            # Create test table
            await conn.execute("""
                CREATE TEMP TABLE test_table (
                    id SERIAL PRIMARY KEY,
                    value TEXT
                )
            """)
            
            try:
                async with conn.transaction():
                    await conn.execute(
                        "INSERT INTO test_table (value) VALUES ($1)",
                        "test value"
                    )
                    raise Exception("Trigger rollback")
            except Exception:
                pass
            
            # Verify the insert was rolled back
            count = await conn.fetchval("SELECT COUNT(*) FROM test_table")
            assert count == 0

class TestConnectionErrors:
    async def test_connection_error_handling(self):
        with patch('asyncpg.create_pool') as mock_create_pool:
            mock_create_pool.side_effect = asyncpg.exceptions.ConnectionDoesNotExistError
            
            with pytest.raises(Exception) as exc_info:
                await get_db_pool()
            
            assert "connection" in str(exc_info.value).lower()

    async def test_connection_retry(self):
        config = DatabaseConfig()
        
        # Mock failed connection attempts
        with patch('asyncpg.create_pool') as mock_create_pool:
            mock_create_pool.side_effect = [
                asyncpg.exceptions.ConnectionDoesNotExistError,
                asyncpg.exceptions.ConnectionDoesNotExistError,
                MagicMock()  # Succeed on third attempt
            ]
            
            pool = await config.get_pool()
            assert pool is not None

class TestPoolManagement:
    async def test_pool_cleanup(self):
        config = DatabaseConfig()
        pool = await config.get_pool()
        
        # Get initial connection count
        initial_count = len(pool._holders)
        
        # Create some connections
        async with pool.acquire():
            async with pool.acquire():
                pass
        
        # Verify connections are returned to pool
        assert len(pool._holders) == initial_count
        
        await config.close_pool()
        assert config._pool is None

    async def test_connection_leak_prevention(self, db_pool):
        initial_acquired = len(db_pool._holders)
        
        try:
            async with db_pool.acquire() as conn:
                raise Exception("Simulate error")
        except Exception:
            pass
        
        # Verify connection was returned despite error
        assert len(db_pool._holders) == initial_acquired

class TestQueryExecution:
    async def test_parameterized_query(self, db_pool):
        async with db_pool.acquire() as conn:
            # Create test table
            await conn.execute("""
                CREATE TEMP TABLE test_table (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    value INTEGER
                )
            """)
            
            # Test parameterized insert
            await conn.execute(
                "INSERT INTO test_table (name, value) VALUES ($1, $2)",
                "test", 123
            )
            
            # Verify with parameterized select
            result = await conn.fetchrow(
                "SELECT * FROM test_table WHERE name = $1",
                "test"
            )
            
            assert result["name"] == "test"
            assert result["value"] == 123

    async def test_bulk_operations(self, db_pool):
        async with db_pool.acquire() as conn:
            # Create test table
            await conn.execute("""
                CREATE TEMP TABLE test_table (
                    id SERIAL PRIMARY KEY,
                    value TEXT
                )
            """)
            
            # Test bulk insert
            values = [("value1",), ("value2",), ("value3",)]
            await conn.executemany(
                "INSERT INTO test_table (value) VALUES ($1)",
                values
            )
            
            # Verify count
            count = await conn.fetchval("SELECT COUNT(*) FROM test_table")
            assert count == 3
