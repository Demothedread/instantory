"""
OpenAI API routes for document processing and AI-powered analysis.
Provides endpoints for integrating OpenAI capabilities into the Bartleby application.
"""

import logging
from datetime import datetime
from typing import Any, Dict

from quart import Blueprint, jsonify, request

from backend.routes.auth_routes import verify_token
from backend.services.openai_service import openai_service
from backend.utils.decorators import async_error_handler, validate_json

logger = logging.getLogger(__name__)

# Create blueprint
openai_bp = Blueprint('openai', __name__, url_prefix='/api/openai')

@openai_bp.route('/health', methods=['GET'])
async def openai_health():
    """Check OpenAI service health and availability"""
    try:
        health_status = {
            "service": "openai",
            "available": openai_service.is_available,
            "timestamp": datetime.utcnow().isoformat(),
            "config": {
                "model": openai_service.config.get("model", "not-configured"),
                "api_key_configured": bool(openai_service.config.get("api_key"))
            }
        }
        
        status_code = 200 if openai_service.is_available else 503
        
        return jsonify(health_status), status_code
        
    except Exception as e:
        logger.error(f"❌ OpenAI health check failed: {e}")
        return jsonify({
            "service": "openai",
            "available": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@openai_bp.route('/process-document', methods=['POST'])
@verify_token
@validate_json(['content'])
@async_error_handler
async def process_document():
    """
    Process a document using OpenAI to extract structured information.
    
    Expected JSON payload:
    {
        "content": "document content",
        "file_name": "optional filename",
        "document_type": "optional type",
        "user_instruction": "optional custom instruction"
    }
    """
    try:
        data = await request.get_json()
        
        content = data['content']
        file_name = data.get('file_name')
        document_type = data.get('document_type', 'unknown')
        user_instruction = data.get('user_instruction')
        
        if not content or not content.strip():
            return jsonify({
                "success": False,
                "error": "Document content is required and cannot be empty"
            }), 400
        
        logger.info(f"🔄 Processing document: {file_name or 'unnamed'} (type: {document_type})")
        
        result = await openai_service.process_document(
            content=content,
            file_name=file_name,
            document_type=document_type,
            user_instruction=user_instruction
        )
        
        if result["success"]:
            logger.info(f"✅ Document processed successfully: {file_name or 'unnamed'}")
        else:
            logger.warning(f"⚠️ Document processing failed: {result.get('error', 'Unknown error')}")
        
        return jsonify(result), 200 if result["success"] else 500
        
    except Exception as e:
        logger.error(f"❌ Document processing endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": f"Processing failed: {str(e)}",
            "extracted_data": {}
        }), 500

@openai_bp.route('/analyze-inventory', methods=['POST'])
@verify_token
@validate_json(['items'])
@async_error_handler
async def analyze_inventory():
    """
    Analyze inventory data to generate insights and recommendations.
    
    Expected JSON payload:
    {
        "items": [list of inventory items],
        "analysis_type": "optional analysis type",
        "context": "optional additional context"
    }
    """
    try:
        data = await request.get_json()
        
        items = data['items']
        analysis_type = data.get('analysis_type', 'general')
        context = data.get('context')
        
        if not isinstance(items, list):
            return jsonify({
                "success": False,
                "error": "Items must be provided as a list"
            }), 400
        
        if len(items) == 0:
            return jsonify({
                "success": False,
                "error": "At least one inventory item is required for analysis"
            }), 400
        
        logger.info(f"🔄 Analyzing {len(items)} inventory items (type: {analysis_type})")
        
        result = await openai_service.analyze_inventory(items)
        
        # Add analysis context to result
        if result["success"]:
            result["analysis_type"] = analysis_type
            result["context"] = context
            logger.info(f"✅ Inventory analysis completed for {len(items)} items")
        else:
            logger.warning(f"⚠️ Inventory analysis failed: {result.get('error', 'Unknown error')}")
        
        return jsonify(result), 200 if result["success"] else 500
        
    except Exception as e:
        logger.error(f"❌ Inventory analysis endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": f"Analysis failed: {str(e)}",
            "insights": {}
        }), 500

