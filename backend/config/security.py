"""Security configuration for the application."""
import os
from typing import List, Dict, Optional

class CORSConfig:
    """CORS configuration settings."""
            
    @staticmethod
    def get_origins() -> List[str]:
        """Get allowed origins from environment or default to development origins."""
        cors_origin = os.getenv('CORS_ORIGIN', '')
        if cors_origin:
            return cors_origin.split(',')
        return [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://vercel.live',
            'https://hocomnia.com',
            'https://instantory.vercel.app',"https://instantory.onrender.com ","https://*.vercel.app","https://hocomnia.com/*"
        ]
    @staticmethod
    def get_headers() -> List[str]:
        """Get allowed headers."""
        return [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'google-oauth-token',
            'client_id',  # Include client_id to support Google sign-in
        ]
    @staticmethod
    def get_methods() -> List[str]:
        """Get allowed methods."""
        return ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    
    @staticmethod
    def get_cors_headers(origin: Optional[str] = None) -> Dict[str, str]:
        """Get CORS headers for a given origin."""
        headers = {
            'Access-Control-Allow-Methods': ','.join(CORSConfig.get_methods()),
            'Access-Control-Allow-Headers': ','.join(CORSConfig.get_headers()),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '3600'
        }
        
        if origin and CORSConfig.is_origin_allowed(origin):
            headers['Access-Control-Allow-Origin'] = origin
        
        return headers
    
    @staticmethod
    def is_origin_allowed(origin: Optional[str]) -> bool:
        """Check if an origin is allowed."""
        if not origin:
            return False
        return origin in CORSConfig.get_origins()

class SecurityConfig:
    """Security configuration settings."""
    
    @staticmethod
    def get_jwt_secret() -> str:
        """Get JWT secret key from environment."""
        secret = os.getenv('JWT_SECRET')
        if not secret:
            raise ValueError("JWT_SECRET environment variable is required")
        return secret
    
    @staticmethod
    def get_cookie_secret() -> str:
        """Get cookie secret key from environment."""
        secret = os.getenv('COOKIE_SECRET')
        if not secret:
            raise ValueError("COOKIE_SECRET environment variable is required")
        return secret
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get security headers for responses."""
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        }

def get_security_config() -> SecurityConfig:
    """Get security configuration instance."""
    return SecurityConfig()

def get_cors_config() -> CORSConfig:
    """Get CORS configuration instance."""
    return CORSConfig()
    
    
class GoogleOAuthConfig:
    """Google OAuth configuration settings."""

    @staticmethod
    def get_client_id() -> str:
        """Get Google OAuth client ID from environment."""
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        if not client_id:
            raise ValueError("GOOGLE_CLIENT_ID environment variable is required")
        return client_id

    @staticmethod
    def get_client_secret() -> str:
        """Get Google OAuth client secret from environment."""
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        if not client_secret:
            raise ValueError("GOOGLE_CLIENT_SECRET environment variable is required")
        return client_secret

    @staticmethod
    def get_redirect_uri() -> str:
        """Get Google OAuth redirect URI from environment."""
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
        if not redirect_uri:
            raise ValueError("GOOGLE_REDIRECT_URI environment variable is required")
        return redirect_uri

def get_google_oauth_config() -> GoogleOAuthConfig:
    """Get Google OAuth configuration instance."""
    return GoogleOAuthConfig()