"""Processing routes for batch document and image analysis."""
import logging
import os
from quart import Blueprint, request, jsonify
from backend.db import get_db_pool
from backend.config.database import get_metadata_pool
from backend.services.processor import create_processor_factory, BatchProcessor
from backend.services.storage.manager import storage_manager
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)
process_bp = Blueprint('process', __name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@process_bp.route('/api/process', methods=['POST'])
async def process_files():
    """Process uploaded files using AI analysis."""
    try:
        # Get user info from session or token
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
            
        # Parse request data
        data = await request.get_json()
        files = data.get('files', [])
        instruction = data.get('instruction', '')
        
        if not files:
            return jsonify({"error": "No files provided"}), 400
            
        if len(files) > 10:
            return jsonify({"error": "Maximum 10 files allowed"}), 400
        
        # Get DB pool for processors
        pool = await get_metadata_pool()
        
        # Create processor factory
        processor_factory = create_processor_factory(pool, openai_client)
        
        # Get batch processor
        batch_processor = processor_factory.create_batch_processor(instruction)
        
        # Process files
        results = []
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
                logger.error(f"Failed to retrieve file content for {original_name}")
                continue
                
            file_objects.append({
                "url": blob_url,
                "content": content,
                "type": file_type,
                "name": original_name
            })
        
        # Start asynchronous processing
        asyncio.create_task(
            process_batch_async(task_id, batch_processor, file_objects, int(user_id))
        )
        
        return jsonify({
            "message": "Processing started",
            "task_id": task_id
        })
        
    except Exception as e:
        logger.error(f"Error processing files: {e}")
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

@process_bp.route('/api/processing-status/<task_id>', methods=['GET'])
async def get_processing_status(task_id):
    """Get the status of a processing task."""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
            
        status = await get_task_status(task_id, int(user_id))
        if not status:
            return jsonify({"error": "Task not found"}), 404
            
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"Error getting processing status: {e}")
        return jsonify({"error": str(e)}), 500