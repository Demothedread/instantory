"""Unit tests for database configuration handling."""

import logging

import pytest

from backend.config import database as database_module
from backend.config.database import DatabaseConfig, DatabaseType, get_db_pool


def _clear_database_env(monkeypatch):
    for env_var in [
        "DATABASE_URL",
        "NEON_DATABASE_URL",
        "VECTOR_DATABASE_URL",
        "METADATA_DATABASE_URL",
    ]:
        monkeypatch.delenv(env_var, raising=False)


def test_database_config_missing_urls_logs_warning(monkeypatch, caplog):
    """A missing configuration should log a warning rather than raising."""

    _clear_database_env(monkeypatch)

    with caplog.at_level(logging.WARNING):
        config = DatabaseConfig()

    assert config.vector_url is None
    assert config.metadata_url is None
    assert any(
        "No database URLs configured" in record.message for record in caplog.records
    )


@pytest.mark.asyncio
async def test_get_pool_returns_none_when_unconfigured(monkeypatch):
    """Pool creation should short-circuit when configuration is missing."""

    _clear_database_env(monkeypatch)
    config = DatabaseConfig()

    pool = await config.get_pool(DatabaseType.METADATA)
    assert pool is None


@pytest.mark.asyncio
async def test_get_db_pool_optional_behaviour(monkeypatch, caplog):
    """`get_db_pool` should support optional behaviour when configuration is absent."""

    _clear_database_env(monkeypatch)
    fresh_config = DatabaseConfig()
    monkeypatch.setattr(database_module, "db_config", fresh_config, raising=False)

    with pytest.raises(RuntimeError):
        await get_db_pool()

    with caplog.at_level(logging.DEBUG):
        pool = await get_db_pool(raise_on_missing=False)

    assert pool is None
    assert any(
        "Metadata database pool requested but configuration is unavailable"
        in record.message
        for record in caplog.records
    )
