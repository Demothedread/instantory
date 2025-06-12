import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import config from '../config';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await authApi.checkSession();
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.log('No active session found');
      // Clear any stale auth data
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        
        // Store auth token if provided
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        return response.data;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.loginWithGoogle(credential);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        
        // Store auth token if provided
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        return response.data;
      } else {
        throw new Error('Invalid Google login response');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Google login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API response
      setUser(null);
      localStorage.removeItem('auth_token');
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    checkSession,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
