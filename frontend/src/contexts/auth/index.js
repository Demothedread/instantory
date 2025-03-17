import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { authConfig } from '../../config/auth';
import axios from 'axios';

const AuthContext = createContext();

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'https://instantory.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem(authConfig.sessionKey);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
  }, []);

  const updateUserSession = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(authConfig.sessionKey, JSON.stringify(userData));
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
      const { data } = await api.get(authConfig.endpoints.session);
      if (data.user) updateUserSession(data.user);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, updateUserSession]);

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await api.post(authConfig.endpoints.refresh);
      if (data.user) updateUserSession(data.user);
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError, updateUserSession]);

  const handleLogin = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        const { data } = await api.post(authConfig.endpoints.login, userData);
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
        const { data } = await api.post(authConfig.endpoints.googleLogin, { credential });
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
      await api.post(authConfig.endpoints.logout);
      clearSession();
    } catch (error) {
      handleAuthError(error);
    }
  }, [clearSession, handleAuthError]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const savedSession = localStorage.getItem(authConfig.sessionKey);
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          setUser(parsedSession);
          await verifySession();
        } catch {
          localStorage.removeItem(authConfig.sessionKey);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [verifySession]);

  useEffect(() => {
    if (user) {
      refreshTimerRef.current = setInterval(refreshToken, authConfig.tokenRefreshInterval);
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