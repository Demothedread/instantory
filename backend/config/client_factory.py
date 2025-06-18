"""Factory for creating API clients with compatibility handling."""

import os
import logging
from typing import Optional

# Configure logging
logger = logging.getLogger(__name__)

def create_openai_client():
    """Create an OpenAI client with compatibility fixes for different versions."""
    try:
        from openai import AsyncOpenAI
        
        # First try to create client with no http_client (avoids proxies issue)
        try:
            return AsyncOpenAI(
                api_key=os.getenv('OPENAI_API_KEY'),
                http_client=None
            )
        except TypeError:
            # Fallback to standard initialization if http_client param not supported
            logger.debug("Using standard OpenAI client initialization")
            return AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            
    except ImportError as e:
        logger.error("Failed to import AsyncOpenAI: %s", e)
        raise