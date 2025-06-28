import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './App';
import config from './config';
import reportWebVitals from './reportWebVitals';

// Ensure Google client ID is available
if (!config.googleClientId) {
  console.error('Google Client ID is not configured');
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <AppWrapper />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
  
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
