-- Add is_admin field to users table if it doesn't exist
DO $$ 
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_admin'
    ) THEN
        -- Add the column
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
        
        -- Add index for performance
        CREATE INDEX idx_users_is_admin ON users (is_admin);
        
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in users table';
    END IF;
    
    -- Ensure the required tables exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_storage') THEN
        CREATE TABLE user_storage (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            storage_type VARCHAR(50) NOT NULL,
            storage_path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, storage_type)
        );
        
        RAISE NOTICE 'Created user_storage table';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_logins') THEN
        CREATE TABLE user_logins (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            auth_provider VARCHAR(50) NOT NULL,
            user_agent TEXT,
            CONSTRAINT fk_user_logins_user FOREIGN KEY (user_id) REFERENCES users(id)
        );
        
        CREATE INDEX idx_user_logins_user_id ON user_logins (user_id);
        CREATE INDEX idx_user_logins_login_time ON user_logins (login_time);
        
        RAISE NOTICE 'Created user_logins table';
    END IF;
END $$;

-- Create or update an admin user for testing (optional)
-- Uncomment and modify this section if you want to create an admin user

DO $$ 
DECLARE
    admin_password TEXT := 'admin'; -- Default password, should be changed in production
BEGIN
    -- Create or update the admin user
    -- In a real application, get this from a secure source
    IF EXISTS (SELECT FROM users WHERE email = 'admin@example.com') THEN
        UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
        RAISE NOTICE 'Updated admin@example.com to have admin privileges';
    ELSE
        -- Insert will fail if the users table has additional required fields
        -- Modify as needed for your schema
        INSERT INTO users (email, name, password_hash, is_admin, is_verified, auth_provider)
        VALUES ('admin@example.com', 'Admin User', crypt(admin_password, gen_salt('bf')), TRUE, TRUE, 'admin_override');
        RAISE NOTICE 'Created admin user admin@example.com';
    END IF;
END $$;
