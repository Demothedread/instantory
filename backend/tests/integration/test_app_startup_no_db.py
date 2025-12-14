"""Integration tests covering app startup without database configuration."""

import importlib
import logging
from importlib import import_module

import pytest

from backend.config import database as database_module


@pytest.mark.asyncio
async def test_app_startup_without_database_env(monkeypatch, caplog):
    """Ensure the Quart app starts even when no database URLs are configured."""

    # Remove database-related environment variables
    for env_var in [
        "DATABASE_URL",
        "NEON_DATABASE_URL",
        "VECTOR_DATABASE_URL",
        "METADATA_DATABASE_URL",
    ]:
        monkeypatch.delenv(env_var, raising=False)

    # Prepare a clean database configuration and ensure the server module picks it up
    fresh_config = database_module.DatabaseConfig()
    monkeypatch.setattr(database_module, "db_config", fresh_config, raising=False)

    server_module = import_module("backend.server")

    with caplog.at_level(logging.WARNING):
        reloaded_server = importlib.reload(server_module)
        app = reloaded_server.create_app()

    # Restore the server module to its original state to avoid test bleed
    importlib.reload(server_module)

    assert app is not None
    warning_messages = [record.message for record in caplog.records]
    assert any(
        "No database URLs configured" in message
        or "Metadata database configuration missing" in message
        for message in warning_messages
    ), "Expected startup warning about missing database configuration"
