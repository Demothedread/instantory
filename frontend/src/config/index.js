import { authConfig, googleClientId, googleClientSecret } from './auth';

// Environment variables with fallbacks
const environment = process.env.NODE_ENV || 'production';
const apiUrl = process.env.REACT_APP_BACKEND_URL || 'https://bartleby-backend-mn96.onrender.com';

// Dynamic domain configuration from environment variables
const productionDomain = process.env.REACT_APP_PRODUCTION_DOMAIN || 'hocomnia.com';
const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'https://hocomnia.com';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://bartleby-backend-mn96.onrender.com';

// Build allowed origins dynamically from environment variables
const buildAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:3000', // Always allow localhost for development
    'http://localhost:5001'  // Test environment
  ];

  // Add production domains from environment variables
  if (productionDomain) {
    baseOrigins.push(`https://${productionDomain}`);
    baseOrigins.push(`https://www.${productionDomain}`);
  }

  // Add frontend and backend URLs if provided
  if (frontendUrl) baseOrigins.push(frontendUrl);
  if (backendUrl) baseOrigins.push(backendUrl);

  // Add any additional origins from environment variable (comma-separated)
  const additionalOrigins = process.env.REACT_APP_ADDITIONAL_ORIGINS;
  if (additionalOrigins) {
    const extraOrigins = additionalOrigins.split(',').map(origin => origin.trim());
    baseOrigins.push(...extraOrigins);
  }

  // Remove duplicates and filter out empty strings
  return [...new Set(baseOrigins.filter(Boolean))];
};

// Environment-specific settings
const environments = {
  development: {
    apiUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
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
    withCredentials: true, // Always send credentials for auth flows
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      'X-Requested-With': 'XMLHttpRequest'
    },
    // Common fetch options when not using axios
    fetchOptions: {
      credentials: 'include', // Always include credentials for fetch API
      mode: 'cors', // Explicitly state we're using CORS
      cache: 'no-cache' // Avoid caching issues with auth tokens
    }
  },
  
  // Domain configuration - now dynamic
  domains: {
    main: productionDomain,
    frontend: frontendUrl,
    backend: backendUrl,
    allowedOrigins: buildAllowedOrigins()
  },
  
  // Google Sign-In configuration with dynamic redirect URI
  googleSignIn: {
    enabled: true,
    clientId: googleClientId,
    cookiePolicy: 'single_host_origin',
    fetchBasicProfile: true,
    uxMode: 'redirect',
    accessType: 'offline',
    // Dynamic redirect URI based on environment
    redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${frontendUrl}/auth/callback`
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
  console.log(`Allowed CORS origins:`, config.domains.allowedOrigins);
  console.log(`Google redirect URI: ${config.googleSignIn.redirectUri}`);
}

export default config;
