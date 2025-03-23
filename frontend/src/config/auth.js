const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID 
const googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET 
const googleCredentialAPIKey = process.env.REACT_APP_GOOGLE_CREDENTIAL_API_KEY 

const authConfig = {
  tokenRefreshInterval: 14 * 60 * 1000, // 14 minutes
  sessionKey: 'auth_session',
  endpoints: {
    login: '/api/auth/login',
    googleLogin: '/api/auth/google',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    session: '/api/auth/session',
    home: '/api/auth/home',
    callback: '/api/auth/callback'
  }
};

export { googleClientId, googleClientSecret, googleCredentialAPIKey, authConfig };
