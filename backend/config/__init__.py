"""Configuration module for the backend application."""

from .manager import config_manager
from .database import db_config as db
from .storage import storage_config as storage
from .security import SecurityConfig as Security
from .logging import log_config as logging

class Config:
    """Central configuration hub."""
    
    def __init__(self):
        self.manager = config_manager  # Use config_manager instead of Settings
        self.db = db
        self.storage = storage
        self.security = Security()
        self.logging = logging
    
    async def initialize(self):
        """Initialize all configuration components."""
        # No initialization needed as components are already initialized
        # when imported as global instances
        pass

    async def cleanup(self):
        """Cleanup all configuration components."""
        # Clean up database connections
        if hasattr(self.db, 'cleanup'):
            await self.db.cleanup()
        
        # Clean up storage resources
        if hasattr(self.storage, 'cleanup'):
            await self.storage.cleanup()
 
# Global instance
config = Config()

__all__ = ['config', 'config_manager']
