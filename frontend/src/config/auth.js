/**
 * Authentication configuration for Bartleby
 * Optimized for cross-origin scenarios between Vercel frontend and Render backend
 */

// Get Google Client ID from environment or set a fallback for development
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Google authentication configuration
const googleAuthConfig = {
  clientId: googleClientId,
  cookiePolicy: 'single_host_origin',
  scope: 'profile email',
  
  // Using redirect mode for most reliable cross-origin authentication
  // Handles CORS issues better than popup in production environments
  uxMode: 'redirect'
};

// Authentication configuration
const authConfig = {
  // Session management
  tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
  sessionCheckInterval: 60 * 1000,      // Check session validity every minute
  sessionKey: 'auth_session',
  
  // Cross-origin options
  fetchOptions: {
    credentials: 'include',  // Required for cookies
    mode: 'cors',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  
  // Cookie settings (for document.cookie fallback if needed)
  cookieOptions: {
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 24 * 60 * 60 // 1 day in seconds
  },
  
  // API endpoints - updated to match backend implementation
  endpoints: {
    // User authentication - ensure these match the backend routes in auth_routes.py
    login: '/api/auth/login',
    register: '/api/auth/register', 
    googleLogin: '/api/auth/google',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    session: '/api/auth/session',
    
    // Admin endpoints - ensure these match the backend routes
    adminLogin: '/api/auth/admin/login',
    adminUsers: '/api/auth/admin/users'
  }
};

// Don't expose client secret in browser
const googleClientSecret = null;

export { googleClientId, googleClientSecret, googleAuthConfig, authConfig };
