import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import config from '../config';

/**
 * Unified Login Page Component
 * Features: Google Sign-In, Email Registration/Login, JWT token management
 * Styling: Neo-deco-rococo design aesthetic
 */
const LoginPage = ({ onLoginSuccess, onError }) => {
  // State management
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    checkExistingSession();
    initializeGoogleSignIn();
  }, []);

  // Check for existing authentication session
  const checkExistingSession = async () => {
    try {
      const { data } = await authApi.checkSession();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.data);
        }
      }
    } catch (error) {
      // No existing session, continue with login flow
      console.log('No existing session found');
    }
  };

  // Initialize Google Sign-In
  const initializeGoogleSignIn = () => {
    if (window.google && config.googleClientId) {
      window.google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  };

  // Handle Google Sign-In callback
  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await authApi.loginWithGoogle(response.credential);
      
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.data);
        }
      } else {
        throw new Error('Invalid response from Google authentication');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Google authentication failed';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle email/password authentication
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      if (mode === 'register') {
        if (!formData.name) {
          throw new Error('Name is required for registration');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
      }

      // Make API call
      const apiCall = mode === 'register' 
        ? authApi.register({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        : authApi.login({
            email: formData.email,
            password: formData.password
          });

      const { data } = await apiCall;

      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.data);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Authentication failed';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      setFormData({ email: '', password: '', name: '', confirmPassword: '' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  // Render Google Sign-In button
  const renderGoogleButton = () => (
    <div className="google-signin-container">
      <div 
        id="g_id_onload"
        data-client_id={config.googleClientId}
        data-callback="handleGoogleCallback"
        data-auto_prompt="false"
      ></div>
      <div 
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left"
        onClick={() => {
          if (window.google) {
            window.google.accounts.id.prompt();
          }
        }}
      >
        <div className="google-button">
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </div>
      </div>
    </div>
  );

  // If user is authenticated, show logout option
  if (isAuthenticated && user) {
    return (
      <div className="login-page authenticated">
        <div className="auth-container">
          <div className="user-info">
            <h2>Welcome, {user.name || user.email}!</h2>
            <p>You are successfully logged in.</p>
            {user.is_admin && <p className="admin-badge">Admin Access</p>}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Sign in to access your account' 
              : 'Join us to get started'
            }
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <div className="google-section">
          {renderGoogleButton()}
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="auth-form">
          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required={mode === 'register'}
                disabled={loading}
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={mode === 'register' ? 'Create a password (min 6 characters)' : 'Enter your password'}
              required
              disabled={loading}
              minLength={mode === 'register' ? 6 : undefined}
            />
          </div>

          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="auth-toggle">
          <p>
            {mode === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "
            }
            <button 
              type="button" 
              onClick={toggleMode} 
              className="toggle-button"
              disabled={loading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      {/* Neo-Deco-Rococo Styling */}
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 20px;
          font-family: 'Georgia', serif;
        }

        .auth-container {
          background: linear-gradient(145deg, #2c2c54 0%, #40407a 100%);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 215, 0, 0.2);
          width: 100%;
          max-width: 450px;
          border: 2px solid transparent;
          background-clip: padding-box;
          position: relative;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #45b7d1);
          border-radius: 22px;
          z-index: -1;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-title {
          font-size: 2.2rem;
          font-weight: bold;
          color: #ffd700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          font-family: 'Georgia', serif;
        }

        .auth-subtitle {
          color: #e1e5e9;
          font-size: 1rem;
          margin: 0;
        }

        .error-message {
          background: linear-gradient(145deg, #ff6b6b, #e55353);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.9rem;
        }

        .google-section {
          margin-bottom: 20px;
        }

        .google-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: white;
          color: #757575;
          border: 2px solid #dadce0;
          border-radius: 12px;
          padding: 12px 20px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .google-button:hover {
          background: #f8f9fa;
          border-color: #4285f4;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
        }

        .google-icon {
          width: 18px;
          height: 18px;
        }

        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ffd700, transparent);
        }

        .divider span {
          background: #40407a;
          color: #ffd700;
          padding: 0 15px;
          font-size: 0.9rem;
          position: relative;
        }

        .auth-form {
          margin-bottom: 20px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          color: #ffd700;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .input-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #5c5c7a;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .input-group input:focus {
          outline: none;
          border-color: #ffd700;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        .input-group input::placeholder {
          color: #a0a0b8;
        }

        .auth-submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(145deg, #ffd700, #ffb700);
          color: #1a1a2e;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .auth-submit-button:hover:not(:disabled) {
          background: linear-gradient(145deg, #ffb700, #ffd700);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        .auth-submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-toggle {
          text-align: center;
          margin-top: 20px;
        }

        .auth-toggle p {
          color: #e1e5e9;
          margin: 0;
        }

        .toggle-button {
          background: none;
          border: none;
          color: #ffd700;
          cursor: pointer;
          font-weight: bold;
          text-decoration: underline;
          font-size: inherit;
        }

        .toggle-button:hover:not(:disabled) {
          color: #ffb700;
        }

        .authenticated {
          text-align: center;
        }

        .user-info h2 {
          color: #ffd700;
          margin-bottom: 10px;
        }

        .user-info p {
          color: #e1e5e9;
          margin-bottom: 10px;
        }

        .admin-badge {
          background: linear-gradient(145deg, #4ecdc4, #44b3a8);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .logout-button {
          background: linear-gradient(145deg, #ff6b6b, #e55353);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: linear-gradient(145deg, #e55353, #ff6b6b);
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .auth-title {
            font-size: 1.8rem;
          }
        }
      `}</style>

      {/* Load Google Identity Services */}
      <script async defer src="https://accounts.google.com/gsi/client"></script>
    </div>
  );
};

export default LoginPage;
