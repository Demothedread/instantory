const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Simple Google authentication configuration
const googleAuthConfig = {
  clientId: googleClientId,
  cookiePolicy: 'single_host_origin',
  uxMode: 'popup', // Use popup for better cross-origin handling
  scope: 'profile email',
};

// Configuration for authentication
const authConfig = {
  tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
  sessionKey: 'auth_session',
  // CORS settings for authentication requests
  fetchOptions: {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  endpoints: {
    // User authentication endpoints (simplified)
    login: '/api/auth/login',
    register: '/api/auth/register',
    googleLogin: '/api/auth/google',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    session: '/api/auth/session',
    
    // Admin endpoints
    adminLogin: '/api/auth/admin/login',
    adminUsers: '/api/auth/admin/users'
  }
};
const googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

export { googleClientId, googleClientSecret, googleAuthConfig, authConfig };
