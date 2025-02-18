"""Storage configuration and path management."""
import os
from pathlib import Path
from typing import Dict, Optional
import logging
import sqlite3

logger = logging.getLogger(__name__)

class StorageConfig:
    """Storage path and configuration management."""
    
    def __init__(self):
        # Use /tmp for ephemeral storage if DATA_DIR not set
        self.data_dir = Path(os.getenv('DATA_DIR', '/tmp/instantory'))
        
        # Define storage paths
        self.paths: Dict[str, Path] = {
            'UPLOADS_DIR': self.data_dir / 'uploads',
            'INVENTORY_IMAGES_DIR': self.data_dir / 'images' / 'inventory',
            'EXPORTS_DIR': self.data_dir / 'exports',
            'DOCUMENT_DIRECTORY': self.data_dir / 'documents',
            'TEMP_DIR': self.data_dir / 'temp'
        }
        
        # Blob storage configuration
        self.blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        if not self.blob_token:
            logger.warning("BLOB_READ_WRITE_TOKEN not set - blob storage features will be unavailable")
        
        # Initialize directories
        self._initialize_directories()
        
        # Initialize database connection
        self.db_path = self.data_dir / 'storage.db'
        self.conn = sqlite3.connect(self.db_path)
        self._initialize_database()
    
    def _initialize_directories(self) -> None:
        """Create necessary directories with proper permissions."""
        for path_name, directory in self.paths.items():
            try:
                directory.mkdir(parents=True, exist_ok=True, mode=0o755)
                logger.debug(f"Created directory: {directory}")
            except PermissionError:
                logger.error(f"Permission denied creating directory {directory}")
                raise
            except Exception as e:
                logger.error(f"Error creating directory {directory}: {e}")
                raise
    
    def _initialize_database(self) -> None:
        """Initialize the database schema."""
        try:
            with self.conn:
                self.conn.execute('''
                    CREATE TABLE IF NOT EXISTS storage (
                        id INTEGER PRIMARY KEY,
                        path_name TEXT NOT NULL,
                        path TEXT NOT NULL
                    )
                ''')
                logger.debug("Initialized database schema")
        except Exception as e:
            logger.error(f"Error initializing database schema: {e}")
            raise
    
    def get_path(self, path_name: str) -> Optional[Path]:
        """Get a configured path by name."""
        cursor = self.conn.execute('SELECT path FROM storage WHERE path_name = ?', (path_name,))
        row = cursor.fetchone()
        if row:
            return Path(row[0])
        return self.paths.get(path_name)
    
    def set_path(self, path_name: str, path: Path) -> None:
        """Set a configured path by name."""
        with self.conn:
            self.conn.execute('''
                INSERT INTO storage (path_name, path) VALUES (?, ?)
                ON CONFLICT(path_name) DO UPDATE SET path = excluded.path
            ''', (path_name, str(path)))
    
    def get_temp_dir(self) -> Path:
        """Get a temporary directory for processing."""
        temp_dir = self.paths['TEMP_DIR'] / str(os.getpid())
        temp_dir.mkdir(parents=True, exist_ok=True)
        return temp_dir
    
    def cleanup_temp_dir(self, temp_dir: Path) -> None:
        """Clean up a temporary directory."""
        try:
            if temp_dir.exists():
                for item in temp_dir.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        self.cleanup_temp_dir(item)
                temp_dir.rmdir()
        except Exception as e:
            logger.error(f"Error cleaning up temporary directory {temp_dir}: {e}")

# Global instance
storage_config = StorageConfig()

def get_storage_config() -> StorageConfig:
    """Get the storage configuration instance."""
    return storage_config
