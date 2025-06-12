-- Create a tracking table for uploads in progress
CREATE TABLE IF NOT EXISTS upload_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    temp_url TEXT NOT NULL,
    permanent_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'complete', 'error')),
    file_type TEXT NOT NULL CHECK (file_type IN ('document', 'image')),
    content_type TEXT,
    file_size BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upload_tracking_user_id ON upload_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_tracking_status ON upload_tracking(status);

-- Add update trigger for timestamps
CREATE TRIGGER update_upload_tracking_timestamp
    BEFORE UPDATE ON upload_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
