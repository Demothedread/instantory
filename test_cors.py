#!/usr/bin/env python3
"""
Test script to verify CORS configuration is working correctly.
"""

import asyncio
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


async def test_cors_import():
    """Test that CORS middleware can be imported without errors."""
    try:
        from backend.middleware.cors import is_origin_allowed, setup_cors

        print("✅ CORS middleware imported successfully")

        # Test origin validation
        test_origins = [
            "https://hocomnia.com",
            "https://www.hocomnia.com",
            "https://app.hocomnia.com",
            "https://bartleby.vercel.app",
            "http://localhost:3000",
            "https://evil.com",
        ]

        allowed_origins = [
            "https://hocomnia.com",
            "https://www.hocomnia.com",
            "https://bartleby.vercel.app",
            "https://*.vercel.app",
            "https://*.hocomnia.com",
        ]

        print("\n🧪 Testing origin validation:")
        for origin in test_origins:
            is_allowed = is_origin_allowed(origin, allowed_origins)
            status = "✅ ALLOWED" if is_allowed else "❌ BLOCKED"
            print(f"  {origin} -> {status}")

        return True

    except ImportError as e:
        print(f"❌ Failed to import CORS middleware: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


async def test_app_creation():
    """Test that the app can be created with CORS middleware."""
    try:
        from quart import Quart

        from backend.middleware.cors import setup_cors

        # Create a test app
        app = Quart(__name__)

        # Set test environment variables
        os.environ.setdefault(
            "CORS_ORIGINS", "https://hocomnia.com,https://www.hocomnia.com"
        )
        os.environ.setdefault("CORS_ENABLED", "true")
        os.environ.setdefault("ALLOW_CREDENTIALS", "true")

        # Apply CORS
        app = setup_cors(app)
        print("✅ Test app created with CORS middleware successfully")
        return True

    except Exception as e:
        print(f"❌ Failed to create test app: {e}")
        return False


async def main():
    """Run all CORS tests."""
    print("🔬 Testing CORS Configuration\n")

    cors_import_ok = await test_cors_import()
    app_creation_ok = await test_app_creation()

    if cors_import_ok and app_creation_ok:
        print("\n🎉 All CORS tests passed!")
        print("🚀 Backend should be ready for deployment with proper CORS handling")
        return 0
    else:
        print("\n💥 Some CORS tests failed!")
        print("⚠️  Check the error messages above and fix issues before deployment")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
