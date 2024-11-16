import os
import base64
import json
import asyncio
import logging
from datetime import datetime
import shutil
from tenacity import retry, wait_random_exponential, stop_after_attempt
import argparse
import asyncpg
from typing import Dict, Any, Optional, List, Tuple
from dotenv import load_dotenv
from PIL import Image
import urllib.parse as urlparse
from openai import AsyncOpenAI
from backend.config import DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR
import PyPDF2
from docx import Document
import re

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize AsyncOpenAI client with proper configuration
client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    timeout=60.0  # Increased timeout for production environment
)

async def get_db_pool():
    """Get PostgreSQL connection pool from environment variables or URL."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is required")
    
    url = urlparse.urlparse(database_url)
    return await asyncpg.create_pool(
        user=url.username,
        password=url.password,
        database=url.path[1:],
        host=url.hostname,
        port=url.port,
        ssl='require',  # Required for Render PostgreSQL
        min_size=1,     # Minimum number of connections
        max_size=10     # Maximum number of connections
    )

async def initialize_database() -> None:
    """Initialize the database and create necessary tables."""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Create the products table if it doesn't exist
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

            # Create the documents table with vector search support and full text
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
                    full_text TEXT,
                    content_embedding vector(1536),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Create document chunks table for granular search
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
                    chunk_text TEXT,
                    chunk_index INTEGER,
                    chunk_embedding vector(1536),
                    context TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )'''
                               )

            logging.info("Database initialized successfully.")
            
        await pool.close()
    
    except Exception as e:
        logging.error("Error initializing database: %s", e)
        raise
def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from various file types (PDF, DOCX, TXT) with special attention to structure.
    Returns the processed text with focus on TOC, section headings, and key parts.
    """
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        full_text = ""
        toc_sections = []
        
        # Extract text based on file type
        if file_ext == '.pdf':
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    if len(pdf_reader.pages) == 0:
                        logging.error(f"PDF file {file_path} has no pages")
                        return ""
                        
                    # First pass: collect all text and identify potential TOC
                    for page_num in range(len(pdf_reader.pages)):
                        try:
                            page = pdf_reader.pages[page_num]
                            if page is None:
                                continue
                            
                            page_text = page.extract_text()
                            if not page_text:
                                continue
                                
                            full_text += page_text + "\n"
                            
                            # Look for table of contents patterns
                            if page_num < 5:  # Usually TOC is in first few pages
                                if re.search(r'(?i)(contents|table\s+of\s+contents)', page_text):
                                    toc_sections.extend(re.findall(r'^.*?[\d]+$', page_text, re.MULTILINE))
                        except Exception as e:
                            logging.error(f"Error extracting text from page {page_num} of {file_path}: {str(e)}")
                            continue
                    
                    # Second pass: extract text with attention to TOC sections
                    for section in toc_sections:
                        section_text = ""
                        section_found = False
                        for page in pdf_reader.pages:
                            page_text = page.extract_text()
                            if section in page_text:
                                section_found = True
                            if section_found:
                                section_text += page_text + "\n"
                            if section_found and re.search(r'^.*?[\d]+$', page_text, re.MULTILINE):
                                break  # Next section found, stop appending text
                        full_text += section_text + "\n"

                    return full_text
                        
            except FileNotFoundError:
                logging.error(f"File not found: {file_path}")
                return ""
            except PyPDF2.errors.PdfReadError:
                logging.error(f"Error reading PDF file: {file_path}")  
                return ""
                    
        elif file_ext == '.docx':
            doc = Document(file_path)
            full_text = ""
            # Process paragraphs with attention to headings
            for para in doc.paragraphs:
                if para.style.name.startswith('Heading'):
                    toc_sections.append(para.text)
                full_text += para.text + "\n"
                        
        elif file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                full_text = file.read()
                # Look for potential section headers in text files
                lines = full_text.split('\n')
                for i, line in enumerate(lines):
                    # Identify likely headers (all caps, numbered sections, etc.)
                    if (line.isupper() and len(line) > 3) or \
                    re.match(r'^\s*\d+\.\s+[A-Z]', line) or \
                    re.match(r'^Chapter\s+\d+', line, re.IGNORECASE):
                        toc_sections.append(line)

        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
                
        # Process the extracted text
        # Get first and last 1000 characters
        intro = full_text[:1000]
        conclusion = full_text[-1000:]
        
        # Find context around section headings
        processed_text = intro + "\n\n"
        
        # Extract context around each section heading
        for section in toc_sections:
            section_pattern = re.escape(section.strip())
            match = re.search(f"(.{{0,300}}{section_pattern}.{{0,300}})", full_text)
            if match:
                processed_text += f"\n\n{match.group(1)}\n\n"
        
        processed_text += "\n\n" + conclusion
        
        return processed_text
                        
    except Exception as e:
        logging.error(f"Error reading PDF file {file_path}: {str(e)}")
        return ""

