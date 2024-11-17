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

# Attempt to get the API key from the environment
api_key = os.getenv('OPENAI_API_KEY')
# Check if the API key is set
if api_key is None:
    # Handle the case where the API key is not set
    raise ValueError("API key not found. Please set the OPENAI_API_KEY environment variable.")

#Initialize AsyncOpenAI client
client = AsyncOpenAI(
    api_key=api_key,
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


def extract_text_for_analysis(file_path: str) -> Tuple[str, str]:
    """
    Extract limited text for GPT analysis and full text for embeddings.
    Returns tuple of (analysis_text, full_text).
    Analysis text is limited to ~4000 tokens, full text is complete document.
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
                        return "", ""
                    
                    # Extract full text first
                    for page_num in range(len(pdf_reader.pages)):
                        try:
                            page = pdf_reader.pages[page_num]
                            if page is None:
                                continue
                            page_text = page.extract_text()
                            if page_text:
                                full_text += page_text + "\n"
                                # Collect TOC sections from early pages
                                if page_num < 5:
                                    if re.search(r'(?i)(contents|table\s+of\s+contents)', page_text):
                                        toc_sections.extend(re.findall(r'^.*?[\d]+$', page_text, re.MULTILINE))
                        except Exception as e:
                            logging.error(f"Error extracting text from page {page_num}: {str(e)}")
                            continue
                    
            except Exception as e:
                logging.error(f"Error reading PDF: {str(e)}")
                return "", ""
                    
        elif file_ext == '.docx':
            try:
                doc = Document(file_path)
                for para in doc.paragraphs:
                    if para.style.name.startswith('Heading'):
                        toc_sections.append(para.text)
                    full_text += para.text + "\n"
            except Exception as e:
                logging.error(f"Error reading DOCX: {str(e)}")
                return "", ""
                        
        elif file_ext == '.txt':
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    full_text = file.read()
                    lines = full_text.split('\n')
                    for line in lines:
                        if (line.isupper() and len(line) > 3) or \
                        re.match(r'^\s*\d+\.\s+[A-Z]', line) or \
                        re.match(r'^Chapter\s+\d+', line, re.IGNORECASE):
                            toc_sections.append(line)
            except Exception as e:
                logging.error(f"Error reading text file: {str(e)}")
                return "", ""
        else:
            logging.error(f"Unsupported file type: {file_ext}")
            return "", ""

        if not full_text.strip():
            return "", ""

        # Create analysis text with limited content
        analysis_parts = []
        
        # Add start of main body (600 chars)
        main_text_start = re.sub(r'\s+', ' ', full_text[:800])
        analysis_parts.append(main_text_start)
        
        # Add end of main body (600 chars)
        main_text_end = re.sub(r'\s+', ' ', full_text[-800:])
        analysis_parts.append(main_text_end)
        
        # Extract TOC/index/bibliography (250 chars)
        structural_text = ""
        toc_match = re.search(r'(?i)table\s+of\s+contents.*?(?=chapter|\d+\.|\n\n)', full_text)
        if toc_match:
            structural_text += toc_match.group(0)[:100]
        
        index_match = re.search(r'(?i)index.*?(?=\n\n|$)', full_text)
        if index_match:
            structural_text += index_match.group(0)[:85]
            
        bibliography_match = re.search(r'(?i)(bibliography|references).*?(?=\n\n|$)', full_text)
        if bibliography_match:
            structural_text += bibliography_match.group(0)[:95]
            
        analysis_parts.append(re.sub(r'\s+', ' ', structural_text))
        
        # Extract section transitions (up to 1000 chars total)
        section_texts = []
        total_section_chars = 0
        
        for i, section in enumerate(toc_sections):
            if total_section_chars >= 1200:
                break
                
            section_pattern = re.escape(section.strip())
            match = re.search(f"(.{{0,150}}{section_pattern}.{{0,150}})", full_text)
            
            if match:
                section_text = match.group(1)
                # Limit to 2 paragraphs
                paragraphs = re.split(r'\n\s*\n', section_text)[:2]
                section_text = ' '.join(paragraphs)
                
                chars_to_add = min(150, 1000 - total_section_chars)
                section_texts.append(section_text[:chars_to_add])
                total_section_chars += chars_to_add
        
        analysis_parts.extend(section_texts)
        
        # Combine parts with clear separation
        analysis_text = "\n---\n".join(analysis_parts)
        
        return analysis_text, full_text
                        
    except Exception as e:
        logging.error(f"Error extracting text: {str(e)}")
        return "", ""

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
    """Analyze document text using OpenAI's GPT-4 model with focus on key metadata."""
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """
                Analyze this document and provide a JSON object with the following fields:
                1. "title": Document title (required)
                2. "author": Author names if available (required)
                3. "category": Document type (e.g., Research Paper, Technical Report) (required)
                4. "field": Primary field or subject area (required)
                5. "publication_year": Publication year as integer if available
                6. "journal_publisher": Journal or publisher name if available
                7. "thesis": Clear, concise thesis statement (required)
                8. "issue": Main question or problem addressed (required)
                9. "summary": Comprehensive summary in 400 characters or less (required)
                10. "influences": Key sources or schools of thought that influenced this work
                11. "hashtags": 3-5 relevant keyword tags for categorization
                
                Focus on accuracy and conciseness. For required fields, provide best inference if not explicitly stated.
                Ensure summary is under 400 characters while capturing key points.
                """},
                {"role": "user", "content": text}
            ],
            max_tokens=1600,
            temperature=0.2,
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logging.error(f"Error analyzing document: {e}")
        raise

