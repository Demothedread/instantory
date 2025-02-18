import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import authConfig from './authConfig';
import axios from 'axios';
import config from '../../config';

const AuthContext = createContext();

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  // Base API URL
  const apiUrl = config.apiUrl;

  // Helper: Centralized API call handler
  const apiCall = useCallback(async (method, endpoint, data = {}) => {
    try {
      const response = await axios({
        method,
        url: `${apiUrl}${endpoint}`,
        data,
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.message || 'Authentication failed';
      setError(message);
      if (err?.response?.status === 401) {
        clearSession();
      }
      throw err;
    }
  }, [apiUrl]);

  // Helper: Save session to localStorage and state
  const saveSession = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(authConfig.sessionKey, JSON.stringify(userData));
    setError(null); // Clear errors on successful session update
  }, []);

  // Helper: Clear session data
  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem(authConfig.sessionKey);
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Verify session with the backend
  const verifySession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall('get', authConfig.endpoints.session);
      if (data.user) {
        saveSession(data.user);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, saveSession]);

  // Initialize authentication state on mount
  const initializeAuth = useCallback(async () => {
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
  }, [verifySession]);

  // Periodically refresh the token if logged in
  const refreshToken = useCallback(async () => {
    try {
      const data = await apiCall('post', authConfig.endpoints.refresh);
      if (data.user) {
        saveSession(data.user);
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
    }
  }, [apiCall, saveSession]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user && !refreshTimerRef.current) {
      refreshTimerRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
    }
    return () => clearInterval(refreshTimerRef.current);
  }, [user, refreshToken]);

  // Handle email login (or sign-up if backend uses the same endpoint)
  const handleLogin = useCallback(async (email) => {
    setLoading(true);
    try {
      const data = await apiCall('post', authConfig.endpoints.login, { email });
      if (data.user) saveSession(data.user);
    } finally {
      setLoading(false);
    }
  }, [apiCall, saveSession]);

  // Optionally: Handle registration if different from login
  // const handleRegister = useCallback(async (email, password, name) => {
  //   setLoading(true);
  //   try {
  //     const data = await apiCall('post', authConfig.endpoints.register, { email, password, name });
  //     if (data.user) saveSession(data.user);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [apiCall, saveSession]);

  // Handle Google login
  const handleGoogleLogin = useCallback(async (credential) => {
    setLoading(true);
    try {
      const data = await apiCall('post', authConfig.endpoints.googleLogin, { credential });
      if (data.user) saveSession(data.user);
    } finally {
      setLoading(false);
    }
  }, [apiCall, saveSession]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await apiCall('post', authConfig.endpoints.logout);
      clearSession();
    } catch (error) {
      console.warn('Logout failed:', error);
    }
  }, [apiCall, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        handleLogin,
        handleGoogleLogin,
        handleLogout,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;