def chunk_text(text: str, chunk_size: int = 1000) -> List[Dict[str, Any]]:
    """Split text into chunks with context."""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size):
        # Get current chunk
        chunk_words = words[i:i + chunk_size]
        
        # Get context (previous and next 100 words)
        prev_context = ' '.join(words[max(0, i-100):i])
        next_context = ' '.join(words[min(i+chunk_size, len(words)):min(i+chunk_size+100, len(words))])
        
        chunks.append({
            'text': ' '.join(chunk_words),
            'context': f"{prev_context} [...] {next_context}",
            'index': i // chunk_size
        })
    
    return chunks

async def create_embedding(text: str) -> List[float]:
    """Create an embedding for the given text using OpenAI's API."""
    try:
        response = await client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logging.error(f"Error creating embedding: {e}")
        return None

@retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(6))
async def analyze_document(text: str) -> Dict[str, Any]:
    """Analyze document text using OpenAI's GPT-4 model."""
    try:
        # Analyze full document structure
        structure_response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": 
                """
                Analyze this document and identify:
                1. Table of contents (if present)
                2. Reference tables/bibliography
                3. Main section headers
                4. Key arguments and themes
                5. Methodology (if present)
                6. Conclusions
                
                Return a JSON object with these sections.
                """},
                {"role": "user", "content": text[:2500] + text[-1500:]+ text}   # First and last 2500 chars
            ]
        )
        
        structure_data = json.loads(structure_response.choices[0].message.content)
        
        # Detailed analysis of full document
        analysis_response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """
                Based on the full document analysis, provide a JSON object with:
                1. "title": Document title
                2. "author": Author names (if available)
                3. "journal_publisher": Journal or publisher name (if available)
                4. "publication_year": Publication year (if available, as integer)
                5. "page_length": Estimated page length (as integer)
                6. "word_count": Estimated word count (as integer)
                7. "thesis": Clear thesis statement
                8. "issue": Main question or problem addressed
                9. "summary": Comprehensive summary
                10. "category": General category (e.g., Research Paper, Technical Report)
                11. "field": Primary and secondary fields
                12. "influences": Key sources, movements, or schools of thought
                13. "hashtags": Relevant keyword tags
                """},
                {"role": "user", "content": json.dumps(structure_data)}
            ]
        )
        
        return json.loads(analysis_response.choices[0].message.content)
    except Exception as e:
        logging.error(f"Error analyzing document: {e}")
        raise

