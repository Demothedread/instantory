"""
OpenAI Service for document processing and inventory analysis.
Provides centralized OpenAI API integration for the Bartleby application.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

from backend.config.manager import config_manager

logger = logging.getLogger(__name__)

class OpenAIService:
    """Service for handling OpenAI API interactions"""
    
    def __init__(self):
        """Initialize OpenAI service with configuration"""
        self.client = None
        self.config = config_manager.get_openai_config()
        
        if AsyncOpenAI and self.config.get("api_key"):
            try:
                self.client = AsyncOpenAI(
                    api_key=self.config["api_key"],
                    timeout=30.0
                )
                logger.info("✅ OpenAI service initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize OpenAI client: {e}")
                self.client = None
        else:
            logger.warning("⚠️ OpenAI not available - missing API key or library")
    
    @property
    def is_available(self) -> bool:
        """Check if OpenAI service is available"""
        return self.client is not None
    
    async def process_document(self, 
                             content: str, 
                             file_name: str = None,
                             document_type: str = "unknown",
                             user_instruction: str = None) -> Dict[str, Any]:
        """
        Process a document using OpenAI to extract structured information.
        
        Args:
            content: Document content to process
            file_name: Original filename
            document_type: Type of document (receipt, invoice, manual, etc.)
            user_instruction: Custom processing instruction
            
        Returns:
            Dict containing extracted information and metadata
        """
        if not self.is_available:
            return {
                "success": False,
                "error": "OpenAI service not available",
                "extracted_data": {}
            }
        
        try:
            # Build context-aware prompt
            base_instruction = (
                "You are an expert document analyst. Extract structured information "
                "from the following document. Focus on key entities, dates, amounts, "
                "contact information, and any actionable items."
            )
            
            if user_instruction:
                instruction = f"{base_instruction}\n\nSpecific instructions: {user_instruction}"
            else:
                instruction = base_instruction
            
            # Add document type context
            if document_type != "unknown":
                instruction += f"\n\nDocument type: {document_type}"
            
            if file_name:
                instruction += f"\nFile name: {file_name}"
            
            instruction += """

