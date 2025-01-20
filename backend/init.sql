-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table with vector support
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
    content_embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);
