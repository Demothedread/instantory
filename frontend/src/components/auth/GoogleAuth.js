import React, { useContext, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider, useGoogleOneTapLogin } from '@react-oauth/google';
import { AuthContext } from '../../contexts/auth';
import config from '../../config';

const GoogleAuth = ({ onSuccess, onError, buttonText = 'Sign in with Google', showOneTap = true }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || config.googleClientId;
  
  // Handle successful authentication
  const handleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse?.credential) {
        await loginWithGoogle(credentialResponse.credential);
        if (onSuccess) onSuccess(credentialResponse);
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      if (onError) onError(error);
    }
  };

  // Handle authentication errors
  const handleError = (error) => {
    console.error('Google Sign-In error:', error);
    if (onError) onError(error);
  };
  
  // Use Google One Tap if enabled
  useGoogleOneTapLogin({
    onSuccess: showOneTap ? handleSuccess : null,
    onError: showOneTap ? handleError : null,
    disabled: !showOneTap,
  });
  
  if (!clientId) {
    console.error('Google Client ID is not configured. Check your environment variables.');
    return <p>Authentication configuration error. Please contact support.</p>;
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false} // We're handling OneTap separately with the hook
      theme="outline"
      size="large"
      shape="rectangular"
      text="continue_with"
      locale="en"
    />
  );
};

export default GoogleAuth;