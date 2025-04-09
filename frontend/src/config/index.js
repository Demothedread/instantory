import { authConfig, googleClientId, googleClientSecret } from './auth';

// Environment variables with fallbacks
const environment = process.env.NODE_ENV || 'production';
const apiUrl = process.env.REACT_APP_BACKEND_URL || 'https://instantory.onrender.com';

// Environment-specific settings
const environments = {
  development: {
    apiUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
    debug: true
  },
  production: {
    apiUrl,
    debug: false
  },
  test: {
    apiUrl: 'http://localhost:5001',
    debug: true
  }
};

// Main configuration object
const config = {
  // Base configuration from environment
  ...environments[environment],
  
  // Environment information
  environment,
  isProduction: environment === 'production',
  isDevelopment: environment === 'development',
  isTest: environment === 'test',
  
  // Auth configuration
  auth: authConfig,
  googleClientId,
  googleClientSecret,
  
  // API request defaults
  api: {
    timeout: 30000, // 30 seconds
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      'Access-Control-Allow-Credentials': 'true'
      // Removed browser-specific headers as they may cause issues with axios
      // The withCredentials option in axios handles CORS credentials
    }
    // Removed mode and credentials as they are not axios options
    // They have been moved to the proper fetch API calls if needed
  },
  
  // Google Sign-In configuration
  googleSignIn: {
    enabled: true,
    clientId: googleClientId
  },
  
  // Storage configuration
  storage: {
    blobToken: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN
  }
};

// Log configuration in non-production
if (!config.isProduction) {
  console.log(`Running in ${environment} mode with API URL: ${config.apiUrl}`);
  console.log(`Using Google Client ID: ${googleClientId}`);
}

export default config;
