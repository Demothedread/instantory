"""Image processor for handling image files."""
import base64
import logging
import json # Add this import
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import asyncpg
from PIL import Image
import io

from openai import AsyncOpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt

from .base_processor import BaseProcessor
from backend.config.logging import log_config
from backend.config.storage import get_storage_config


logger = log_config.get_logger(__name__)
storage = get_storage_config()

class ImageProcessor(BaseProcessor):
    """Processor for image files (PNG, JPG, JPEG, GIF, WEBP)."""
    
    SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'}
    MAX_SIZE = (512, 512)  # Maximum dimensions for processed images
    
    def __init__(self, db_pool: asyncpg.Pool, openai_client: AsyncOpenAI, instruction: str = None):
        super().__init__()
        self.db_pool = db_pool
        self.openai_client = openai_client
        self.instruction = instruction or "Catalog, categorize and describe the item."
    
    @staticmethod
    def is_supported_file(file_path: Path) -> bool:
        """Check if file type is supported."""
        return file_path.suffix.lower() in ImageProcessor.SUPPORTED_EXTENSIONS
    
    async def process_file(self, file_path: Path) -> bool:
        """Process a single image file."""
        if not self.is_supported_file(file_path):
            logger.warning(f"Unsupported file type: {file_path}")
            return False
        
        try:
            # Process and optimize image
            processed_path = await self._process_image(file_path)
            
            # Convert to base64 for analysis
            base64_image = await self._image_to_base64(processed_path)
            
            # Check if image already exists
            async with self.db_pool.acquire() as conn:
                exists = await self._check_image_exists(conn, processed_path)
                if exists:
                    logger.info(f"Image already exists: {file_path}")
                    return False
            
            # Analyze image with GPT-4
            product_info = await self._analyze_image(base64_image)
            if not product_info:
                logger.error(f"Failed to analyze image: {file_path}")
                return False
            
            # Store in database
            async with self.db_pool.acquire() as conn:
                await self._store_product_info(conn, product_info, processed_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing image {file_path}: {e}")
            raise
    
    async def _process_image(self, source_path: Path) -> Path:
        """Process and optimize image for storage."""
        try:
            with Image.open(source_path) as img:
                # Convert RGBA to RGB if needed
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                
                # Resize image maintaining aspect ratio
                img.thumbnail(self.MAX_SIZE, Image.Resampling.LANCZOS)
                
                # Generate new filename with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                new_filename = f"{timestamp}_{source_path.stem}.jpg"
                
                # Get the base directory path for inventory images
                inventory_dir = get_storage_config().paths['INVENTORY_IMAGES_DIR']
                # Combine the directory path with the new filename
                dest_path = inventory_dir / new_filename
                
                # Save the processed image
                # Save the processed image
                img.save(dest_path, "JPEG", quality=85, optimize=True)
                
                return dest_path
                
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            raise
    
    async def _image_to_base64(self, image_path: Path) -> str:
        """Convert image to base64 string."""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Error converting image to base64: {e}")
            raise
    
    async def _check_image_exists(self, conn: asyncpg.Connection, image_path: Path) -> bool:
        """Check if image already exists in database."""
        try:
            result = await conn.fetchval(
                "SELECT EXISTS(SELECT 1 FROM products WHERE image_url = $1)",
                str(image_path)
            )
            return result
        except Exception as e:
            logger.error(f"Error checking image existence: {e}")
            raise
    
    @retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(3))
    async def _analyze_image(self, base64_image: str) -> Optional[Dict[str, Any]]:
        """Analyze image using OpenAI's GPT-4 model."""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": self.instruction
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Given an image of a product we sell, analyze the item and generate a JSON output with the following fields: "
                                    "- \"name\": A descriptive name. "
                                    "- \"description\": A concise and detailed product description in bullet point formatted as a markdown list. "
                                    "- \"category\": One of [\"Beads\", \"Stools\", \"Bowls\", \"Fans\", \"Totebags\", \"Home Decor\"] most applicable to the product, or else \"Other\". "
                                    "- \"material\": Primary materials. "
                                    "- \"color\": Main colors. "
                                    "- \"dimensions\": Approximate dimensions. "
                                    "- \"origin_source\": Likely origin based on style. "
                                    "- \"import_cost\": Best estimated import price in USD or 'null'. "
                                    "- \"retail_price\": Best estimated retail price in USD or 'null'. "
                                    "- \"key_tags\": Important keywords/phrases for product discovery."
                                )
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ] # Close the messages list
            ) # Close the create method call

            content = response.choices[0].message.content

            # Ensure content is parsed as JSON if it's a string
            if isinstance(content, str):
                try:
                    # Remove potential markdown code block fences before parsing
                    if content.startswith("```json"):
                        content = content.strip("```json").strip()
                    elif content.startswith("```"):
                         content = content.strip("```").strip()
                    return json.loads(content)
                except json.JSONDecodeError as json_err:
                    logger.error(f"Failed to parse JSON response from OpenAI: {json_err}")
                    logger.error(f"Raw content: {content}")
                    return None # Or raise an error
            elif isinstance(content, dict):
                 return content
            else:
                 logger.error(f"Unexpected response type from OpenAI: {type(content)}")
                 return None

        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return None

    async def _store_product_info(self, conn: asyncpg.Connection,
                                product_info: Dict[str, Any],
                                image_path: Path) -> None:
        """Store product information in database."""
        try:
            # Convert price strings to float or None
            import_cost = float(product_info['import_cost']) if product_info.get('import_cost') not in (None, 'null') else None
            retail_price = float(product_info['retail_price']) if product_info.get('retail_price') not in (None, 'null') else None
            
            # Handle description formatting
            description = product_info['description']
            if isinstance(description, list):
                description = '. '.join(description)
            
            # Handle key tags formatting
            key_tags = product_info['key_tags']
            if isinstance(key_tags, list):
                key_tags = ', '.join(key_tags)
            
            await conn.execute('''
                INSERT INTO products
                (name, description, image_url, category, material, color, dimensions,
                 origin_source, import_cost, retail_price, key_tags)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ''',
                product_info['name'],
                description,
                str(image_path),
                product_info['category'],
                product_info['material'],
                product_info['color'],
                product_info['dimensions'],
                product_info['origin_source'],
                import_cost,
                retail_price,
                key_tags
            )
        except Exception as e:
            logger.error(f"Error storing product info: {e}")
            raise