Return a JSON object with the following structure:
{
    "summary": "Brief summary of the document",
    "key_entities": ["list", "of", "important", "entities"],
    "dates": ["extracted dates"],
    "amounts": ["monetary amounts or quantities"],
    "contacts": ["contact information"],
    "actionable_items": ["tasks or actions mentioned"],
    "metadata": {
        "confidence": "high/medium/low",
        "document_category": "category",
        "language": "detected language"
    }
}
"""
            
            response = await self.client.chat.completions.create(
                model=self.config.get("model", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": content[:8000]}  # Limit content size
                ],
                temperature=0.1,
                max_tokens=1500
            )
            
            result_text = response.choices[0].message.content
            
            # Try to parse JSON response
            try:
                extracted_data = json.loads(result_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                extracted_data = {
                    "summary": result_text,
                    "raw_response": result_text,
                    "parsing_error": True
                }
            
            return {
                "success": True,
                "extracted_data": extracted_data,
                "processing_time": datetime.utcnow().isoformat(),
                "model_used": self.config.get("model", "gpt-3.5-turbo"),
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
            
        except Exception as e:
            logger.error(f"❌ Document processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "extracted_data": {}
            }
    
    async def analyze_inventory(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze inventory data to generate insights and recommendations.
        
        Args:
            items: List of inventory items with their data
            
        Returns:
            Dict containing analysis results and insights
        """
        if not self.is_available:
            return {
                "success": False,
                "error": "OpenAI service not available",
                "insights": {}
            }
        
        try:
            # Prepare inventory summary for analysis
            inventory_summary = {
                "total_items": len(items),
                "categories": {},
                "price_ranges": [],
                "recent_items": []
            }
            
            # Analyze items
            for item in items[:50]:  # Limit to first 50 items
                category = item.get('category', 'uncategorized')
                inventory_summary["categories"][category] = inventory_summary["categories"].get(category, 0) + 1
                
                if item.get('price'):
                    try:
                        price = float(item['price'])
                        inventory_summary["price_ranges"].append(price)
                    except (ValueError, TypeError):
                        pass
                
                if item.get('date_added'):
                    inventory_summary["recent_items"].append({
                        "name": item.get('name', 'Unknown'),
                        "category": category,
                        "date": item.get('date_added')
                    })
            
            instruction = """
Analyze this inventory data and provide actionable insights. Focus on:
1. Category distribution and trends
2. Pricing patterns and recommendations
3. Inventory optimization suggestions
4. Missing or incomplete data identification
5. Business insights and opportunities

Return a JSON object with structured analysis.
"""
            
            response = await self.client.chat.completions.create(
                model=self.config.get("model", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": json.dumps(inventory_summary, default=str)}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            result_text = response.choices[0].message.content
            
            try:
                insights = json.loads(result_text)
            except json.JSONDecodeError:
                insights = {"raw_analysis": result_text}
            
            return {
                "success": True,
                "insights": insights,
                "analysis_time": datetime.utcnow().isoformat(),
                "items_analyzed": len(items),
                "model_used": self.config.get("model", "gpt-3.5-turbo")
            }
            
        except Exception as e:
            logger.error(f"❌ Inventory analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "insights": {}
            }
    
    async def generate_insights(self, 
                              data_type: str, 
                              data: Dict[str, Any],
                              context: str = None) -> Dict[str, Any]:
        """
        Generate general insights from various data types.
        
        Args:
            data_type: Type of data (dashboard, search, usage, etc.)
            data: The data to analyze
            context: Additional context for analysis
            
        Returns:
            Dict containing generated insights
        """
        if not self.is_available:
            return {
                "success": False,
                "error": "OpenAI service not available",
                "insights": {}
            }
        
        try:
            instruction = f"""
Analyze this {data_type} data and provide meaningful insights, patterns, 
and actionable recommendations. Be specific and practical.

Additional context: {context or 'None provided'}

Return insights in a structured JSON format.
"""
            
            response = await self.client.chat.completions.create(
                model=self.config.get("model", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": json.dumps(data, default=str)[:4000]}
                ],
                temperature=0.2,
                max_tokens=800
            )
            
            result_text = response.choices[0].message.content
            
            try:
                insights = json.loads(result_text)
            except json.JSONDecodeError:
                insights = {"analysis": result_text}
            
            return {
                "success": True,
                "insights": insights,
                "data_type": data_type,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Insight generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "insights": {}
            }
    
    async def process_image_description(self, 
                                      image_description: str,
                                      context: str = None) -> Dict[str, Any]:
        """
        Process image descriptions to extract inventory information.
        
        Args:
            image_description: Description of the image content
            context: Additional context about the image
            
        Returns:
            Dict containing extracted inventory information
        """
        if not self.is_available:
            return {
                "success": False,
                "error": "OpenAI service not available",
                "extracted_info": {}
            }
        
        try:
            instruction = """
From this image description, extract potential inventory item information.
Focus on identifying products, their attributes, conditions, and any visible text or labels.

Return a JSON object with:
{
    "items_identified": [
        {
            "name": "item name",
            "category": "category",
            "condition": "condition",
            "estimated_value": "value if determinable",
            "description": "detailed description",
            "attributes": ["list", "of", "attributes"]
        }
    ],
    "text_visible": "any visible text or labels",
    "scene_context": "overall scene description",
    "inventory_potential": "high/medium/low - likelihood these are inventory items"
}
"""
            
            full_content = f"Image description: {image_description}"
            if context:
                full_content += f"\nContext: {context}"
            
            response = await self.client.chat.completions.create(
                model=self.config.get("model", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": full_content}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            result_text = response.choices[0].message.content
            
            try:
                extracted_info = json.loads(result_text)
            except json.JSONDecodeError:
                extracted_info = {"raw_description": result_text}
            
            return {
                "success": True,
                "extracted_info": extracted_info,
                "processed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Image description processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "extracted_info": {}
            }

# Global service instance
openai_service = OpenAIService()
