"""Document processor for handling document files."""
import os
import re
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
import asyncpg

from openai import AsyncOpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt

from .base_processor import BaseProcessor
from ...config.logging import log_config
from ...config.storage import get_storage_config

logger = log_config.get_logger(__name__)
storage = get_storage_config()

class DocumentProcessor(BaseProcessor):
    """Processor for document files (PDF, DOCX, TXT)."""
    
    SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.txt'}
    
    def __init__(self, db_pool: asyncpg.Pool, openai_client: AsyncOpenAI):
        super().__init__()
        self.db_pool = db_pool
        self.openai_client = openai_client
    
    @staticmethod
    def is_supported_file(file_path: Path) -> bool:
        """Check if file type is supported."""
        return file_path.suffix.lower() in DocumentProcessor.SUPPORTED_EXTENSIONS
    
    async def process_file(self, file_path: Path) -> bool:
        """Process a single document file."""
        if not self.is_supported_file(file_path):
            logger.warning(f"Unsupported file type: {file_path}")
            return False
        
        try:
            # Extract text for analysis and storage
            analysis_text, full_text = await self._extract_text(file_path)
            if not analysis_text or not full_text:
                logger.error(f"No text could be extracted from {file_path}")
                return False
            
            # Analyze document using GPT-4
            doc_info = await self._analyze_document(analysis_text)
            
            # Save document to storage
            new_path = await self._save_document(file_path)
            
            # Store in database
            async with self.db_pool.acquire() as conn:
                await self._store_document_data(conn, doc_info, new_path, full_text)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {e}")
            raise
    
    async def _extract_text(self, file_path: Path) -> Tuple[str, str]:
        """Extract text from document for both analysis and storage."""
        try:
            file_ext = file_path.suffix.lower()
            full_text = ""
            toc_sections = []
            
            if file_ext == '.pdf':
                try:
                    import PyPDF2
                    with open(file_path, 'rb') as file:
                        pdf_reader = PyPDF2.PdfReader(file)
                        if len(pdf_reader.pages) == 0:
                            raise ValueError("PDF has no pages")
                        
                        for page in pdf_reader.pages:
                            text = page.extract_text()
                            if text:
                                text = self._clean_text(text)
                                full_text += text + "\n"
                                
                except ImportError:
                    logger.error("PyPDF2 not installed")
                    raise
                    
            elif file_ext == '.docx':
                try:
                    from docx import Document
                    doc = Document(file_path)
                    for para in doc.paragraphs:
                        text = self._clean_text(para.text)
                        full_text += text + "\n"
                        
                except ImportError:
                    logger.error("python-docx not installed")
                    raise
                    
            elif file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                    full_text = self._clean_text(file.read())
            
            # Create analysis text with limited content
            analysis_text = self._prepare_analysis_text(full_text)
            
            return analysis_text, full_text
            
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        # Remove control characters
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]', '', text)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        # Ensure UTF-8 compatibility
        text = text.encode('utf-8', 'ignore').decode('utf-8')
        return text.strip()
    
    def _prepare_analysis_text(self, full_text: str, max_length: int = 3000) -> str:
        """Prepare text for analysis by selecting key sections."""
        parts = []
        
        # Add document start (1000 chars)
        parts.append(full_text[:1000])
        
        # Add document end (1000 chars)
        if len(full_text) > 1000:
            parts.append(full_text[-1000:])
        
        # Add sections from middle (1000 chars)
        if len(full_text) > 2000:
            mid_point = len(full_text) // 2
            parts.append(full_text[mid_point-500:mid_point+500])
        
        return "\n---\n".join(parts)
    
    @retry(wait=wait_random_exponential(min=1, max=40), stop=stop_after_attempt(3))
    async def _analyze_document(self, text: str) -> Dict[str, Any]:
        """Analyze document text using OpenAI's GPT-4 model."""
        try:
            response = await self.openai_client.chat.completions.create(
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
                    10. "influenced_by": 1-3 relevant persons, papers, cases, institutions, etc.
                    11. "hashtags": 3-5 relevant keyword tags for categorization
                    """},
                    {"role": "user", "content": text}
                ],
                max_tokens=1600,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return content if isinstance(content, dict) else json.loads(content)
            
        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            return self._get_default_analysis()
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Get default analysis when processing fails."""
        return {
            'title': 'Untitled Document',
            'author': 'Unknown Author',
            'category': 'Document',
            'field': 'General',
            'publication_year': None,
            'journal_publisher': None,
            'thesis': 'Document analysis unavailable',
            'issue': 'Unable to determine',
            'summary': 'Document processing error occurred',
            'influenced_by': [],
            'hashtags': []
        }
    
    async def _save_document(self, source_path: Path) -> Path:
        """Save document to storage with timestamp."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        new_filename = f"{timestamp}_{source_path.name}"
        dest_path = storage.get_path('DOCUMENT_DIRECTORY') / new_filename
        
        try:
            shutil.copy2(source_path, dest_path)
            return dest_path
        except Exception as e:
            logger.error(f"Error saving document: {e}")
            raise
    
    async def _store_document_data(self, conn: asyncpg.Connection, 
                                 doc_info: Dict[str, Any], 
                                 file_path: Path,
                                 full_text: str) -> None:
        """Store document metadata and text in database."""
        try:
            await conn.execute('''
                INSERT INTO documents
                (title, author, journal_publisher, publication_year, page_length,
                 thesis, issue, summary, category, field, hashtags, influenced_by,
                 file_path, file_type, extracted_text)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ''',
                doc_info.get('title', ''),
                doc_info.get('author', ''),
                doc_info.get('journal_publisher', ''),
                doc_info.get('publication_year'),
                len(full_text.split('\n')),
                doc_info.get('thesis', ''),
                doc_info.get('issue', ''),
                doc_info.get('summary', '')[:400],
                doc_info.get('category', ''),
                doc_info.get('field', ''),
                ','.join(doc_info.get('hashtags', [])),
                ','.join(doc_info.get('influenced_by', [])),
                str(file_path),
                file_path.suffix[1:],
                full_text
            )
        except Exception as e:
            logger.error(f"Error storing document data: {e}")
            raise
