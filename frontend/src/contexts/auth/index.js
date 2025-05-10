import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '../../services/api';
import config from '../../config';

// Create the auth context
export const AuthContext = createContext();

/**
 * Authentication provider that manages user session state
 * Optimized for cross-origin authentication between Vercel frontend and Render backend
 */
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
    localStorage.removeItem('auth_token');
    
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);
  }, []);

  // Update user session
  const updateUserSession = useCallback((userData, sessionData = null) => {
    if (!userData) return;
    
    setUser(userData);
    setIsAdmin(userData?.is_admin || false);
    setAuthenticated(true);
    
    if (sessionData) {
      setUserData(sessionData);
    }
    
    // Store minimal user data in local storage for persistence
    // Avoid storing sensitive information
    localStorage.setItem(config.auth.sessionKey, JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      is_admin: userData.is_admin
    }));
    
    setError(null);
  }, []);

  // Handle auth errors with improved robustness
  const handleAuthError = useCallback((error) => {
    let errorMessage = 'Authentication failed';
    
    // Extract error message from various formats
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.userMessage) {
      errorMessage = error.userMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth error:', error);
    }
    
    setError(errorMessage);
    
    // Clear session only on auth-related errors (401), not on network issues
    if (error.response?.status === 401) {
      clearSession();
    }
  }, [clearSession]);

  // Verify session with backend
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
      // Only handle authentication errors, not network errors
      if (error.response?.status === 401) {
        handleAuthError(error);
      } else {
        // Don't clear session on network errors
        console.warn('Session check failed - will retry later:', error.message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession, clearSession]);

  // Refresh token with more robust handling for cross-origin scenarios
  const refreshToken = useCallback(async () => {
    // Only attempt refresh if we have a user
    if (!user) return;
    
    try {
      const { data } = await authApi.refreshToken();
      if (data.authenticated && (data.user || data.token_refreshed)) {
        // Update session if we got user data
        if (data.user) {
          updateUserSession(data.user, data.data);
        }
        
        // Store token in localStorage as a fallback if provided
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      // Handle token refresh failures appropriately
      if (error.response?.status === 401) {
        handleAuthError(error);
        return false;
      } else {
        // Don't logout on network issues
        console.warn('Token refresh error, will retry later:', error.message);
        return false;
      }
    }
  }, [handleAuthError, updateUserSession, user]);

  // Email login
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }
      
      const { data } = await authApi.login(credentials);
      if (data?.user) {
        updateUserSession(data.user, data.data);
        
        // Store token in localStorage as a fallback if provided
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
        }
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
  const adminLogin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      if (!credentials?.email || !credentials?.admin_password) {
        throw new Error('Email and admin password are required');
      }
      
      const { data } = await authApi.adminLogin(credentials);
      if (data?.user) {
        updateUserSession(data.user, data.data);
        
        // Store token in localStorage as a fallback if provided
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
        }
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
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      if (!userData?.email || !userData?.password || !userData?.name) {
        throw new Error('Name, email, and password are required');
      }
      
      const { data } = await authApi.register(userData);
      if (data?.user) {
        updateUserSession(data.user, data.data);
        
        // Store token in localStorage as a fallback if provided
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
        }
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
      return false;
    }
    
    setLoading(true);
    try {
      const { data } = await authApi.loginWithGoogle(credential);
      
      if (data?.user) {
        // Standard flow - user data returned directly
        updateUserSession(data.user, data.data);
        
        // Store token in localStorage as a fallback if provided
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
        }
        
        return true;
      } else if (data?.redirectUrl) {
        // Redirect flow - backend wants us to redirect to Google OAuth
        window.location.href = data.redirectUrl;
        return false;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Just log the error but still clear session
      console.error('Logout error:', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Listen for auth error events from API interceptor
  useEffect(() => {
    const handleAuthErrorEvent = (event) => {
      if (event.detail?.status === 401) {
        clearSession();
      }
    };
    
    window.addEventListener('auth:error', handleAuthErrorEvent);
    
    return () => {
      window.removeEventListener('auth:error', handleAuthErrorEvent);
    };
  }, [clearSession]);

  // Initialize auth on mount
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
    const checkInterval = config.auth.sessionCheckInterval || 60000; // Default to 1 minute
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
          console.warn('Silent session check failed:', e.message);
          // Don't logout on network errors
        }
      }
    }, checkInterval);
    
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [verifySession, clearSession, user]);

  // Set up token refresh timer when user is logged in
  useEffect(() => {
    if (user) {
      const refreshInterval = config.auth.tokenRefreshInterval || 15 * 60 * 1000; // Default to 15 minutes
      refreshTimerRef.current = setInterval(refreshToken, refreshInterval);
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
    login,
    adminLogin,
    register,
    loginWithGoogle,
    logout,
    refreshToken,
    clearError: () => setError(null),
    verifySession,
    setError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
