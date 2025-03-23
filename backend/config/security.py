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
            'https://instantory.vercel.app'
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
            'google-oauth-token'
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

# Auth0 Integration Endpoints
from urllib.parse import quote_plus, urlencode
import json
from os import environ as env
from quart import session, render_template, redirect, url_for

@auth_bp.route("/home", methods=["GET"])
async def home():
    return await render_template(
        "home.html",
        session=session.get("user"),
        pretty=json.dumps(session.get("user"), indent=4),
    )

@auth_bp.route("/login", methods=["GET"])
async def login():
    redirect_uri = url_for("auth.callback", _external=True)
    # Initiate Auth0 login via the OAuth service
    return await app.oauth_service.auth0.authorize_redirect(redirect_uri)

@auth_bp.route("/callback", methods=["GET", "POST"])
async def callback():
    # Handle Auth0 callback and retrieve token
    token = await app.oauth_service.auth0.authorize_access_token()
    session["user"] = token
    return redirect(url_for("auth.home"))

@auth_bp.route("/logout", methods=["GET"])
async def logout():
    # Clear user session and redirect to Auth0 logout URL
    session.clear()
    logout_url = (
        "https://" + env.get("AUTH0_DOMAIN") + "/v2/logout?" + urlencode({
            "returnTo": url_for("auth.home", _external=True),
            "client_id": env.get("AUTH0_CLIENT_ID"),
        }, quote_via=quote_plus)
    )
    return redirect(logout_url)
