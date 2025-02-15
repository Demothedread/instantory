const environment = process.env.NODE_ENV || 'production';

// Default configuration values
const defaultConfig = {
  development: {
    apiUrl: 'http://localhost:5000',
    googleClientId: '700638306537-27jsc5c64hrjq6153mc5fll6prmgef4o.apps.googleusercontent.com'
  },
  production: {
    apiUrl: 'https://instantory.onrender.com',
    googleClientId: '700638306537-27jsc5c64hrjq6153mc5fll6prmgef4o.apps.googleusercontent.com'
  }
};

// Environment-specific configuration
const config = {
  apiUrl: process.env.REACT_APP_BACKEND_URL || defaultConfig[environment].apiUrl,
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || defaultConfig[environment].googleClientId,
  headers: {
    'Accept': 'application/json',
    'Origin': window.location.origin,
    'Access-Control-Allow-Credentials': 'true'
  },
  credentials: 'include',
  blobStore: {
    token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN
  }
};

console.log(`Running in ${environment} mode with API URL: ${config.apiUrl}`);
console.log(`Using Google Client ID: ${config.googleClientId}`);

export default config;
