import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../contexts/auth';
import config from '../../config';

/**
 * Google authentication component that provides a simple, reliable OAuth flow
 * Optimized for cross-origin authentication between Vercel frontend and Render backend
 * 
 * @param {Object} props Component props
 * @param {Function} props.onSuccess Optional callback on successful authentication
 * @param {Function} props.onError Optional callback on authentication error
 * @param {String} props.buttonText Optional text to display on button
 * @param {String} props.theme Google button theme (default: 'outline')
 * @param {String} props.size Button size (default: 'large')
 */
const GoogleAuth = ({ 
  onSuccess, 
  onError, 
  buttonText,
  theme = 'outline',
  size = 'large'
}) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || config.googleClientId;
  
  // Handle successful authentication
  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      const error = new Error('Google authentication failed: Invalid credential response');
      console.error(error);
      if (onError) onError(error);
      return;
    }

    try {
      // Pass the credential to the auth context for backend verification
      const result = await loginWithGoogle(credentialResponse.credential);
      
      // Call the success callback if provided
      if (result && onSuccess) {
        onSuccess(credentialResponse);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      if (onError) onError(error);
    }
  };

  // Handle authentication errors
  const handleError = (error) => {
    console.error('Google Sign-In error:', error);
    if (onError) onError(error);
  };
  
  // Return error message if Google Client ID is missing
  if (!clientId) {
    console.error('Google Client ID is not configured. Check your environment variables.');
    return (
      <div className="google-auth-error alert alert-danger">
        <small>Google authentication is currently unavailable</small>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false} // Disable one-tap for consistency across browsers
      theme={theme}
      size={size}
      text={buttonText || "continue_with"}
      locale="en"
      shape="rectangular"
      width="100%"
    />
  );
};

export default GoogleAuth;