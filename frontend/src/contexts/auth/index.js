import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { authApi } from '../../services/api';
import config from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem(config.auth.sessionKey);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
  }, []);

  const updateUserSession = useCallback((userData) => {
    setUser(userData);
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
      if (data.user) updateUserSession(data.user);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await authApi.refreshToken();
      if (data.user) updateUserSession(data.user);
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError, updateUserSession]);

  const handleLogin = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        // Ensure userData is properly formatted with email and password
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid login data format');
        }
        
        const { email, password } = userData;
        if (!email) {
          throw new Error('Email is required');
        }
        
        const { data } = await authApi.login(userData);
        if (!data?.user) {
          throw new Error('Invalid server response - missing user data');
        }
        
        updateUserSession(data.user);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, updateUserSession]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      if (!credential) {
        setError('Google authentication failed: No credential received');
        return;
      }
      setLoading(true);
      try {
        const { data } = await authApi.loginWithGoogle(credential);
        if (data?.user) updateUserSession(data.user);
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
        setUser,
        loading,
        error,
        login: handleLogin,
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
