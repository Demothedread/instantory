"""Security configuration including CORS and security headers."""
import os
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class SecurityConfig:
    """Security settings management."""
    
    def __init__(self):
        # CORS configuration
        self.cors_config = {
            'allow_origin': self._get_allowed_origins(),
            'allow_credentials': True,
            'allow_methods': [
                'GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'
            ],
            'allow_headers': [
                'Content-Type',
                'Authorization',
                'Accept',
                'Origin',
                'X-Requested-With',
                'google-oauth-token',
                'Sec-Fetch-Site',
                'Sec-Fetch-Mode',
                'Sec-Fetch-Dest'
            ],
            'max_age': 3600
        }
        
        # Security headers
        self.security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': self._get_csp_policy(),
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Vary': 'Origin',
            'Permissions-Policy': 'identity-credentials-get=(self "https://accounts.google.com")',
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
        }
        
        # JWT configuration
        self.jwt_secret = os.getenv('JWT_SECRET')
        if not self.jwt_secret:
            logger.warning("JWT_SECRET not set - using an insecure default")
            self.jwt_secret = 'development_secret'
        
        # Session configuration
        self.session_secret = os.getenv('SESSION_SECRET')
        self.cookie_secret = os.getenv('COOKIE_SECRET')
    
    def _get_allowed_origins(self) -> List[str]:
        """Get allowed CORS origins from environment or defaults."""
        origins = [
            "https://instantory.vercel.app",
            "https://instantory.onrender.com",
            "https://bartleby.vercel.app"
        ]
        
        # Add development origins if not in production
        if os.getenv('NODE_ENV') != 'production':
            origins.extend([
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ])
        
        # Add custom origin if specified
        custom_origin = os.getenv('CORS_ORIGIN')
        if custom_origin:
            origins.append(custom_origin)
        
        return origins
    
    def _get_csp_policy(self) -> str:
        """Generate Content Security Policy."""
        return (
            "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; "
            "connect-src 'self' https://instantory.onrender.com https://*.google.com https://accounts.google.com; "
            "frame-src 'self' https://*.google.com https://accounts.google.com; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.googleusercontent.com https://apis.google.com; "
            "credentials-src 'self' https://accounts.google.com; "
            "img-src 'self' data: https: blob:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com"
        )
    
    def is_origin_allowed(self, origin: Optional[str]) -> bool:
        """Check if an origin is allowed by CORS policy."""
        if not origin:
            return False
        return origin in self.cors_config['allow_origin']
    
    def get_cors_headers(self, origin: Optional[str]) -> Dict[str, str]:
        """Get CORS headers for a given origin."""
        if not self.is_origin_allowed(origin):
            return {}
            
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': ', '.join(self.cors_config['allow_methods']),
            'Access-Control-Allow-Headers': ', '.join(self.cors_config['allow_headers']),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': str(self.cors_config['max_age'])
        }
    
    def get_security_headers(self) -> Dict[str, str]:
        """Get security headers."""
        return self.security_headers.copy()

# Global instance
security_config = SecurityConfig()

def get_security_config() -> SecurityConfig:
    """Get the security configuration instance."""
    return security_config
