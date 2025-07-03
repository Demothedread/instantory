"""Security configuration for the application."""

import os
import urllib.parse  # Import for URL encoding in GoogleOAuthConfig
from typing import List, Dict, Optional
from .manager import config_manager

class CORSConfig:
    """CORS configuration settings."""

    @staticmethod
    def get_origins() -> List[str]:
        """Get allowed origins from environment or default to development origins."""
        # Use ConfigManager for consistency
        return config_manager.get_api_config()['cors_origins']

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
            "X-Requested-With",
            "Content-Length",
            "Accept-Encoding",
            "X-CSRF-Token",
            "Cache-Control",
            "X-API-Key",
            "X-Auth-Token",
            "X-Google-OAuth-Token",
            "X-Google-Client-ID",
            "User-Agent",
            "Referer",
            "Accept-Language",
            "DNT",
            "Connection",
            "Upgrade-Insecure-Requests"
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

        # Use ConfigManager for allowed origins
        allowed_origins = config_manager.get_api_config()['cors_origins']
        
        # Also check ALLOWED_ORIGINS environment variable for additional origins
        env_origins = os.getenv("ALLOWED_ORIGINS", "")
        if env_origins:
            allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])
        
        # Remove duplicates while preserving order
        allowed_origins = list(dict.fromkeys(allowed_origins))

        # Check for exact match first
        if origin in allowed_origins:
            return True

        # Check for wildcard domains (e.g., https://*.vercel.app)
        for allowed_origin in allowed_origins:
            if allowed_origin.startswith("https://*."):
                # Extract the domain part after the asterisk
                domain_suffix = allowed_origin.replace("https://*.", "")
                # Check if the origin ends with this domain suffix
                if origin.startswith("https://") and origin.endswith(f".{domain_suffix}"):
                    return True

        # Enhanced hocomnia.com support - allow all subdomains and the main domain
        if origin.startswith("https://") and (
            origin == "https://hocomnia.com" or
            origin == "https://www.hocomnia.com" or
            origin.endswith(".hocomnia.com")
        ):
            return True

        # Support for Vercel preview deployments
        if origin.startswith("https://") and ".vercel.app" in origin:
            return True

        # Support for localhost development
        if origin.startswith("http://localhost") or origin.startswith("https://localhost"):
            return True

        return False

class SecurityConfig:
    """Security configuration settings."""

    @staticmethod
    def get_jwt_secret() -> str:
        """Get JWT secret key from environment."""
        # Use ConfigManager for consistency
        auth_config = config_manager.get_auth_config()
        secret = auth_config['jwt_secret']
        if not secret or secret == 'dev-secret-key':
            raise ValueError("JWT_SECRET environment variable is required for production")
        if len(secret) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        return secret

    @staticmethod
    def get_cookie_secret() -> str:
        """Get cookie secret key from environment."""
        # Use ConfigManager for consistency
        auth_config = config_manager.get_auth_config()
        secret = auth_config['session_secret']
        if not secret:
            raise ValueError("SESSION_SECRET environment variable is required")
        if len(secret) < 32:
            raise ValueError("SESSION_SECRET must be at least 32 characters long")
        return secret

    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get security headers for responses."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
            # Updated CSP to allow Google's GSI styles and improve OAuth compatibility
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' accounts.google.com *.googleapis.com; style-src 'self' 'unsafe-inline' accounts.google.com *.googleapis.com https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' accounts.google.com *.googleapis.com; frame-src accounts.google.com; font-src 'self' https://fonts.gstatic.com",
            "Cross-Origin-Embedder-Policy": "credentialless",
            # Adjusted COOP to allow Google OAuth popups and postMessage
            "Cross-Origin-Opener-Policy": "unsafe-none",
            "Cross-Origin-Resource-Policy": "cross-origin",
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
        # Use ConfigManager for consistency
        auth_config = config_manager.get_auth_config()
        client_id = auth_config['google_client_id']
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
        # Use ConfigManager for consistency
        auth_config = config_manager.get_auth_config()
        client_secret = auth_config['google_client_secret']
        if not client_secret:
            raise ValueError("GOOGLE_CLIENT_SECRET environment variable is required")
        return client_secret

    @staticmethod
    def get_redirect_uri() -> str:
        """Get Google OAuth redirect URI from environment."""
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "").strip()
        if not redirect_uri:
            raise ValueError("GOOGLE_REDIRECT_URI environment variable is required")
        
        # Basic URL validation
        if not redirect_uri.startswith(("http://", "https://")):
            raise ValueError("GOOGLE_REDIRECT_URI must be a valid HTTP/HTTPS URL")
        
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
