-- Add missing columns to users table needed for authentication

-- Check if password_hash column exists, add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Check if auth_provider column exists, add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'auth_provider'
    ) THEN
        ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email';
    END IF;
END $$;

-- Check if is_verified column exists, add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Check if google_id column exists, add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'google_id'
    ) THEN
        ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
    END IF;
END $$;

-- Create user_storage table to link users with their storage
CREATE TABLE IF NOT EXISTS user_storage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    storage_type TEXT NOT NULL, -- 'vercel_blob', 's3', etc.
    storage_path TEXT NOT NULL, -- Base path or identifier for this user's storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, storage_type)
);

-- Create trigger for updated_at on user_storage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_storage_updated_at'
    ) THEN
        CREATE TRIGGER update_user_storage_updated_at
            BEFORE UPDATE ON user_storage
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_type ON user_storage(storage_type);
