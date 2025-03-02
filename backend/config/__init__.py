"""Configuration module for the backend application."""

from .settings import settings
from .database import Database
from .storage import Storage
from .security import Security
from .logging import Logging

class Config:
    """Central configuration hub."""
    
    def __init__(self):
        self.settings = settings
        self.db = Database(self.settings)
        self.storage = Storage(self.settings)
        self.security = Security(self.settings)
        self.logging = Logging(self.settings)
    
    async def initialize(self):
        """Initialize all configuration components."""
        await self.db.initialize()
        await self.storage.initialize()
        self.logging.initialize()
    
    async def cleanup(self):
        """Cleanup all configuration components."""
        await self.db.cleanup()
        await self.storage.cleanup()

# Global instance
config = Config()

__all__ = ['config', 'settings']
