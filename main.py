import os
import sqlite3
import base64
import json
import requests
import logging
import openai
from datetime import datetime
import shutil
from tenacity import retry, wait_random_exponential, stop_after_attempt
import argparse
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
from backend.config import DB_NAME, DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

def initialize_database() -> None:
    """Initialize the database and create the products table if it doesn't exist."""
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    description TEXT,
                    image_url TEXT UNIQUE,
                    category TEXT,
                    material TEXT,
                    color TEXT,
                    dimensions TEXT,
                    origin_source TEXT,
                    import_cost REAL,
                    retail_price REAL,
                    key_tags TEXT
                )
            ''')

            # Check if key_tags column exists, if not, add it
            cursor.execute("PRAGMA table_info(products)")
            columns = [column[1] for column in cursor.fetchall()]
            if 'key_tags' not in columns:
                cursor.execute("ALTER TABLE products ADD COLUMN key_tags TEXT")

            conn.commit()
            logging.info("Database initialized successfully.")
    except sqlite3.Error as e:
        logging.error("Error initializing database: %s", e)

def process_uploaded_images(instruction: str) -> None:
    """Process uploaded images recursively, create a new directory, and save the processed images."""
    logging.info("Starting to process uploaded images")
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        # Retrieve existing image URLs from the database to avoid duplicates
        cursor.execute("SELECT image_url FROM products")
        existing_images = {row[0] for row in cursor.fetchall()}

        # Create a new directory for this batch of processed images
        batch_timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        batch_dir = os.path.join(INVENTORY_IMAGES_DIR, batch_timestamp)
        os.makedirs(batch_dir, exist_ok=True)
        logging.info("Created batch directory: %s", batch_dir)

        # Walk through the uploads directory recursively
        for root, dirs, files in os.walk(UPLOADS_DIR):
            logging.info("Traversing directory: %s", root)
            for filename in files:
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    image_path = os.path.join(root, filename)
                    logging.info("Processing image: %s", image_path)
                    try:
                        # Open the image file
                        with Image.open(image_path) as img:
                            # Convert RGBA to RGB if necessary
                            if img.mode == 'RGBA':
                                img = img.convert('RGB')
                            
                            # Calculate the scaling factor to keep max dimension at 512 pixels
                            max_size = (512, 512)
                            img.thumbnail(max_size, Image.Resampling.LANCZOS)

                            # Save the resized image in the batch directory with .jpg extension
                            new_filename = os.path.splitext(filename)[0] + '.jpg'
                            new_image_path = os.path.join(batch_dir, new_filename)
                            img.save(new_image_path, "JPEG", quality=85)

                            # Convert resized image to base64
                            with open(new_image_path, "rb") as resized_image_file:
                                base64_encoded_image = base64.b64encode(resized_image_file.read()).decode("utf-8")

                            logging.info("Moved image to new directory: %s", new_image_path)

                            # Check if the image already exists in the database 
                            if new_image_path not in existing_images:
                                product_info = analyze_image(base64_encoded_image, instruction)
                                if product_info:
                                    try:
                                        insert_product_info(cursor, product_info, new_image_path)
                                        conn.commit()
                                        logging.info("Successfully processed and moved image: %s", filename)
                                    except (sqlite3.Error) as e:
                                        logging.error("Error inserting product info for %s: %s", filename, e)
                                        conn.rollback()
                                else:
                                    logging.error("Failed to analyze image: %s", filename)
                            else:
                                logging.info("Image already exists in database: %s", filename)
                    except Exception as e:
                        logging.error("Error processing image %s: %s", filename, e)

@retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(6))
def analyze_image(base64_image: str, instruction: str) -> Dict[str, Any]:
    """Analyze an image using OpenAI's GPT-4 model and return product features."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": instruction
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
                            "Provide only the JSON output without any markdown formatting."
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
        ],
        "max_tokens": 700
    }

    try:
        logging.debug("Sending request to OpenAI API")
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        logging.debug("OpenAI API response status: %s", response.status_code)
        response_text = response.json()['choices'][0]['message']['content'].strip()
        logging.debug("OpenAI API response text: %s", response_text)

        # Remove any markdown formatting if present
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]

        return json.loads(response_text)
    except requests.exceptions.RequestException as e:
        logging.error("Request failed: %s", e)
        return {}
    except json.JSONDecodeError as e:
        logging.error("Failed to decode JSON response: %s", e)
        logging.error("Response text: %s", response_text)
        return {}
    except KeyError as e:
        logging.error("Unexpected response structure: %s", e)
        return {}

def insert_product_info(cursor: sqlite3.Cursor, product_info: Dict[str, Any], img_path: str) -> None:
    """
    Insert product information into the products table.

    Args:
        cursor: SQLite cursor object.
        product_info (dict): Dictionary containing product details.
        img_path (str): Path to the image file.

    Raises:
        KeyError: If any required field is missing in product_info.
    """
    required_keys = [
        'name', 'description', 'category', 'material',
        'color', 'dimensions', 'origin_source', 'import_cost', 'retail_price', 'key_tags'
    ]

    # Check for missing keys
    missing_keys = [key for key in required_keys if key not in product_info]
    if missing_keys:
        raise KeyError(f"Missing required fields: {', '.join(missing_keys)}")

    # Convert description list to string if necessary
    description = product_info['description']
    if isinstance(description, list):
        description = '. '.join(description)

    # Convert key_tags list to string if necessary
    key_tags = product_info['key_tags']
    if isinstance(key_tags, list):
        key_tags = ', '.join(key_tags)

    try:
        cursor.execute('''
            INSERT INTO products
            (name, description, image_url, category, material, color, dimensions, origin_source, import_cost, retail_price, key_tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            product_info['name'],
            description,
            img_path,
            product_info['category'],
            product_info['material'],
            product_info['color'],
            product_info['dimensions'],
            product_info['origin_source'],
            product_info['import_cost'] if product_info['import_cost'] is not None else None,
            product_info['retail_price'] if product_info['retail_price'] is not None else None,
            key_tags
        ))
        logging.info("Successfully inserted product info for image: %s", img_path)
    except sqlite3.Error as e:
        logging.error("Failed to insert product info into database: %s", e)

def main() -> None:
    """Main function to initialize the database and process images."""
    parser = argparse.ArgumentParser(description='Process uploaded images.')
    parser.add_argument('--process-images', action='store_true', help='Process uploaded images.')
    parser.add_argument('--instruction', type=str, default="You are an assistant that helps catalog and describe products for inventory.", help='Custom instruction for image analysis.')
    args = parser.parse_args()

    logging.info("Starting main function")
    initialize_database()

    if args.process_images:
        logging.info("Processing images flag detected")
        process_uploaded_images(args.instruction)
    else:
        logging.warning("No valid command-line argument provided. Use --process-images to process uploaded images.")

    logging.info("Main function completed")

if __name__ == "__main__":
    main()
