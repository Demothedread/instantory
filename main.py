import os
import base64
import json
import asyncio
import logging
from datetime import datetime
import shutil
from tenacity import retry, wait_random_exponential, stop_after_attempt
import argparse
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from PIL import Image
import urllib.parse as urlparse
from openai import AsyncOpenAI
from backend.config import DATA_DIR, UPLOADS_DIR, INVENTORY_IMAGES_DIR, TEMP_DIR, EXPORTS_DIR

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize AsyncOpenAI client with proper configuration
client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    timeout=60.0  # Increased timeout for production environment
)

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
                )
            ''')

            logging.info("Database initialized successfully.")
        await pool.close()
    except Exception as e:
        logging.error("Error initializing database: %s", e)
        raise

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

# [Rest of the code remains the same...]
