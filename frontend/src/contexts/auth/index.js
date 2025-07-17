import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import config from '../../config';

/**
 * AuthContext - Provides authentication state and methods
 * Enhanced with error handling and graceful degradation
 */

const AuthContext = createContext({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loginWithGoogle: () => {},
  register: () => {},
  adminLogin: () => {},
  clearError: () => {}
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clear error handler
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check initial authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have a valid session
        const response = await fetch(`${config.apiUrl}/api/auth/session`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.user) {
            setUser(userData.user);
            setIsAuthenticated(true);
            console.log('✅ User session restored:', userData.user.email || userData.user.name);
          }
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (err) {
        console.warn('⚠️ Session check failed:', err.message);
        // Don't set this as an error - just means no session
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent flash
    const timeoutId = setTimeout(initializeAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Login with email/password
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Login successful:', data.user.email);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.message || 'Login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Network error during login';
      console.error('Login error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth login
  const loginWithGoogle = useCallback(async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);

      if (!credentialResponse?.credential) {
        throw new Error('No Google credential received');
      }

      const response = await fetch(`${config.apiUrl}/api/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          credential: credentialResponse.credential,
          clientId: config.googleClientId 
        })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Google login successful:', data.user.email);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.message || 'Google login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Google login error';
      console.error('Google login error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register new user
  const register = useCallback(async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Registration successful:', data.user.email);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.message || 'Registration failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Network error during registration';
      console.error('Registration error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin login
  const adminLogin = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.apiUrl}/api/auth/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Admin login successful:', data.user.email);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.message || 'Admin login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Network error during admin login';
      console.error('Admin login error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      await fetch(`${config.apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('✅ Logout successful');
    } catch (err) {
      console.warn('Logout error:', err);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Provide context value
  const contextValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    loginWithGoogle,
    register,
    adminLogin,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
export default AuthContext;
