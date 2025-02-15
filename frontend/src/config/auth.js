export const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const authConfig = {
  tokenRefreshInterval: 14 * 60 * 1000, // 14 minutes
  sessionKey: 'auth_session',
  endpoints: {
    login: '/api/auth/login',
    googleLogin: '/api/auth/google',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    session: '/api/auth/session'
  }
};

const auth = {
  googleClientId,
  authConfig
};

export default auth;
