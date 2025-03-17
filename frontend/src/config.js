const environment = process.env.NODE_ENV || 'production';
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '700638306537-27jsc5c64hrjq6153mc5fll6prmgef4o.apps.googleusercontent.com';
// Initialize configuration with defaults
const initConfig = () => {
  // Default configuration values
  const defaultConfig = {
    development: {
      googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || googleClientId
    },
    production: {
      apiUrl: 'https://instantory.onrender.com',
      googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || googleClientId
    }
  };

  // Ensure environment variables take precedence
  return {
    apiUrl: process.env.REACT_APP_BACKEND_URL || defaultConfig[environment].apiUrl,
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || defaultConfig[environment].googleClientId,
  };
};

// Create configuration object
const config = {
  ...initConfig(),
  headers: {
    'Accept': 'application/json',
    'Origin': window.location.origin,
    'Access-Control-Allow-Credentials': 'true',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty'
  },
  fedcm: {
    enabled: true,
    providers: [{
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || googleClientId
    }]
  },
  credentials: 'include',
  mode: 'cors',
  blobStore: {
    token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN
  }
};

console.log(`Running in ${environment} mode with API URL: ${config.apiUrl}`);
console.log(`Using Google Client ID: ${config.googleClientId}`);

export default config;
