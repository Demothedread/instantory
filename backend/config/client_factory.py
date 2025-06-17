"""Factory for creating API clients with compatibility handling."""

import logging
import os
from typing import Optional

# Configure logging
logger = logging.getLogger(__name__)


def create_openai_client():
    """Create an OpenAI client with compatibility fixes for different versions."""
    try:
        from openai import AsyncOpenAI

        # Try different initialization methods to handle httpx version compatibility
        try:
            # First try with explicit httpx client to control version issues
            import httpx

            http_client = httpx.AsyncClient()
            return AsyncOpenAI(
                api_key=os.getenv("OPENAI_API_KEY"), http_client=http_client
            )
        except (TypeError, AttributeError) as e:
            logger.debug("http_client initialization failed: %s", e)

        try:
            # Second try with no http_client (avoids proxies issue)
            return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"), http_client=None)
        except TypeError as e:
            logger.debug("http_client=None initialization failed: %s", e)

        # Fallback to standard initialization
        logger.debug("Using standard OpenAI client initialization")
        return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    except ImportError as e:
        logger.error("Failed to import AsyncOpenAI: %s", e)
        raise
