"""
OAuth configuration and utilities for the Bartleby application.
Centralizes OAuth provider settings and authentication flows.
"""
from typing import Optional
import urllib.parse
import logging

from backend.config.manager import config_manager

logger = logging.getLogger(__name__)

class GoogleOAuthConfig:
    """Centralized Google OAuth configuration."""

    @staticmethod
    def get_client_id() -> str:
        """Get Google OAuth client ID from configuration."""
        client_id = config_manager.get('GOOGLE_CLIENT_ID')
        if not client_id:
            logger.warning("GOOGLE_CLIENT_ID configuration variable is missing")
            return ""
        return client_id

    @staticmethod
    def get_additional_client_ids() -> list[str]:
        """Get additional Google OAuth client IDs from configuration."""
        additional_ids = config_manager.get("ADDITIONAL_GOOGLE_CLIENT_IDS", "")
        if additional_ids:
            return [id.strip() for id in additional_ids.split(",") if id.strip()]
        return []

    @staticmethod
    def get_all_client_ids() -> list[str]:
        """Get all Google OAuth client IDs (primary + additional)."""
        ids = [GoogleOAuthConfig.get_client_id()]
        additional_ids = GoogleOAuthConfig.get_additional_client_ids()
        if additional_ids:
            ids.extend(additional_ids)
        return [id for id in ids if id]  # Filter out empty strings

    @staticmethod
    def get_client_secret() -> str:
        """Get Google OAuth client secret from configuration."""
        client_secret = config_manager.get('GOOGLE_CLIENT_SECRET')
        if not client_secret:
            logger.warning("GOOGLE_CLIENT_SECRET configuration variable is missing")
            return ""
        return client_secret

    @staticmethod
    def get_redirect_uri() -> str:
        """Get Google OAuth redirect URI from configuration."""
        backend_url = config_manager.get('PUBLIC_BACKEND_URL', 'https://bartleby-backend-mn96.onrender.com')
        redirect_uri = f"{backend_url}/api/auth/google/callback"
        logger.info(f"Using redirect URI: {redirect_uri}")
        return redirect_uri

    @staticmethod
    def get_frontend_url() -> str:
        """Get frontend URL from configuration."""
        frontend_url = config_manager.get('FRONTEND_URL', 'https://hocomnia.com')
        return frontend_url.split(",")[0] if "," in frontend_url else frontend_url

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
            "include_granted_scopes": "true"
        }

        if state:
            params["state"] = state

        query_string = urllib.parse.urlencode(params)
        return f"{base_url}?{query_string}"

    @staticmethod
    def validate_config() -> bool:
        """Validate OAuth configuration."""
        required_vars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
        missing_vars = [var for var in required_vars if not config_manager.get(var)]

        if missing_vars:
            raise ValueError(f"Missing required OAuth variables: {missing_vars}")

        return True
