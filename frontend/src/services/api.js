import axios from 'axios';
import config from '../config';

/**
 * Central API configuration that handles authentication between 
 * Vercel frontend and Render backend
 */
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: config.api.timeout || 30000,
  withCredentials: true // Essential for cross-origin cookies
});

// Authentication API endpoints
export const authApi = {
  // User session management
  login: (userData) => api.post(config.auth.endpoints.login, userData),
  loginWithGoogle: (credential) => api.post(config.auth.endpoints.googleLogin, { credential }),
  logout: () => api.post(config.auth.endpoints.logout),      
  refreshToken: () => api.post(config.auth.endpoints.refresh),
  checkSession: () => api.get(config.auth.endpoints.session),
  
  // User registration - ensure this correctly matches backend endpoint
  register: (userData) => api.post(config.auth.endpoints.register, userData),
  
  // Admin authentication
  adminLogin: (adminData) => api.post(config.auth.endpoints.adminLogin, adminData),
  getUsers: () => api.get(config.auth.endpoints.adminUsers),
  updateUser: (userId, userData) => api.put(`${config.auth.endpoints.adminUsers}/${userId}`, userData),
};

// Request interceptor for auth token and logging
api.interceptors.request.use(
  config => {
    // Add auth token from localStorage as backup to cookies
    const authToken = localStorage.getItem('auth_token');
    if (authToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Add origin header for CORS requests
    config.headers.Origin = window.location.origin;
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Data API endpoints
export const dataApi = {
  // Inventory endpoints
  getInventory: () => api.get('/api/inventory'),
  addInventoryItem: (item) => api.post('/api/inventory', item),
  updateInventoryItem: (id, item) => api.put(`/api/inventory/${id}`, item),
  deleteInventoryItem: (id) => api.delete(`/api/inventory/${id}`),
  
  // Document endpoints
  getDocuments: () => api.get('/api/documents'),
  uploadDocument: (formData) => api.post('/api/documents', formData),
  getDocument: (id) => api.get(`/api/documents/${id}`),
  deleteDocument: (id) => api.delete(`/api/documents/${id}`),
  
  // File processing
  processFiles: () => api.post('/api/files/process'),
};

// Enhanced error handling interceptor - improve debugging of authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    // Authentication errors
    if (error.response?.status === 401) {
      // Could be handled with a central auth state manager to trigger re-login
      console.warn('Authentication error: User session may have expired');
      
      // Emit custom event for auth error (can be handled by auth context)
      const authErrorEvent = new CustomEvent('auth:error', { 
        detail: { status: 401, message: 'Session expired' }
      });
      window.dispatchEvent(authErrorEvent);
    }
    
    // Handle CORS errors specially since they're common in cross-origin auth
    if (error.message && error.message.includes('Network Error')) {
      console.error('CORS error detected - verify CORS configuration on both frontend and backend');
      console.error(`Frontend origin: ${window.location.origin}`);
      console.error(`API URL: ${config.apiUrl}`);
      console.error('Request details:', error.config);
      
      // Make the error message more user-friendly
      error.userMessage = 'Unable to connect to the server. This may be due to CORS restrictions or network issues.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