async def process_document(file_path: str, batch_dir: str, conn: asyncpg.Connection) -> None:
    """Process a single document file."""
    filename = os.path.basename(file_path)
    try:
        # Extract text from document
        text = extract_text_from_file(file_path)
        if not text.strip():
            logging.error(f"No text could be extracted from {filename}")
            return

        # Create chunks and embeddings
        chunks = chunk_text(text)
        chunk_embeddings = []
        for chunk in chunks:
            embedding = await create_embedding(chunk['text'])
            if embedding:
                chunk_embeddings.append({
                    'embedding': embedding,
                    'text': chunk['text'],
                    'context': chunk['context'],
                    'index': chunk['index']
                })

        # Create document-level embedding
        doc_embedding = await create_embedding(text[:4000])  # Use first 4000 chars for doc-level embedding
        if not doc_embedding:
            logging.error(f"Failed to create embedding for {filename}")
            return

        # Analyze document
        doc_info = await analyze_document(text)
        
        # Save document to batch directory
        new_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        new_file_path = os.path.join(batch_dir, new_filename)
        shutil.copy2(file_path, new_file_path)

        # Insert document info into database
        doc_id = await conn.fetchval('''
            INSERT INTO documents
            (title, author, journal_publisher, publication_year, page_length, word_count,
             thesis, issue, summary, category, field, influences, hashtags, file_path, 
             file_type, full_text, content_embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING id
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
            os.path.splitext(filename)[1][1:],
            text,  # Store full text
            doc_embedding
        )

        # Insert chunk data
        for chunk_data in chunk_embeddings:
            await conn.execute('''
                INSERT INTO document_chunks
                (document_id, chunk_text, chunk_index, chunk_embedding, context)
                VALUES ($1, $2, $3, $4, $5)
            ''',
                doc_id,
                chunk_data['text'],
                chunk_data['index'],
                chunk_data['embedding'],
                chunk_data['context']
            )
        
        logging.info(f"Successfully processed document: {filename}")
    except Exception as e:
        logging.error(f"Error processing document {filename}: {e}")
        raise

async def search_documents(query: str, conn: asyncpg.Connection, limit: int = 5) -> List[Dict[str, Any]]:
    """Search documents using vector similarity."""
    try:
        # Create embedding for the search query
        query_embedding = await create_embedding(query)
        if not query_embedding:
            return []

        # Search both document-level and chunk-level
        results = await conn.fetch('''
            WITH document_scores AS (
                SELECT 
                    d.id,
                    d.title,
                    d.summary,
                    d.category,
                    d.field,
                    1 - (d.content_embedding <=> $1::vector) as doc_similarity,
                    array_agg(json_build_object(
                        'text', dc.chunk_text,
                        'context', dc.context,
                        'similarity', 1 - (dc.chunk_embedding <=> $1::vector)
                    )) as chunks
                FROM documents d
                LEFT JOIN document_chunks dc ON d.id = dc.document_id
                WHERE d.content_embedding IS NOT NULL
                GROUP BY d.id, d.title, d.summary, d.category, d.field, d.content_embedding
                ORDER BY doc_similarity DESC
                LIMIT $2
            )
            SELECT 
                id, title, summary, category, field,
                doc_similarity as similarity,
                chunks
            FROM document_scores
        ''', query_embedding, limit)

        return [dict(r) for r in results]
    except Exception as e:
        logging.error(f"Error searching documents: {e}")
        return []

async def process_uploaded_images(instruction: str, conn: asyncpg.Connection) -> None:
    """Process uploaded images recursively, create a new directory, and save the processed images."""
    logging.info("Starting to process uploaded images")
    try:
        # Retrieve existing image URLs from the database to avoid duplicates
        existing_images = {row['image_url'] for row in await conn.fetch("SELECT image_url FROM products")}
        
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
                        # Open and process the image file
                        with Image.open(image_path) as img:
                            if img.mode == 'RGBA':
                                img = img.convert('RGB')
                            
                            # Resize the image
                            max_size = (512, 512)
                            img.thumbnail(max_size, Image.Resampling.LANCZOS)

                            # Save the resized image in the batch directory
                            new_filename = os.path.splitext(filename)[0] + '.jpg'
                            new_image_path = os.path.join(batch_dir, new_filename)
                            img.save(new_image_path, "JPEG", quality=85)

                            # Convert resized image to base64
                            with open(new_image_path, "rb") as resized_image_file:
                                base64_encoded_image = base64.b64encode(resized_image_file.read()).decode("utf-8")

                            logging.info("Moved image to new directory: %s", new_image_path)

                            # Check if the image already exists in the database
                            if new_image_path not in existing_images:
                                product_info = await analyze_image(base64_encoded_image, instruction)
                                if product_info:
                                    await insert_product_info(conn, product_info, new_image_path)
                                    logging.info("Successfully processed and moved image: %s", filename)
                                else:
                                    logging.error("Failed to analyze image: %s", filename)
                            else:
                                logging.info("Image already exists in database: %s", filename)
                    except Exception as e:
                        logging.error("Error processing image %s: %s", filename, e)
    except Exception as e:
        logging.error("Error processing uploaded images: %s", e)
        raise

@retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(6))
async def analyze_image(base64_image: str, instruction: str) -> Dict[str, Any]:
    """Analyze an image using OpenAI's GPT-4 model and return product features."""
    try:
        response = await client.chat.completions.create(
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
            max_tokens=700
        )
        
        response_text = response.choices[0].message.content.strip()
        return json.loads(response_text)
    except Exception as e:
        logging.error("Error analyzing image: %s", e)
        return {}

async def insert_product_info(conn: asyncpg.Connection, product_info: Dict[str, Any], image_path: str) -> None:
    """Insert product information into the database."""
    try:
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
            image_path,
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
        logging.error("Error inserting product info: %s", e)
        raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process files and images.')
    parser.add_argument('--process-files', action='store_true', help='Process files in the uploads directory')
    parser.add_argument('--instruction', type=str, default="Catalog, categorize and Describe the item.", help='Instruction for processing')
    args = parser.parse_args()

    async def main():
        if args.process_files:
            # Get database connection pool
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                await process_uploaded_images(args.instruction, conn)
            await pool.close()

    if args.process_files:
        asyncio.run(main())
