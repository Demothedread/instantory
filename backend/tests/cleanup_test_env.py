#!/usr/bin/env python3
"""Clean up test environment and database for Bartleby testing."""

import os
import sys
import shutil
import asyncio
import asyncpg
from pathlib import Path
from dotenv import load_dotenv

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Load test environment variables
load_dotenv(project_root / '.env.test')

async def cleanup_test_database():
    """Drop test database and clean up database resources."""
    try:
        # Connect to default database to drop test database
        conn = await asyncpg.connect(
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', 5432),
            database='postgres'
        )

        # Drop test database if it exists
        db_name = os.getenv('TEST_DB_NAME', 'test_db')
        try:
            # Terminate all connections to the test database
            await conn.execute(f'''
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = '{db_name}'
                AND pid <> pg_backend_pid();
            ''')
            
            # Drop the database
            await conn.execute(f'DROP DATABASE IF EXISTS {db_name}')
            print(f"Dropped test database: {db_name}")
        except Exception as e:
            print(f"Error dropping database: {e}")
        finally:
            await conn.close()

    except Exception as e:
        print(f"Error cleaning up test database: {e}")
        sys.exit(1)

def cleanup_test_directories():
    """Remove test directories and their contents."""
    test_dirs = [
        'tests/data',
        'tests/coverage',
        'tests/__pycache__',
        'tests/unit/__pycache__',
        'tests/integration/__pycache__',
        'tests/e2e/__pycache__'
    ]

    for dir_path in test_dirs:
        path = project_root / dir_path
        if path.exists():
            try:
                shutil.rmtree(path)
                print(f"Removed directory: {dir_path}")
            except Exception as e:
                print(f"Error removing directory {dir_path}: {e}")

def cleanup_test_files():
    """Remove test-related files."""
    test_files = [
        '.coverage',
        'tests/test.log',
        'tests/.pytest_cache',
        'htmlcov'
    ]

    for file_path in test_files:
        path = project_root / file_path
        if path.exists():
            try:
                if path.is_file():
                    path.unlink()
                else:
                    shutil.rmtree(path)
                print(f"Removed: {file_path}")
            except Exception as e:
                print(f"Error removing {file_path}: {e}")

def cleanup_cache_files():
    """Clean up Python cache files."""
    try:
        # Remove all __pycache__ directories
        for root, dirs, files in os.walk(project_root):
            for dir_name in dirs:
                if dir_name == '__pycache__':
                    cache_dir = Path(root) / dir_name
                    shutil.rmtree(cache_dir)
                    print(f"Removed cache directory: {cache_dir}")

        # Remove .pyc files
        for root, dirs, files in os.walk(project_root):
            for file_name in files:
                if file_name.endswith('.pyc'):
                    pyc_file = Path(root) / file_name
                    pyc_file.unlink()
                    print(f"Removed cache file: {pyc_file}")
    except Exception as e:
        print(f"Error cleaning up cache files: {e}")

def prompt_user():
    """Prompt user for confirmation before cleanup."""
    print("\nWARNING: This will remove all test data, including:")
    print("- Test database")
    print("- Test data directories")
    print("- Test log files")
    print("- Coverage reports")
    print("- Python cache files")
    
    response = input("\nAre you sure you want to proceed? (y/N): ")
    return response.lower() == 'y'

async def main():
    """Main cleanup function."""
    print("Test Environment Cleanup")
    print("=======================")

    if not prompt_user():
        print("\nCleanup cancelled.")
        return

    print("\nCleaning up test environment...")

    # Clean up database
    print("\nCleaning up database...")
    await cleanup_test_database()

    # Clean up directories
    print("\nCleaning up directories...")
    cleanup_test_directories()

    # Clean up files
    print("\nCleaning up files...")
    cleanup_test_files()

    # Clean up cache
    print("\nCleaning up cache...")
    cleanup_cache_files()

    print("\nTest environment cleanup completed!")
    print("\nTo reinitialize the test environment, run:")
    print("python tests/init_test_env.py")

def run_cleanup():
    """Run the cleanup process."""
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nCleanup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError during cleanup: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_cleanup()
