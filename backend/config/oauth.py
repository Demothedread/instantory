"""
OAuth configuration and utilities for the Bartleby application.
Centralizes OAuth provider settings and authentication flows.
"""
import os
from typing import Dict, Any, Optional, List
import urllib.parse
import logging

logger = logging.getLogger(__name__)

class GoogleOAuthConfig:
    """Google OAuth configuration settings."""

    @staticmethod
    def get_client_id() -> str:
        """Get Google OAuth client ID from environment."""
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            logger.warning("GOOGLE_CLIENT_ID environment variable is missing")
            return ""
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
            logger.warning("GOOGLE_CLIENT_SECRET environment variable is missing")
            return ""
        return client_secret

    @staticmethod
    def get_redirect_uri() -> str:
        """Get Google OAuth redirect URI from environment."""
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        if not redirect_uri:
            backend_url = os.getenv("PUBLIC_BACKEND_URL", "https://bartleby-backend-mn96.onrender.com")
            redirect_uri = f"{backend_url}/api/auth/google/callback"
            logger.info(f"Using default redirect URI: {redirect_uri}")
        return redirect_uri

    @staticmethod
    def get_frontend_url() -> str:
        """Get frontend URL from environment."""
        frontend_url = os.getenv("FRONTEND_URL", "https://hocomnia.com")
        return frontend_url

    @staticmethod
    def get_oauth_url(state: Optional[str] = None) -> str:
        """
        Generate the Google OAuth authorization URL.
        
        Args:
            state: Optional state to pass to the OAuth provider
            
        Returns:
            The complete OAuth URL for redirecting users
        """
        base_url = "https://accounts.google.com/o/oauth2/auth"
        
        params = {
            "client_id": GoogleOAuthConfig.get_client_id(),
            "redirect_uri": GoogleOAuthConfig.get_redirect_uri(),
            "response_type": "code",
            "scope": "email profile",
            "access_type": "offline",
            "prompt": "select_account consent",
        }
        
        if state:
            params["state"] = state
            
        query_string = urllib.parse.urlencode(params)
        return f"{base_url}?{query_string}"
