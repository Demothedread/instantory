"""Security configuration for the application."""

import os
import urllib.parse  # Import for URL encoding in GoogleOAuthConfig
from typing import List, Dict, Optional


class CORSConfig:
    """CORS configuration settings."""

    @staticmethod
    def get_origins() -> List[str]:
        """Get allowed origins from environment or default to development origins."""
        cors_origin = os.getenv("CORS_ORIGIN", "")
        if cors_origin:
            # Clean and normalize origins
            origins = [origin.strip() for origin in cors_origin.split(",") if origin.strip()]
            return origins if origins else CORSConfig.get_default_origins()
        else:
            # If no CORS_ORIGIN is set, use default origins
            return CORSConfig.get_default_origins()

    @staticmethod
    def get_default_origins() -> List[str]:
        """Get default origins for development."""
        # Default origins for development, including hocomnia.com with and without www
        return [
            "https://hocomnia.com",
            "https://www.hocomnia.com", 
            "https://instantory.vercel.app",
            "https://bartleby.vercel.app",
            "https://accounts.google.com",
            "https://bartleby-backend.onrender.com",
            "https://bartleby-backend-mn96.onrender.com",
            "https://vercel.live",
            "http://localhost:3000",
            "https://localhost:3000"
        ]

    @staticmethod
    def get_headers() -> List[str]:
        """Get allowed headers."""
        return [
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Content-Length",
            "Accept-Encoding",
            "X-CSRF-Token",
            "google-oauth-token",
            "google-client_id",
            "g_csrf_token",
            "X-Google-OAuth-Token",
            "X-Google-Client-ID",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Cache-Control",
            "X-API-Key",
            "X-Auth-Token",
        ]

    @staticmethod
    def get_methods() -> List[str]:
        """Get allowed methods."""
        return ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]

    @staticmethod
    def get_cors_headers(origin: Optional[str] = None) -> Dict[str, str]:
        """Get CORS headers for a given origin."""
        headers = {
            "Access-Control-Allow-Methods": ",".join(CORSConfig.get_methods()),
            "Access-Control-Allow-Headers": ",".join(CORSConfig.get_headers()),
            "Access-Control-Allow-Credentials": "true",  # Always allow credentials for sign-in protocols
            "Access-Control-Max-Age": "3600",
        }

        if origin and CORSConfig.is_origin_allowed(origin):
            headers["Access-Control-Allow-Origin"] = origin
        else:
            # For security, do not set wildcard origin when credentials are allowed
            headers["Access-Control-Allow-Origin"] = "null"

        return headers

    @staticmethod
    def is_origin_allowed(origin: Optional[str]) -> bool:
        """Check if an origin is allowed."""
        if not origin:
            return False

        # Get the allowed origins
        allowed_origins = CORSConfig.get_origins()

        # Check for exact match first
        if origin in allowed_origins:
            return True

        # Check for wildcard domains (e.g., https://*.vercel.app)
        for allowed_origin in allowed_origins:
            if allowed_origin.startswith("https://*."):
                # Extract the domain part after the asterisk
                domain_suffix = allowed_origin.replace("https://*.", "")
                # Check if the origin ends with this domain suffix
                if origin.startswith("https://") and origin.endswith(domain_suffix):
                    return True

        return False


class SecurityConfig:
    """Security configuration settings."""

    @staticmethod
    def get_jwt_secret() -> str:
        """Get JWT secret key from environment."""
        secret = os.getenv("JWT_SECRET")
        if not secret:
            raise ValueError("JWT_SECRET environment variable is required")
        return secret

    @staticmethod
    def get_cookie_secret() -> str:
        """Get cookie secret key from environment."""
        secret = os.getenv("COOKIE_SECRET")
        if not secret:
            raise ValueError("COOKIE_SECRET environment variable is required")
        return secret

    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get security headers for responses."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
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
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise ValueError("GOOGLE_CLIENT_ID environment variable is required")
        return client_id

    @staticmethod
    def get_additional_client_ids() -> List[str]:
        """Get additional Google OAuth client IDs from environment."""
        additional_ids = os.getenv("ADDITIONAL_GOOGLE_CLIENT_IDS", "")
        if additional_ids:
            return [id.strip() for id in additional_ids.split(",") if id.strip()]
        return []

    @staticmethod
    def get_all_client_ids() -> List[str]:
        """Get all Google OAuth client IDs (primary + additional)."""
        ids = [GoogleOAuthConfig.get_client_id()]
        additional_ids = GoogleOAuthConfig.get_additional_client_ids()
        if additional_ids:
            ids.extend(additional_ids)
        return ids

    @staticmethod
    def get_client_secret() -> str:
        """Get Google OAuth client secret from environment."""
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        if not client_secret:
            raise ValueError("GOOGLE_CLIENT_SECRET environment variable is required")
        return client_secret

    @staticmethod
    def get_redirect_uri() -> str:
        """Get Google OAuth redirect URI from environment."""
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        if not redirect_uri:
            raise ValueError("GOOGLE_REDIRECT_URI environment variable is required")
        return redirect_uri

    @staticmethod
    def get_oauth_url(state: Optional[str] = None) -> str:
        """
        Generate the Google OAuth authorization URL.

        Args:
            state: Optional state parameter for CSRF protection

        Returns:
            The authorization URL to redirect users to
        """
        client_id = GoogleOAuthConfig.get_client_id()
        redirect_uri = GoogleOAuthConfig.get_redirect_uri()

        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "email profile",
            "access_type": "offline",
            "prompt": "select_account",
        }

        if state:
            params["state"] = state

        query_string = urllib.parse.urlencode(params)
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"


def get_google_oauth_config() -> GoogleOAuthConfig:
    """Get Google OAuth configuration instance."""
    return GoogleOAuthConfig()
