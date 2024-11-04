import os
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
import psycopg2
from psycopg2 import sql, OperationalError
import urllib.parse as urlparse
from backend.config import DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_db_connection():
    """Get PostgreSQL database connection from environment variables or URL."""
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Parse the URL
        url = urlparse.urlparse(database_url)
        dbname = url.path[1:]
        user = url.username
        password = url.password
        host = url.hostname
        port = url.port

        return psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port,
            sslmode='require'  # Required for Render PostgreSQL
        )
    else:
        # Fallback to individual environment variables
        return psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            sslmode='require'  # Required for Render PostgreSQL
        )

def initialize_database() -> None:
    """Initialize the database and create the products table if it doesn't exist."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Create the products table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
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
            cursor.execute("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='products' AND column_name='key_tags';
            """)
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE products ADD COLUMN key_tags TEXT")

            conn.commit()
            logging.info("Database initialized successfully.")
    except OperationalError as e:
        logging.error("Error initializing database: %s", e)

# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

def process_uploaded_images(instruction: str) -> None:
    """Process uploaded images recursively, create a new directory, and save the processed images."""
    logging.info("Starting to process uploaded images")
    
    try:
        conn = get_db_connection()
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
                        # Process image and get product info
                        product_info = process_single_image(image_path, batch_dir, instruction)
                        
                        if product_info and product_info['image_path'] not in existing_images:
                            insert_product_info(cursor, product_info)
                            conn.commit()
                            logging.info("Successfully processed and moved image: %s", filename)
                        else:
                            logging.info("Image already exists or processing failed: %s", filename)
                    except Exception as e:
                        logging.error("Error processing image %s: %s", filename, e)
                        conn.rollback()

        conn.close()
    except Exception as e:
        logging.error("Error in process_uploaded_images: %s", e)
        if 'conn' in locals():
            conn.close()

def process_single_image(image_path: str, batch_dir: str, instruction: str) -> Dict[str, Any]:
    """Process a single image and return product information."""
    with Image.open(image_path) as img:
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Calculate the scaling factor to keep max dimension at 512 pixels
        max_size = (512, 512)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Save the resized image in the batch directory with .jpg extension
        new_filename = os.path.splitext(os.path.basename(image_path))[0] + '.jpg'
        new_image_path = os.path.join(batch_dir, new_filename)
        img.save(new_image_path, "JPEG", quality=85)

        # Convert resized image to base64
        with open(new_image_path, "rb") as resized_image_file:
            base64_encoded_image = base64.b64encode(resized_image_file.read()).decode("utf-8")

        # Analyze image
        product_info = analyze_image(base64_encoded_image, instruction)
        if product_info:
            product_info['image_path'] = new_image_path
            return product_info
        return None

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
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        response_text = response.json()['choices'][0]['message']['content'].strip()

        # Remove any markdown formatting if present
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]

        return json.loads(response_text)
    except Exception as e:
        logging.error("Error in analyze_image: %s", e)
        return None

def insert_product_info(cursor: psycopg2.extensions.cursor, product_info: Dict[str, Any]) -> None:
    """Insert product information into the PostgreSQL database."""
    try:
        cursor.execute('''
            INSERT INTO products
            (name, description, image_url, category, material, color, dimensions, origin_source, import_cost, retail_price, key_tags)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            product_info['name'],
            product_info['description'] if isinstance(product_info['description'], str) else '. '.join(product_info['description']),
            product_info['image_path'],
            product_info['category'],
            product_info['material'],
            product_info['color'],
            product_info['dimensions'],
            product_info['origin_source'],
            product_info['import_cost'] if product_info['import_cost'] != 'null' else None,
            product_info['retail_price'] if product_info['retail_price'] != 'null' else None,
            product_info['key_tags'] if isinstance(product_info['key_tags'], str) else ', '.join(product_info['key_tags'])
        ))
    except Exception as e:
        logging.error("Error inserting product info: %s", e)
        raise

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
