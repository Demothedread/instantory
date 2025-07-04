#!/usr/bin/env python3
"""
Test script to verify backend endpoints are working
"""
import asyncio
import json

import aiohttp

BACKEND_URL = "https://bartleby-backend-mn96.onrender.com"
TEST_ORIGIN = "https://hocomnia.com"


async def test_endpoint(session, endpoint, method="GET", data=None):
    """Test a single endpoint"""
    url = f"{BACKEND_URL}{endpoint}"
    headers = {
        "Origin": TEST_ORIGIN,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    print(f"\n🔍 Testing {method} {endpoint}")
    print(f"   URL: {url}")

    try:
        async with session.request(method, url, headers=headers, json=data) as response:
            print(f"   Status: {response.status}")
            print(f"   Headers: {dict(response.headers)}")

            if response.status < 500:
                try:
                    result = await response.json()
                    print(f"   Response: {json.dumps(result, indent=2)}")
                except:
                    text = await response.text()
                    print(f"   Response (text): {text[:200]}...")
            else:
                print(f"   Server error: {response.status}")

    except Exception as e:
        print(f"   ❌ Error: {e}")


async def main():
    """Test all important endpoints"""
    print("🚀 Testing Backend Endpoints")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Origin: {TEST_ORIGIN}")

    async with aiohttp.ClientSession() as session:
        # Test basic endpoints
        await test_endpoint(session, "/")
        await test_endpoint(session, "/health")
        await test_endpoint(session, "/api/health")

        # Test debug endpoints
        await test_endpoint(session, "/api/debug/status")
        await test_endpoint(session, "/api/debug/cors")

        # Test auth endpoints
        await test_endpoint(session, "/api/auth/session")
        await test_endpoint(session, "/api/auth/test")

        # Test OPTIONS requests (CORS preflight)
        await test_endpoint(session, "/api/auth/google", method="OPTIONS")
        await test_endpoint(session, "/api/auth/session", method="OPTIONS")


if __name__ == "__main__":
    asyncio.run(main())
