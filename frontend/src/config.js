const config = {
  // Development API URL
  development: {
    apiUrl: process.env.REACT_APP_BACKEND_URL_DEV || 'http://localhost:10000',
    headers: {
      'Accept': 'application/json',
      'Origin': window.location.origin,
      'Access-Control-Allow-Credentials': 'true'
    },
    credentials: 'include'
  },
  // Production API URL
  production: {
    apiUrl: process.env.REACT_APP_BACKEND_URL || 'https://instantory.onrender.com',
    headers: {
      'Accept': 'application/json',
      'Origin': window.location.origin,
      'Access-Control-Allow-Credentials': 'true'
    },
    credentials: 'include'
  }
};

// Ensure we're using the correct environment
const environment = process.env.NODE_ENV || 'production';
console.log(`Running in ${environment} mode with API URL: ${config[environment].apiUrl}`);

export default config[environment];
