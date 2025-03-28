"""Configuration module for the backend application."""

from .settings import Settings
from .database import DatabaseConfig as Database # Make sure this matches the actual class name in database.py
from .storage import StorageConfig as Storage  # Using alias to match expected name
from .security import SecurityConfig  as Security # Make sure this matches the actual class name in security.py
from .logging import LogConfig as Logging # Make sure this matches the actual class name in logging.py
class Config:
    """ Central configuration hub."""
    
    def __init__(self):
        self.settings = Settings
        self.db = Database()
        self.storage = Storage()
        self.security = Security()
        self.logging = Logging()
    
    async def initialize(self):
        """Initialize all configuration components."""
        await self.db.__init__()
        await self.storage.__init__()
        await self.logging.__init__()
    
    async def cleanup(self):
        """Cleanup all configuration components."""
        await self.db.cleanup()
        await self.storage.cleanup()
 
# Global instance
config = Config()

__all__ = ['config', 'settings']
