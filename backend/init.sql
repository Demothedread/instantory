-- Create users table if not exists
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

-- Create default inventory template
CREATE TABLE IF NOT EXISTS inventory_template (
    id SERIAL PRIMARY KEY,
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

-- Create user-specific inventory table
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

-- Create user-specific document vault
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
    file_path TEXT,
    file_type TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_category ON user_inventory(category);
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON user_documents(category);

-- Create materialized view for user inventory summary
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
    i.created_at
FROM user_inventory i
ORDER BY i.created_at DESC
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_inventory_summary_id ON user_inventory_summary(id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
DROP TRIGGER IF EXISTS update_user_inventory_timestamp ON user_inventory;
CREATE TRIGGER update_user_inventory_timestamp
    BEFORE UPDATE ON user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_documents_timestamp ON user_documents;
CREATE TRIGGER update_user_documents_timestamp
    BEFORE UPDATE ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create user-specific directories
CREATE OR REPLACE FUNCTION create_user_directories()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder. The actual directory creation will be handled by the application
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user directories on user creation
CREATE TRIGGER create_user_directories_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_directories();
