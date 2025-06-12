-- Metadata database schema (Render PostgreSQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    material TEXT,
    color TEXT,
    dimensions TEXT,
    origin_source TEXT,
    import_cost DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    original_image_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents metadata table
CREATE TABLE IF NOT EXISTS user_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    journal_publisher TEXT,
    publication_year INTEGER,
    page_length INTEGER,
    thesis TEXT,
    issue TEXT,
    summary TEXT,
    category TEXT,
    field TEXT,
    hashtags TEXT[],
    influenced_by TEXT[],
    file_path TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document access control
CREATE TABLE IF NOT EXISTS document_access (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES user_documents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL CHECK (access_level IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON user_inventory(category);
CREATE INDEX IF NOT EXISTS idx_documents_user ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON user_documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_field ON user_documents(field);
CREATE INDEX IF NOT EXISTS idx_document_access_doc ON document_access(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_user ON document_access(user_id);

-- Add GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_documents_hashtags ON user_documents USING gin(hashtags);
CREATE INDEX IF NOT EXISTS idx_documents_influenced_by ON user_documents USING gin(influenced_by);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_access_updated_at
    BEFORE UPDATE ON document_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add functions for document access control
CREATE OR REPLACE FUNCTION check_document_access(
    p_user_id INTEGER,
    p_document_id INTEGER,
    p_required_level TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM document_access
        WHERE user_id = p_user_id
        AND document_id = p_document_id
        AND (
            CASE p_required_level
                WHEN 'owner' THEN access_level = 'owner'
                WHEN 'editor' THEN access_level IN ('owner', 'editor')
                WHEN 'viewer' THEN access_level IN ('owner', 'editor', 'viewer')
            END
        )
    );
END;
$$;
