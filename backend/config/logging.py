"""Logging configuration and setup."""
import os
import sys
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import json
from datetime import datetime

class LogFormatter(logging.Formatter):
    """Custom formatter that includes timestamp and log level."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with additional context."""
        # Add timestamp in ISO format
        record.timestamp = datetime.fromtimestamp(record.created).isoformat()
        
        # Format extra fields if present
        extra_fields = {}
        for key, value in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and key not in ['timestamp']:
                try:
                    json.dumps(value)  # Test JSON serialization
                    extra_fields[key] = value
                except (TypeError, ValueError):
                    extra_fields[key] = str(value)
        
        # Create base message
        message = super().format(record)
        
        # Add extra fields if present
        if extra_fields:
            message = f"{message} | {json.dumps(extra_fields)}"
        
        return message

class LogConfig:
    """Logging configuration management."""
    
    def __init__(self):
        self.log_level = getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper())
        self.log_dir = Path(os.getenv('LOG_DIR', 'logs'))
        self.log_file = self.log_dir / 'instantory.log'
        
        # Ensure log directory exists
        try:
            self.log_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            print(f"Failed to create log directory: {e}", file=sys.stderr)
            self.log_file = None
    
    def setup_logging(self) -> None:
        """Configure logging with file and console handlers."""
        # Create formatter
        formatter = LogFormatter(
            '%(timestamp)s - %(levelname)s - %(name)s - %(message)s'
        )
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(self.log_level)
        
        # Remove existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Add console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # Add file handler if log file is available
        if self.log_file:
            try:
                file_handler = logging.FileHandler(str(self.log_file))
                file_handler.setFormatter(formatter)
                root_logger.addHandler(file_handler)
            except Exception as e:
                print(f"Failed to create file handler: {e}", file=sys.stderr)
    
    def get_logger(self, name: str) -> logging.Logger:
        """Get a logger with the specified name."""
        return logging.getLogger(name)

class RequestLogger:
    """Logger for HTTP requests with context."""
    
    def __init__(self, request_logger: logging.Logger):
        self.logger = request_logger
    
    def log_request(self, method: str, path: str, status: int,duration: float, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log an HTTP request with timing and context."""
        log_data = {
            'method': method,
            'path': path,
            'status': status,
            'duration_ms': round(duration * 1000, 2)
        }
        
        if extra:
            log_data.update(extra)
        
        level = logging.INFO if status < 400 else logging.ERROR
        self.logger.log(level, f"HTTP {method} {path}", extra=log_data)

# Global instances
log_config = LogConfig()
log_config.setup_logging()

logger = log_config.get_logger(__name__)
request_logger = RequestLogger(logger)

def get_request_logger() -> RequestLogger:
    """Get the request logger instance."""
    return request_logger
