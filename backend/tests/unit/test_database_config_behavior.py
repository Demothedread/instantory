"""Tests for database configuration when environment variables are absent."""

import importlib
import sys
from typing import Iterable

import pytest


ENV_KEYS: Iterable[str] = (
    "DATABASE_URL",
    "NEON_DATABASE_URL",
    "VECTOR_DATABASE_URL",
    "METADATA_DATABASE_URL",
)


def _reload_database_module():
    module = importlib.import_module("backend.config.database")
    return importlib.reload(module)


@pytest.fixture
def database_module(monkeypatch):
    for key in ENV_KEYS:
        monkeypatch.delenv(key, raising=False)
    module = _reload_database_module()
    yield module
    _reload_database_module()
    if "backend.server" in sys.modules:
        importlib.reload(sys.modules["backend.server"])


def test_database_config_does_not_require_urls(database_module):
    config = database_module.DatabaseConfig()
    assert config.vector_url is None
    assert config.metadata_url is None


@pytest.mark.asyncio
async def test_get_db_pool_raises_when_unconfigured(database_module):
    with pytest.raises(database_module.DatabaseNotConfiguredError) as exc:
        await database_module.get_db_pool()
    assert "Metadata database" in str(exc.value)


def test_create_app_initializes_without_database(monkeypatch, database_module):
    server_module = importlib.import_module("backend.server")
    server_module = importlib.reload(server_module)
    app = server_module.create_app()
    assert app is not None
