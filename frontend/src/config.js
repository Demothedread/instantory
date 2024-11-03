const config = {
  // Development API URL
  development: {
    apiUrl: 'http://localhost:5000'
  },
  // Production API URL - update this with your Render backend URL
  production: {
    apiUrl: process.env.PUBLIC_BACKEND_URL || 'https://instantory-api.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
