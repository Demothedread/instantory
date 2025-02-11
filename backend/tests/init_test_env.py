#!/usr/bin/env python3
"""Initialize test environment and database for Bartleby testing."""

import os
import sys
import asyncio
import asyncpg
from pathlib import Path
from dotenv import load_dotenv

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Load test environment variables
load_dotenv(project_root / '.env.test')

async def create_test_database():
    """Create and initialize test database."""
    try:
        # Connect to default database to create test database
        conn = await asyncpg.connect(
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', 5432),
            database='postgres'
        )

        # Create test database if it doesn't exist
        db_name = os.getenv('TEST_DB_NAME', 'test_db')
        try:
            await conn.execute(f'CREATE DATABASE {db_name}')
            print(f"Created test database: {db_name}")
        except asyncpg.DuplicateDatabaseError:
            print(f"Test database {db_name} already exists")
        finally:
            await conn.close()

        # Connect to test database and create schema
        conn = await asyncpg.connect(
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', 5432),
            database=db_name
        )

        # Create test tables
        await conn.execute('''
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                password_hash TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Documents table
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title TEXT NOT NULL,
                content TEXT,
                file_url TEXT,
                category TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Inventory table
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                name TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                category TEXT,
                material TEXT,
                color TEXT,
                dimensions TEXT,
                origin_source TEXT,
                import_cost DECIMAL,
                retail_price DECIMAL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Processing tasks table
            CREATE TABLE IF NOT EXISTS processing_tasks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                status TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''')

        print("Test database schema created successfully")
        await conn.close()

    except Exception as e:
        print(f"Error initializing test database: {e}")
        sys.exit(1)

def create_test_directories():
    """Create required directories for test files."""
    test_dirs = [
        'tests/data',
        'tests/data/uploads',
        'tests/data/images/inventory',
        'tests/data/exports',
        'tests/data/documents'
    ]

    for dir_path in test_dirs:
        path = project_root / dir_path
        path.mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {dir_path}")

def create_test_env_file():
    """Create .env.test file if it doesn't exist."""
    env_example = project_root / '.env.test.example'
    env_test = project_root / '.env.test'

    if not env_test.exists() and env_example.exists():
        env_test.write_text(env_example.read_text())
        print("Created .env.test file from example")

def main():
    """Main initialization function."""
    print("Initializing test environment...")

    # Create test directories
    create_test_directories()

    # Create test environment file
    create_test_env_file()

    # Create and initialize test database
    asyncio.run(create_test_database())

    print("\nTest environment initialized successfully!")
    print("\nNext steps:")
    print("1. Review and update .env.test with appropriate values")
    print("2. Run tests with: pytest")
    print("3. Check test coverage with: pytest --cov=backend --cov-report=html")

if __name__ == '__main__':
    main()
