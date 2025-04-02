const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Configuration for authentication
const authConfig = {
  tokenRefreshInterval: 14 * 60 * 1000, // 14 minutes
  sessionKey: 'auth_session',
  endpoints: {
    // User authentication endpoints
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

export { googleClientId, authConfig };