async def process_document(file_path: str, batch_dir: str, conn: asyncpg.Connection) -> None:
    """Process a single document file with separate handling for analysis and embeddings."""
    filename = os.path.basename(file_path)
    try:
        # Extract text for both analysis and embeddings
        analysis_text, full_text = extract_text_for_analysis(file_path)
        if not analysis_text or not full_text:
            logging.error(f"No text could be extracted from {filename}")
            return
        
        if len(full_text) > 10000:
            return full_text(:5000) + '...' + full_text(-5000:)
        else:
            return full_text

        # Create embeddings from full text
        chunks = chunk_text(full_text)
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

        # Create document-level embedding from first portion of full text
        doc_embedding = await create_embedding(full_text)
        if not doc_embedding:
            logging.error(f"Failed to create embedding for {filename}")
            return

        # Analyze document using limited text
        doc_info = await analyze_document(analysis_text)
        
        # Save document to batch directory
        new_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        new_file_path = os.path.join(batch_dir, new_filename)
        shutil.copy2(file_path, new_file_path)

        # Ensure full_text is available before attempting to insert
        if full_text is None or full_text == "":
            logging.error(f'Full text is not available for document: {filename}')
            return
    
        # Insert document info into database
        doc_id = await conn.fetchval('''
            INSERT INTO documents
            (title, author, journal_publisher, publication_year, page_length,
             thesis, issue, summary, category, field, influences, hashtags,
             file_path, file_type, full_text, content_embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING id
        ''',
            doc_info.get('title', ''),
            doc_info.get('author', ''),
            doc_info.get('journal_publisher', ''),
            doc_info.get('publication_year'),
            len(full_text.split('\n')),  # Estimate page length
            doc_info.get('thesis', ''),
            doc_info.get('issue', ''),
            doc_info.get('summary', '')[:400],  # Ensure summary length
            doc_info.get('category', ''),
            doc_info.get('field', ''),
            ','.join(doc_info.get('influences', [])) if isinstance(doc_info.get('influences'), list) else doc_info.get('influences', ''),
            ','.join(doc_info.get('hashtags', [])) if isinstance(doc_info.get('hashtags'), list) else doc_info.get('hashtags', ''),
            new_file_path,
            os.path.splitext(filename)[1][1:],
            full_text.strip(),
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
