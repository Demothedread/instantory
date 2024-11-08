import os
import base64
import json
import asyncio
import requests
import logging
from datetime import datetime
import shutil
from tenacity import retry, wait_random_exponential, stop_after_attempt
import argparse
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import urllib.parse as urlparse
import openai
from backend.config import DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Import optional dependencies with error handling
try:
    import asyncpg
except ImportError:
    logging.error("asyncpg not found. Please install with: pip install asyncpg")
    raise

try:
    import PyPDF2
except ImportError:
    logging.error("PyPDF2 not found. Please install with: pip install PyPDF2")
    raise

try:
    from docx import Document as DocxDocument
except ImportError:
    logging.error("python-docx not found. Please install with: pip install python-docx")
    raise

# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

async def get_db_pool():
    """Get PostgreSQL connection pool from environment variables or URL."""
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        url = urlparse.urlparse(database_url)
        return await asyncpg.create_pool(
            user=url.username,
            password=url.password,
            database=url.path[1:],
            host=url.hostname,
            port=url.port,
            ssl='require'
        )
    return await asyncpg.create_pool(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        ssl='require'
    )

async def initialize_database() -> None:
    """Initialize the database and create necessary tables."""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Create the products table
            await conn.execute('''
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

            # Create the documents table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    title TEXT,
                    author TEXT,
                    journal_publisher TEXT,
                    publication_year INTEGER,
                    page_length INTEGER,
                    word_count INTEGER,
                    thesis TEXT,
                    issue TEXT,
                    summary TEXT,
                    category TEXT,
                    field TEXT,
                    influences TEXT,
                    hashtags TEXT,
                    file_path TEXT UNIQUE,
                    file_type TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            logging.info("Database initialized successfully.")
        await pool.close()
    except Exception as e:
        logging.error("Error initializing database: %s", e)

def is_image_file(filename: str) -> bool:
    """Check if the file is an image based on extension."""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    return os.path.splitext(filename.lower())[1] in image_extensions

def is_document_file(filename: str) -> bool:
    """Check if the file is a document based on extension."""
    doc_extensions = {'.pdf', '.doc', '.docx', '.txt', '.rtf'}
    return os.path.splitext(filename.lower())[1] in doc_extensions

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text() + '\n'
        return text
    except Exception as e:
        logging.error(f"Error extracting text from PDF {file_path}: {e}")
        return ''

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    try:
        doc = DocxDocument(file_path)
        return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        logging.error(f"Error extracting text from DOCX {file_path}: {e}")
        return ''

def extract_text_from_file(file_path: str) -> str:
    """Extract text from various document formats."""
    ext = os.path.splitext(file_path.lower())[1]
    try:
        if ext == '.pdf':
            return extract_text_from_pdf(file_path)
        elif ext == '.docx':
            return extract_text_from_docx(file_path)
        elif ext in ['.txt', '.rtf']:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        return ''
    except Exception as e:
        logging.error(f"Error extracting text from file {file_path}: {e}")
        return ''

@retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(6))
async def analyze_document(text: str) -> Dict[str, Any]:
    """Analyze document text using OpenAI's GPT-4 model."""
    try:
        # First pass: Extract structure and key sections
        structure_response = await openai.chat.completions.create(
            model="gpt-4o',
            messages=[
                {"role": "system", "content": """
                Analyze this document and identify:
                1. Table of contents (if present)
                2. Reference tables/bibliography
                3. Main section headers
                4. First two introductory paragraphs
                5. Conclusion paragraphs
                
                Return a JSON object with these sections.
                """},
                {"role": "user", "content": text[:8000]}  # First 8000 chars for structure
            ]
        )
        
        structure_data = json.loads(structure_response.choices[0].message.content)
        
        # Second pass: Detailed analysis
        analysis_response = await openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """
                Based on the document sections provided, analyze and provide a JSON object with:
                1. "title": Document title
                2. "author": Author names (if available)
                3. "journal_publisher": Journal or publisher name (if available)
                4. "publication_year": Publication year (if available, as integer)
                5. "page_length": Estimated page length (as integer)
                6. "word_count": Estimated word count (as integer)
                7. "thesis": 1-2 sentence thesis statement
                8. "issue": Main question or problem addressed
                9. "summary": 2-3 paragraph detailed summary
                10. "category": General category (e.g., Research Paper, Technical Report)
                11. "field": Specific field or subject area
                12. "influences": Up to 3 main sources or influences
                13. "hashtags": Relevant keyword tags
                """},
                {"role": "user", "content": json.dumps(structure_data)}
            ]
        )
        
        return json.loads(analysis_response.choices[0].message.content)
    except Exception as e:
        logging.error(f"Error analyzing document: {e}")
        raise

async def process_uploaded_files(instruction: str) -> None:
    """Process uploaded files, handling both images and documents."""
    logging.info("Starting to process uploaded files")
    
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Create batch directories
            batch_timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            images_batch_dir = os.path.join(INVENTORY_IMAGES_DIR, batch_timestamp)
            docs_batch_dir = os.path.join(DATA_DIR, 'documents', batch_timestamp)
            os.makedirs(images_batch_dir, exist_ok=True)
            os.makedirs(docs_batch_dir, exist_ok=True)

            # Process files
            for root, dirs, files in os.walk(UPLOADS_DIR):
                for filename in files:
                    file_path = os.path.join(root, filename)
                    try:
                        if is_image_file(filename):
                            await process_image(file_path, images_batch_dir, instruction, conn)
                        elif is_document_file(filename):
                            await process_document(file_path, docs_batch_dir, conn)
                    except Exception as e:
                        logging.error(f"Error processing file {filename}: {e}")

        await pool.close()
    except Exception as e:
        logging.error("Error in process_uploaded_files: %s", e)

async def process_document(file_path: str, batch_dir: str, conn: asyncpg.Connection) -> None:
    """Process a single document file."""
    filename = os.path.basename(file_path)
    try:
        # Extract text from document
        text = extract_text_from_file(file_path)
        if not text.strip():
            logging.error(f"No text could be extracted from {filename}")
            return

        # Analyze document
        doc_info = await analyze_document(text)
        
        # Save document to batch directory
        new_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        new_file_path = os.path.join(batch_dir, new_filename)
        shutil.copy2(file_path, new_file_path)

        # Insert document info into database
        await conn.execute('''
            INSERT INTO documents
            (title, author, journal_publisher, publication_year, page_length, word_count,
             thesis, issue, summary, category, field, influences, hashtags, file_path, file_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ''',
            doc_info.get('title', ''),
            doc_info.get('author', ''),
            doc_info.get('journal_publisher', ''),
            doc_info.get('publication_year'),
            doc_info.get('page_length'),
            doc_info.get('word_count'),
            doc_info.get('thesis', ''),
            doc_info.get('issue', ''),
            doc_info.get('summary', ''),
            doc_info.get('category', ''),
            doc_info.get('field', ''),
            ','.join(doc_info.get('influences', [])) if isinstance(doc_info.get('influences'), list) else doc_info.get('influences', ''),
            ','.join(doc_info.get('hashtags', [])) if isinstance(doc_info.get('hashtags'), list) else doc_info.get('hashtags', ''),
            new_file_path,
            os.path.splitext(filename)[1][1:]
        )
        
        logging.info(f"Successfully processed document: {filename}")
    except Exception as e:
        logging.error(f"Error processing document {filename}: {e}")
        raise

async def process_image(image_path: str, batch_dir: str, instruction: str, conn: asyncpg.Connection) -> None:
    """Process a single image file."""
    try:
        with Image.open(image_path) as img:
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Scale to max 512 pixels
            max_size = (512, 512)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Save resized image
            new_filename = os.path.splitext(os.path.basename(image_path))[0] + '.jpg'
            new_image_path = os.path.join(batch_dir, new_filename)
            img.save(new_image_path, "JPEG", quality=85)

            # Convert to base64 for analysis
            with open(new_image_path, "rb") as resized_image_file:
                base64_encoded_image = base64.b64encode(resized_image_file.read()).decode("utf-8")

            # Analyze image
            product_info = await analyze_image(base64_encoded_image, instruction)
            if product_info:
                product_info['image_path'] = new_image_path
                await insert_product_info(conn, product_info)
    except Exception as e:
        logging.error(f"Error processing image {image_path}: {e}")
        raise

@retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(6))
async def analyze_image(base64_image: str, instruction: str) -> Dict[str, Any]:
    """Analyze an image using OpenAI's GPT-4 Vision model."""
    try:
        response = await openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": instruction
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyze this product image and provide a JSON object with:
                                - "name": Descriptive name
                                - "description": Concise, detailed product description
                                - "category": choose from a generated set of 4-6 categories, broadly inclusive of other items one would expect seller to offer, but specific enough to be descriptive and meaningful. 
Default: ["Beads", "Furniture", "Bowls", "Fans", "Totebags", "African Decor", "Other"]
                                - "material": Primary material, secondary material italicized. 
                                - "color": Primary colors, secondary colors italicized 
                                - "dimensions": Approximate dimensions based on similar
                                - "origin_source": Likely origin based on style comparables
                                - "import_cost": Estimated import price (USD) based on comparables. 
                                - "retail_price": Estimated retail price (USD)
                                - "key_tags": Important keywords for discovery"""
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
            max_tokens=800
        )
        
        response_text = response.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
            
        return json.loads(response_text)
    except Exception as e:
        logging.error(f"Error analyzing image: {e}")
        return None

async def insert_product_info(conn: asyncpg.Connection, product_info: Dict[str, Any]) -> None:
    """Insert product information into the database."""
    try:
        # Convert price fields
        import_cost = float(product_info['import_cost']) if product_info.get('import_cost') not in (None, 'null') else None
        retail_price = float(product_info['retail_price']) if product_info.get('retail_price') not in (None, 'null') else None

        await conn.execute('''
            INSERT INTO products
            (name, description, image_url, category, material, color, dimensions, 
             origin_source, import_cost, retail_price, key_tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ''', 
            product_info['name'],
            product_info['description'] if isinstance(product_info['description'], str) else '. '.join(product_info['description']),
            product_info['image_path'],
            product_info['category'],
            product_info['material'],
            product_info['color'],
            product_info['dimensions'],
            product_info['origin_source'],
            import_cost,
            retail_price,
            product_info['key_tags'] if isinstance(product_info['key_tags'], str) else ', '.join(product_info['key_tags'])
        )
    except Exception as e:
        logging.error(f"Error inserting product info: {e}")
        raise

async def main_async() -> None:
    """Main async function."""
    parser = argparse.ArgumentParser(description='Process uploaded files.')
    parser.add_argument('--process-files', action='store_true', help='Process uploaded files.')
    parser.add_argument('--instruction', type=str, 
                      default="You are an assistant that helps catalog and analyze both products and documents.",
                      help='Custom instruction for file analysis.')
    args = parser.parse_args()

    logging.info("Starting main function")
    await initialize_database()

    if args.process_files:
        logging.info("Processing files flag detected")
        await process_uploaded_files(args.instruction)
    else:
        logging.warning("No valid command-line argument provided. Use --process-files to process uploaded files.")                                             
    logging.info("Main function completed")

def main():
    """Entry point."""
    asyncio.run(main_async())

if __name__ == "__main__":
    main()
