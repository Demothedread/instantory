    BEFORE UPDATE ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Frontend assets trigger
DROP TRIGGER IF EXISTS update_frontend_assets_updated_at ON frontend_assets;
CREATE TRIGGER update_frontend_assets_updated_at
    BEFORE UPDATE ON frontend_assets
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

CREATE INDEX IF NOT EXISTS idx_inventory_assets_inventory_id ON inventory_assets(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_type ON inventory_assets(asset_type);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_title ON user_documents(title);
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON user_documents(category);
CREATE INDEX IF NOT EXISTS idx_user_documents_field ON user_documents(field);
CREATE INDEX IF NOT EXISTS idx_user_documents_created ON user_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_frontend_assets_type ON frontend_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_frontend_assets_category ON frontend_assets(category);
CREATE INDEX IF NOT EXISTS idx_frontend_cache_key ON frontend_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_frontend_cache_expires ON frontend_cache(expires_at);

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
    u.email as user_email,
    a.asset_url
FROM user_inventory i
JOIN users u ON i.user_id = u.id
LEFT JOIN inventory_assets a ON i.id = a.inventory_id
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
