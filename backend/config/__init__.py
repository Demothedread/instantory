"""Configuration module for the backend application."""

from .settings import Settings
from .database import db_config as db
from .storage import storage_config as storage
from .security import SecurityConfig as Security
from .logging import log_config as logging

class Config:
    """Central configuration hub."""
    
    def __init__(self):
        self.settings = Settings()
        self.db = db
        self.storage = storage
        self.security = Security()
        self.logging = logging
    
    async def initialize(self):
        """Initialize all configuration components."""
        # No initialization needed as components are already initialized
        # when imported as global instances

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

__all__ = ['config', 'settings']