@openai_bp.route('/generate-insights', methods=['POST'])
@verify_token
@validate_json(['data_type', 'data'])
@async_error_handler
async def generate_insights():
    """
    Generate general insights from various data types.
    
    Expected JSON payload:
    {
        "data_type": "dashboard|search|usage|etc",
        "data": {object with data to analyze},
        "context": "optional additional context"
    }
    """
    try:
        data = await request.get_json()
        
        data_type = data['data_type']
        analysis_data = data['data']
        context = data.get('context')
        
        if not data_type or not analysis_data:
            return jsonify({
                "success": False,
                "error": "Both data_type and data are required"
            }), 400
        
        logger.info(f"🔄 Generating insights for {data_type} data")
        
        result = await openai_service.generate_insights(
            data_type=data_type,
            data=analysis_data,
            context=context
        )
        
        if result["success"]:
            logger.info(f"✅ Insights generated for {data_type}")
        else:
            logger.warning(f"⚠️ Insight generation failed: {result.get('error', 'Unknown error')}")
        
        return jsonify(result), 200 if result["success"] else 500
        
    except Exception as e:
        logger.error(f"❌ Insight generation endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": f"Insight generation failed: {str(e)}",
            "insights": {}
        }), 500

@openai_bp.route('/process-image-description', methods=['POST'])
@verify_token
@validate_json(['description'])
@async_error_handler
async def process_image_description():
    """
    Process image descriptions to extract inventory information.
    
    Expected JSON payload:
    {
        "description": "image description text",
        "context": "optional additional context"
    }
    """
    try:
        data = await request.get_json()
        
        description = data['description']
        context = data.get('context')
        
        if not description or not description.strip():
            return jsonify({
                "success": False,
                "error": "Image description is required and cannot be empty"
            }), 400
        
        logger.info("🔄 Processing image description for inventory extraction")
        
        result = await openai_service.process_image_description(
            image_description=description,
            context=context
        )
        
        if result["success"]:
            logger.info("✅ Image description processed successfully")
        else:
            logger.warning(f"⚠️ Image description processing failed: {result.get('error', 'Unknown error')}")
        
        return jsonify(result), 200 if result["success"] else 500
        
    except Exception as e:
        logger.error(f"❌ Image description processing endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": f"Processing failed: {str(e)}",
            "extracted_info": {}
        }), 500

@openai_bp.route('/batch-process', methods=['POST'])
@verify_token
@validate_json(['items'])
@async_error_handler
async def batch_process():
    """
    Process multiple items (documents, images, etc.) in batch.
    
    Expected JSON payload:
    {
        "items": [
            {
                "type": "document|image_description",
                "content": "content to process",
                "metadata": {optional metadata}
            }
        ],
        "batch_options": {optional batch processing options}
    }
    """
    try:
        data = await request.get_json()
        
        items = data['items']
        batch_options = data.get('batch_options', {})
        
        if not isinstance(items, list) or len(items) == 0:
            return jsonify({
                "success": False,
                "error": "Items list is required and cannot be empty"
            }), 400
        
        if len(items) > 50:  # Limit batch size
            return jsonify({
                "success": False,
                "error": "Batch size cannot exceed 50 items"
            }), 400
        
        logger.info(f"🔄 Processing batch of {len(items)} items")
        
        results = []
        success_count = 0
        
        for i, item in enumerate(items):
            try:
                item_type = item.get('type', 'unknown')
                content = item.get('content', '')
                metadata = item.get('metadata', {})
                
                if item_type == 'document':
                    result = await openai_service.process_document(
                        content=content,
                        file_name=metadata.get('file_name'),
                        document_type=metadata.get('document_type', 'unknown'),
                        user_instruction=metadata.get('user_instruction')
                    )
                elif item_type == 'image_description':
                    result = await openai_service.process_image_description(
                        image_description=content,
                        context=metadata.get('context')
                    )
                else:
                    result = {
                        "success": False,
                        "error": f"Unknown item type: {item_type}"
                    }
                
                result['item_index'] = i
                result['item_type'] = item_type
                results.append(result)
                
                if result.get('success'):
                    success_count += 1
                    
            except Exception as item_error:
                logger.error(f"❌ Error processing batch item {i}: {item_error}")
                results.append({
                    "success": False,
                    "error": str(item_error),
                    "item_index": i,
                    "item_type": item.get('type', 'unknown')
                })
        
        batch_result = {
            "success": True,
            "batch_summary": {
                "total_items": len(items),
                "successful": success_count,
                "failed": len(items) - success_count,
                "success_rate": round(success_count / len(items) * 100, 2)
            },
            "results": results,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"✅ Batch processing completed: {success_count}/{len(items)} successful")
        
        return jsonify(batch_result), 200
        
    except Exception as e:
        logger.error(f"❌ Batch processing endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": f"Batch processing failed: {str(e)}",
            "results": []
        }), 500

# Export blueprint
__all__ = ['openai_bp']
