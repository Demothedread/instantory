"""Task manager for handling background processing tasks with TTL."""

import asyncio
import logging
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger(__name__)

class TaskManager:
    """Manages background tasks with TTL."""
    
    def __init__(self, ttl_seconds: int = 86400):
        """Initialize task manager with TTL in seconds (default: 24 hours)."""
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds

    def add_task(self, task_id: str) -> None:
        """Add a new task with queued status."""
        self.tasks[task_id] = {
            'status': 'queued',
            'progress': 0,
            'message': 'Task queued',
            'created_at': asyncio.get_running_loop().time()
        }

    def update_task(self, task_id: str, **kwargs) -> None:
        """Update an existing task's attributes."""
        if task_id in self.tasks:
            self.tasks[task_id].update(kwargs)

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status, removing expired tasks."""
        task = self.tasks.get(task_id)
        if task and asyncio.get_running_loop().time() - task['created_at'] <= self.ttl_seconds:
            return task
        self.tasks.pop(task_id, None)
        return None

    def cleanup(self) -> None:
        """Remove expired tasks."""
        try:
            current_time = asyncio.get_running_loop().time()
            expired_tasks = [task_id for task_id, task in self.tasks.items()
                 if current_time - task['created_at'] > self.ttl_seconds]
            for task_id in expired_tasks:
                del self.tasks[task_id]
        except RuntimeError:
            # Handle case where there's no running event loop
            pass

# Global instance
task_manager = TaskManager()

async def setup_task_cleanup() -> None:
    """Periodic cleanup of expired tasks."""
    while True:
        await asyncio.sleep(3600)  # Run cleanup every hour
        task_manager.cleanup()

async def check_task_status(task_id: str) -> Optional[Dict[str, Any]]:
    """Check the status of a background task."""
    return task_manager.get_task(task_id)

async def run_background_task(task_id: str, coro: asyncio.Future) -> None:
    """Run a background task and update its status."""
    try:
        task_manager.update_task(task_id, status='running', message='Task started')
        await coro
        task_manager.update_task(task_id, status='completed', message='Task completed', progress=100)
    except Exception as e:
        logger.error("Error in background task %s: %s", task_id, e)
        task_manager.update_task(task_id, status='failed', message=str(e), progress=0)