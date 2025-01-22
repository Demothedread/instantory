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

const googleConfig = {
  web: {
    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    project_id: 'ancient-snow-448020-n8',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    redirect_uris: [
      'http://localhost:3000',
      'https://hocomnia.com',
      'https://instantory.vercel.app'
    ],
    javascript_origins: [
      'http://localhost:3000',
      'https://hocomnia.com',
      'https://bartleby.vercel.app',
      'https://instantory.vercel.app'
    ]
  }
};

if (!googleConfig.web.client_id) {
  console.error('REACT_APP_GOOGLE_CLIENT_ID is not defined');
}

console.log(googleConfig.web.client_id);

// Ensure we're using the correct environment
const environment = process.env.NODE_ENV || 'production';
console.log(`Running in ${environment} mode with API URL: ${config[environment].apiUrl}`);

export default config[environment];
