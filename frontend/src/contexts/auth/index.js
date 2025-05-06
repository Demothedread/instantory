import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '../../services/api';
import config from '../../config';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State for auth data
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const refreshTimerRef = useRef(null);
  const sessionCheckIntervalRef = useRef(null);

  // Clear session data
  const clearSession = useCallback(() => {
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    setAuthenticated(false);
    localStorage.removeItem(config.auth.sessionKey);
    
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);
  }, []);

  // Update user session
  const updateUserSession = useCallback((userData, sessionData = null) => {
    setUser(userData);
    setIsAdmin(userData?.is_admin || false);
    setAuthenticated(true);
    
    if (sessionData) {
      setUserData(sessionData);
    }
    
    localStorage.setItem(config.auth.sessionKey, JSON.stringify(userData));
    setError(null);
  }, []);

  // Handle auth errors
  const handleAuthError = useCallback((error) => {
    console.error('Auth error:', error);
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Authentication failed';
    setError(errorMessage);
    
    // Clear session on 401 errors
    if (error.response?.status === 401) {
      clearSession();
    }
  }, [clearSession]);

  // Verify session with backend - both Quart-Auth and JWT
  const verifySession = useCallback(async () => {
    try {
      const { data } = await authApi.checkSession();
      if (data.authenticated && data.user) {
        updateUserSession(data.user, data.data);
        return true;
      } else {
        clearSession();
        return false;
      }
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession, clearSession]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    // Only attempt refresh if we have a user
    if (!user) return;
    
    try {
      const { data } = await authApi.refreshToken();
      if (data.user) {
        updateUserSession(data.user);
      }
    } catch (error) {
      // Only handle critical errors, don't log out on network issues
      if (error.response?.status === 401) {
        handleAuthError(error);
      } else {
        console.warn('Token refresh encountered an error, will retry later:', error);
      }
    }
  }, [handleAuthError, updateUserSession, user]);

  // Email login
  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }
      
      const { data } = await authApi.login(credentials);
      if (data?.user) {
        updateUserSession(data.user, data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  // Admin login
  const handleAdminLogin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      if (!credentials?.email || !credentials?.admin_password) {
        throw new Error('Email and admin password are required');
      }
      
      const { data } = await authApi.adminLogin(credentials);
      if (data?.user) {
        updateUserSession(data.user, data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  // User registration
  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    try {
      if (!userData?.email || !userData?.password || !userData?.name) {
        throw new Error('Name, email, and password are required');
      }
      
      const { data } = await authApi.register(userData);
      if (data?.user) {
        updateUserSession(data.user, data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  // Google login with enhanced error handling
  const loginWithGoogle = useCallback(async (credential) => {
    if (!credential) {
      setError('Google authentication failed: No credential received');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await authApi.loginWithGoogle(credential);
      
      if (data?.user) {
        updateUserSession(data.user, data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Initialize auth on mount and set up session check interval
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Try to get session from localStorage first
      const savedSession = localStorage.getItem(config.auth.sessionKey);
      
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          setUser(parsedSession);
          setIsAdmin(parsedSession?.is_admin || false);
          setAuthenticated(true);
          
          // Then verify with backend
          await verifySession();
        } catch (error) {
          console.error('Error parsing session data:', error);
          localStorage.removeItem(config.auth.sessionKey);
          setLoading(false);
        }
      } else {
        await verifySession(); // Still check if there's a valid session (cookies)
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Set up periodic session checks
    sessionCheckIntervalRef.current = setInterval(async () => {
      // Silent session verification to detect logouts from other tabs
      if (user) {
        try {
          const sessionValid = await verifySession();
          if (!sessionValid) {
            console.log('Session ended or invalid, logging out');
            clearSession();
          }
        } catch (e) {
          console.warn('Silent session check failed:', e);
          // Don't logout on network errors, only on explicit auth errors
        }
      }
    }, config.auth.sessionCheckInterval || 60000); // Every minute by default
    
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [verifySession, clearSession, user]);

  // Set up token refresh timer when user is logged in
  useEffect(() => {
    if (user) {
      refreshTimerRef.current = setInterval(
        refreshToken, 
        config.auth.tokenRefreshInterval
      );
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [user, refreshToken]);

  // Context value with all auth functions
  const contextValue = {
    user,
    userData,
    loading,
    error,
    isAdmin,
    isAuthenticated,
    setUser,
    setAuthenticated,
    login: handleLogin,
    adminLogin: handleAdminLogin,
    register: handleRegister,
    loginWithGoogle,
    logout: handleLogout,
    refreshToken,
    clearError: () => setError(null),
    verifySession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
