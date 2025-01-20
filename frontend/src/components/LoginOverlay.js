import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import config from '../config';
import LoginAnimation from '../scripts/LoginAnimation';
import './LoginOverlay.css';

function LoginOverlay({ isVisible, onLogin, onGoogleLogin }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/login`, 
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/google`,
        { token: credentialResponse.credential },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        onGoogleLogin(response.data.user);
      } else {
        setError(response.data.message || 'Google login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during Google login');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign in was unsuccessful');
  };

  return (
    <LoginAnimation isVisible={isVisible}>
      <div className="login-modal neo-decoroco-panel">
        <h2>Welcome to Bartleby</h2>
        <p>Please sign in to continue</p>
        
        <div className="login-options">
          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              useOneTap
            />
          </div>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="neo-decoroco-input"
              required
            />
            
            <button 
              type="submit" 
              className="neo-decoroco-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </LoginAnimation>
  );
}

export default LoginOverlay;
