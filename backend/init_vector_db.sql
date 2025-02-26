-- Vector database schema (Neon PostgreSQL)

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document vectors for semantic search
CREATE TABLE IF NOT EXISTS document_vectors (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    content_vector vector(1536),
    embedding_model TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS document_vectors_idx ON document_vectors 
USING ivfflat (content_vector vector_cosine_ops)
WITH (lists = 100);

-- Document content for full-text search
CREATE TABLE IF NOT EXISTS document_content (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_tsvector tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS document_content_search_idx ON document_content USING gin(content_tsvector);

-- Create index for document_id lookups
CREATE INDEX IF NOT EXISTS document_content_doc_idx ON document_content(document_id);
CREATE INDEX IF NOT EXISTS document_vectors_doc_idx ON document_vectors(document_id);

-- Add update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_vectors_updated_at
    BEFORE UPDATE ON document_vectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_content_updated_at
    BEFORE UPDATE ON document_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add functions for vector similarity search
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    document_id INTEGER,
    similarity float
)
LANGUAGE SQL STABLE
AS $$
    SELECT document_id, 1 - (content_vector <=> query_embedding) as similarity
    FROM document_vectors
    WHERE 1 - (content_vector <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;
