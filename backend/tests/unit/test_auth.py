import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta

from backend.auth_routes import create_access_token, verify_token, hash_password
from backend.config.security import get_security_config

pytestmark = pytest.mark.asyncio

class TestAuthentication:
    async def test_create_access_token(self):
        user_data = {
            "id": 1,
            "email": "test@example.com",
            "name": "Test User"
        }
        
        token = await create_access_token(user_data)
        assert isinstance(token, str)
        assert len(token) > 0

    async def test_verify_valid_token(self):
        user_data = {
            "id": 1,
            "email": "test@example.com",
            "name": "Test User"
        }
        
        token = await create_access_token(user_data)
        decoded = await verify_token(token)
        
        assert decoded["id"] == user_data["id"]
        assert decoded["email"] == user_data["email"]
        assert decoded["name"] == user_data["name"]

    async def test_verify_expired_token(self):
        with patch("backend.auth_routes.datetime") as mock_datetime:
            # Set current time to after token expiration
            mock_datetime.utcnow.return_value = datetime.utcnow() + timedelta(days=2)
            
            user_data = {
                "id": 1,
                "email": "test@example.com"
            }
            
            token = await create_access_token(user_data)
            
            with pytest.raises(Exception) as exc_info:
                await verify_token(token)
            
            assert "expired" in str(exc_info.value).lower()

    async def test_verify_invalid_token(self):
        with pytest.raises(Exception) as exc_info:
            await verify_token("invalid.token.string")
        
        assert "invalid" in str(exc_info.value).lower()

class TestPasswordHashing:
    async def test_password_hashing(self):
        password = "test_password123"
        hashed = await hash_password(password)
        
        assert isinstance(hashed, str)
        assert hashed != password
        assert len(hashed) > 0

    async def test_different_passwords_different_hashes(self):
        password1 = "test_password123"
        password2 = "test_password123"
        
        hash1 = await hash_password(password1)
        hash2 = await hash_password(password2)
        
        assert hash1 != hash2  # Should be different due to salt

class TestGoogleAuth:
    async def test_verify_google_token(self, test_client, mock_user_data):
        with patch("backend.auth_routes.verify_oauth2_token") as mock_verify:
            mock_verify.return_value = {
                "sub": "google_user_id",
                "email": mock_user_data["email"],
                "name": mock_user_data["name"],
                "email_verified": True
            }
            
            response = await test_client.post(
                "/api/auth/google",
                json={"credential": "mock.google.token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "user" in data
            assert data["user"]["email"] == mock_user_data["email"]

    async def test_invalid_google_token(self, test_client):
        with patch("backend.auth_routes.verify_oauth2_token") as mock_verify:
            mock_verify.side_effect = ValueError("Invalid token")
            
            response = await test_client.post(
                "/api/auth/google",
                json={"credential": "invalid.token"}
            )
            
            assert response.status_code == 401

class TestEmailAuth:
    async def test_email_login(self, test_client, mock_user_data, db_pool):
        # First create a user
        async with db_pool.acquire() as conn:
            hashed_password = await hash_password("test_password")
            await conn.execute("""
                INSERT INTO users (email, password_hash, name)
                VALUES ($1, $2, $3)
            """, mock_user_data["email"], hashed_password, mock_user_data["name"])
        
        response = await test_client.post(
            "/api/auth/login",
            json={
                "email": mock_user_data["email"],
                "password": "test_password"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == mock_user_data["email"]

    async def test_invalid_credentials(self, test_client):
        response = await test_client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrong_password"
            }
        )
        
        assert response.status_code == 401

class TestSession:
    async def test_session_refresh(self, test_client, auth_headers):
        response = await test_client.post(
            "/api/auth/refresh",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user" in data

    async def test_session_verification(self, test_client, auth_headers):
        response = await test_client.get(
            "/api/auth/session",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user" in data

    async def test_logout(self, test_client, auth_headers):
        response = await test_client.post(
            "/api/auth/logout",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        # Verify session is invalidated
        session_response = await test_client.get(
            "/api/auth/session",
            headers=auth_headers
        )
        
        assert session_response.status_code == 401

class TestSecurityConfig:
    def test_jwt_configuration(self):
        config = get_security_config()
        
        assert hasattr(config, "JWT_SECRET")
        assert hasattr(config, "JWT_ALGORITHM")
        assert hasattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES")
        
        assert isinstance(config.JWT_SECRET, str)
        assert len(config.JWT_SECRET) > 0
        assert config.JWT_ALGORITHM in ["HS256", "HS384", "HS512"]
        assert isinstance(config.ACCESS_TOKEN_EXPIRE_MINUTES, int)
        assert config.ACCESS_TOKEN_EXPIRE_MINUTES > 0

    def test_cookie_configuration(self):
        config = get_security_config()
        
        assert hasattr(config, "COOKIE_SECRET")
        assert hasattr(config, "COOKIE_NAME")
        assert hasattr(config, "COOKIE_DOMAIN")
        assert hasattr(config, "COOKIE_PATH")
        assert hasattr(config, "COOKIE_SECURE")
        assert hasattr(config, "COOKIE_HTTPONLY")
        assert hasattr(config, "COOKIE_SAMESITE")
        
        assert isinstance(config.COOKIE_SECRET, str)
        assert len(config.COOKIE_SECRET) > 0
        assert isinstance(config.COOKIE_NAME, str)
        assert len(config.COOKIE_NAME) > 0
