-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture_url TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'email',
    google_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    material TEXT,
    color TEXT,
    dimensions TEXT,
    origin_source TEXT,
    import_cost REAL,
    retail_price REAL,
    key_tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_documents table
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
    category TEXT NOT NULL,
    field TEXT,
    hashtags TEXT,
    influenced_by TEXT,
    file_path TEXT UNIQUE NOT NULL,
    file_type TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_exports table
CREATE TABLE IF NOT EXISTS user_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    export_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_template table for new user initialization
CREATE TABLE IF NOT EXISTS inventory_template (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    material TEXT,
    color TEXT,
    dimensions TEXT,
    origin_source TEXT,
    import_cost REAL,
    retail_price REAL
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- User inventory trigger
DROP TRIGGER IF EXISTS update_user_inventory_updated_at ON user_inventory;
CREATE TRIGGER update_user_inventory_updated_at
    BEFORE UPDATE ON user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User documents trigger
DROP TRIGGER IF EXISTS update_user_documents_updated_at ON user_documents;
CREATE TRIGGER update_user_documents_updated_at
    BEFORE UPDATE ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_category ON user_inventory(category);
CREATE INDEX IF NOT EXISTS idx_user_inventory_name ON user_inventory(name);
CREATE INDEX IF NOT EXISTS idx_user_inventory_material ON user_inventory(material);
CREATE INDEX IF NOT EXISTS idx_user_inventory_color ON user_inventory(color);
CREATE INDEX IF NOT EXISTS idx_user_inventory_origin ON user_inventory(origin_source);
CREATE INDEX IF NOT EXISTS idx_user_inventory_created ON user_inventory(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_title ON user_documents(title);
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON user_documents(category);
CREATE INDEX IF NOT EXISTS idx_user_documents_field ON user_documents(field);
CREATE INDEX IF NOT EXISTS idx_user_documents_created ON user_documents(created_at DESC);

-- Create text search indexes
CREATE INDEX IF NOT EXISTS idx_user_documents_text_search ON user_documents 
USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || 
                                COALESCE(author, '') || ' ' || 
                                COALESCE(summary, '') || ' ' || 
                                COALESCE(thesis, '') || ' ' || 
                                COALESCE(extracted_text, '')));

CREATE INDEX IF NOT EXISTS idx_user_inventory_text_search ON user_inventory 
USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || 
                                COALESCE(description, '') || ' ' || 
                                COALESCE(material, '') || ' ' || 
                                COALESCE(origin_source, '')));

-- Create materialized views for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS user_inventory_summary AS
SELECT 
    i.id,
    i.user_id,
    i.name,
    i.category,
    i.material,
    i.color,
    i.origin_source,
    i.import_cost,
    i.retail_price,
    i.created_at,
    u.email as user_email
FROM user_inventory i
JOIN users u ON i.user_id = u.id
ORDER BY i.created_at DESC
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_summary_id ON user_inventory_summary(id);
CREATE INDEX IF NOT EXISTS idx_inventory_summary_user_id ON user_inventory_summary(user_id);

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_inventory_summary;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_mat_views_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_materialized_views();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_mat_views ON user_inventory;
CREATE TRIGGER refresh_mat_views
    AFTER INSERT OR UPDATE OR DELETE ON user_inventory
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_mat_views_trigger();
