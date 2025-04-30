const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

// Enhanced Google authentication configuration
const googleAuthConfig = {
  clientId: googleClientId,
  cookiePolicy: 'single_host_origin',
  fetchBasicProfile: true,
  uxMode: 'popup', // Use popup for better cross-origin handling
  accessType: 'online',
  scope: 'profile email',
  responseType: 'id_token',
};

// Configuration for authentication
const authConfig = {
  tokenRefreshInterval: 14 * 60 * 1000, // 14 minutes
  sessionKey: 'auth_session',
  // Set credentials to true for all auth requests
  fetchOptions: {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  endpoints: {
    // User authentication endpoints
    login: '/api/auth/login',
    register: '/api/auth/register',
    googleLogin: '/api/auth/google',
    googleOneTap: '/api/auth/google/one-tap', // Added explicit Google One Tap endpoint
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    session: '/api/auth/session',
    
    // Admin endpoints
    adminLogin: '/api/auth/admin/login',
    adminUsers: '/api/auth/admin/users'
  }
};

export { googleClientId, googleClientSecret, googleAuthConfig, authConfig };
