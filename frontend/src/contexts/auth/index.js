import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { authApi } from '../../services/api';
import config from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const refreshTimerRef = useRef(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    localStorage.removeItem(config.auth.sessionKey);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
  }, []);

  const updateUserSession = useCallback((userData, sessionData = null) => {
    setUser(userData);
    setIsAdmin(userData?.is_admin || false);
    if (sessionData) {
      setUserData(sessionData);
    }
    localStorage.setItem(config.auth.sessionKey, JSON.stringify(userData));
    setError(null);
  }, []);

  const handleAuthError = useCallback(
    (error) => {
      console.error('Auth error:', error);
      setError(error.response?.data?.message || 'Authentication failed');
      if (error.response?.status === 401) clearSession();
    },
    [clearSession]
  );

  const verifySession = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authApi.checkSession();
      if (data.authenticated && data.user) {
        updateUserSession(data.user, data.data);
      } else {
        clearSession();
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession, clearSession]);

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await authApi.refreshToken();
      if (data.user) updateUserSession(data.user);
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError, updateUserSession]);

  // Regular user login
  const handleLogin = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        // Ensure userData is properly formatted with email and password
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid login data format');
        }
        
        const { email, password } = userData;
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        
        const { data } = await authApi.login(userData);
        if (!data?.user) {
          throw new Error('Invalid server response - missing user data');
        }
        
        updateUserSession(data.user, data.data);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, updateUserSession]
  );

  // Admin login with override password
  const handleAdminLogin = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid admin login data format');
        }
        
        const { email, admin_password } = userData;
        if (!email || !admin_password) {
          throw new Error('Email and admin password are required');
        }
        
        const { data } = await authApi.adminLogin(userData);
        if (!data?.user) {
          throw new Error('Invalid server response - missing user data');
        }
        
        updateUserSession(data.user, data.data);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, updateUserSession]
  );

  // User registration
  const handleRegister = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid registration data format');
        }
        
        const { email, password, name } = userData;
        if (!email || !password || !name) {
          throw new Error('Email, password, and name are required');
        }
        
        const { data } = await authApi.register(userData);
        if (!data?.user) {
          throw new Error('Invalid server response - missing user data');
        }
        
        updateUserSession(data.user, data.data);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, updateUserSession]
  );

  // Google login
  const loginWithGoogle = useCallback(
    async (credential) => {
      if (!credential) {
        setError('Google authentication failed: No credential received');
        return;
      }
      setLoading(true);
      try {
        const { data } = await authApi.loginWithGoogle(credential);
        if (data?.user) updateUserSession(data.user, data.data);
        else throw new Error('Invalid response format');
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, updateUserSession]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
      clearSession();
    } catch (error) {
      handleAuthError(error);
    }
  }, [clearSession, handleAuthError]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const savedSession = localStorage.getItem(config.auth.sessionKey);
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          setUser(parsedSession);
          setIsAdmin(parsedSession?.is_admin || false);
          await verifySession();
        } catch (error) {
          console.error('Error parsing session data:', error);
          localStorage.removeItem(config.auth.sessionKey);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [verifySession]);

  useEffect(() => {
    if (user) {
      refreshTimerRef.current = setInterval(refreshToken, config.auth.tokenRefreshInterval);
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [user, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        isAdmin,
        login: handleLogin,
        adminLogin: handleAdminLogin,
        register: handleRegister,
        loginWithGoogle,
        logout: handleLogout,
        refreshToken,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
