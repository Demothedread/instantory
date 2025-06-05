"""Backend application package."""

import logging
import os

# Set up basic logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Package version
__version__ = "1.0.0"

# Export what's needed for deployment
__all__ = ['logger', '__version__']
