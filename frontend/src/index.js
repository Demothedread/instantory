import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './App';
import config from './config';
import reportWebVitals from './reportWebVitals';

// Enhanced Google Client ID validation with fallback
const validateGoogleClientId = () => {
  if (!config.googleClientId) {
    console.error('⚠️ Google Client ID is not configured. OAuth features will be disabled.');
    console.log('To enable Google authentication, set REACT_APP_GOOGLE_CLIENT_ID environment variable');
    return false;
  }
  
  if (config.googleClientId === 'your-google-client-id-here' || config.googleClientId.length < 10) {
    console.error('⚠️ Google Client ID appears to be a placeholder or invalid');
    return false;
  }
  
  console.log('✅ Google Client ID configured successfully');
  return true;
};

const isGoogleOAuthEnabled = validateGoogleClientId();

// Enhanced error boundary wrapper
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      console.error('React Error Boundary caught:', event.error);
      setError(event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4af37',
        fontFamily: '"Playfair Display", serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Bartleby Initialization Error
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '1rem', opacity: 0.9 }}>
          Something went wrong during startup. Attempting recovery...
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#d4af37',
            color: '#1a1a1a',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Reload Application
        </button>
        {error && (
          <details style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.7 }}>
            <summary>Error Details</summary>
            <pre style={{ marginTop: '0.5rem', textAlign: 'left' }}>
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    );
  }

  return children;
};

const root = createRoot(document.getElementById("root"));

// Conditional OAuth provider wrapper
const AppWithAuth = () => {
  if (isGoogleOAuthEnabled) {
    return (
      <GoogleOAuthProvider clientId={config.googleClientId}>
        <AppWrapper />
      </GoogleOAuthProvider>
    );
  } else {
    // Render app without Google OAuth provider
    console.warn('🔄 Running in OAuth-disabled mode');
    return <AppWrapper />;
  }
};

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppWithAuth />
    </ErrorBoundary>
  </React.StrictMode>
);
  
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
