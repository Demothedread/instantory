"""Processing routes for batch document and image analysis."""

import asyncio
import logging
import os
import uuid
from datetime import datetime

from quart import Blueprint, jsonify, request

from backend.config.client_factory import create_openai_client
from backend.config.database import get_metadata_pool
from backend.services.processor import create_processor_factory
from backend.services.storage.manager import storage_manager
from backend.task_manager import task_manager

logger = logging.getLogger(__name__)
process_bp = Blueprint("process", __name__)

# Initialize OpenAI client safely
# Import lazily to avoid httpx compatibility issues during module import
openai_client = None


def get_openai_client():
    """Get or create OpenAI client lazily."""
    global openai_client
    if openai_client is None:
        try:
            openai_client = create_openai_client()
        except Exception as e:
            logger.error("Failed to create OpenAI client: %s", e)
            return None
    return openai_client


@process_bp.route("/api/process", methods=["POST"])
async def process_files():
    """Process uploaded files using AI analysis."""
    try:
        # Get user info from session or token
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID required"}), 400

        # Parse request data
        data = await request.get_json()
        files = data.get("files", [])
        instruction = data.get("instruction", "")

        if not files:
            return jsonify({"error": "No files provided"}), 400

        if len(files) > 10:
            return jsonify({"error": "Maximum 10 files allowed"}), 400

        # Get DB pool for processors
        pool = await get_metadata_pool()

        # Get OpenAI client
        client = get_openai_client()
        if not client:
            return jsonify({"error": "OpenAI client unavailable"}), 503

        # Create processor factory
        processor_factory = create_processor_factory(pool, client)

        # Get batch processor
        batch_processor = processor_factory.create_batch_processor(instruction)

        # Process files
        task_id = f"process-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4()}"

        # Track files for processing
        file_objects = []
        for file in files:
            blob_url = file.get("blobUrl")
            file_type = file.get("fileType")
            original_name = file.get("originalName")

            if not all([blob_url, file_type, original_name]):
                return jsonify({"error": "Missing file information"}), 400

            # Download file content
            content = await storage_manager.get_file(blob_url)
            if not content:
                logger.error("Failed to retrieve file content for %s", original_name)
                continue

            file_objects.append(
                {
                    "url": blob_url,
                    "content": content,
                    "type": file_type,
                    "name": original_name,
                }
            )

        # Add task to task manager
        task_manager.add_task(task_id)

        # Start asynchronous processing
        asyncio.create_task(
            process_batch_async(task_id, batch_processor, file_objects, int(user_id))
        )

        return jsonify({"message": "Processing started", "task_id": task_id})

    except Exception as e:
        logger.error("Error processing files: %s", e)
        return jsonify({"error": str(e)}), 500


async def process_batch_async(task_id, processor, files, user_id):
    """Process a batch of files asynchronously."""
    try:
        # Store task status
        await store_task_status(task_id, "processing", 0, user_id)

        # Process files
        result = await processor.process_batch(files, user_id)

        # Update task status on completion
        status = "completed" if result.failed_files == 0 else "completed_with_errors"
        await store_task_status(task_id, status, 100, user_id, result=result.to_dict())

    except Exception as e:
        logger.error(f"Error in async batch processing: {e}")
        await store_task_status(task_id, "failed", 0, user_id, error=str(e))


async def store_task_status(
    task_id, status, progress, user_id, result=None, error=None
):
    """Store processing task status in the database."""
    try:
        pool = await get_metadata_pool()
        async with pool.acquire() as conn:
            # Create status record if it doesn't exist
            await conn.execute(
                """
                INSERT INTO processing_tasks (task_id, user_id, status, progress, created_at) 
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (task_id) 
                DO UPDATE SET status = $3, progress = $4, updated_at = NOW()
                """,
                task_id,
                user_id,
                status,
                progress,
            )

            # Store result data if available
            if result:
                await conn.execute(
                    """
                    UPDATE processing_tasks 
                    SET result_data = $1
                    WHERE task_id = $2
                    """,
                    result,
                    task_id,
                )

            # Store error if available
            if error:
                await conn.execute(
                    """
                    UPDATE processing_tasks 
                    SET error_message = $1
                    WHERE task_id = $2
                    """,
                    error,
                    task_id,
                )

    except Exception as e:
        logger.error(f"Failed to store task status: {e}")
        # Don't re-raise, as this is a background process


async def get_task_status(task_id, user_id):
    """Get processing task status from the database."""
    try:
        pool = await get_metadata_pool()
        async with pool.acquire() as conn:
            result = await conn.fetchrow(
                """
                SELECT task_id, status, progress, 
                       result_data, error_message, 
                       created_at, updated_at
                FROM processing_tasks 
                WHERE task_id = $1 AND user_id = $2
                """,
                task_id,
                user_id,
            )

            if result:
                return dict(result)
            return None

    except Exception as e:
        logger.error(f"Failed to get task status: {e}")
        return None


@process_bp.route("/api/processing-status/<task_id>", methods=["GET"])
async def get_processing_status(task_id):
    """Get the status of a processing task."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID required"}), 400

        status = await get_task_status(task_id, int(user_id))
        if not status:
            return jsonify({"error": "Task not found"}), 404

        return jsonify(status)

    except Exception as e:
        logger.error(f"Error getting processing status: {e}")
        return jsonify({"error": str(e)}), 500
