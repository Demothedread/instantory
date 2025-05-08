import axios from 'axios';
import config from '../config';

// Create a centralized API instance with common configuration
const api = axios.create({
  baseURL: config.apiUrl || 'https://backend-bartleby-mn96.onrender.com',
  headers: {
    ...config.api.headers,
    'X-Requested-With': 'XMLHttpRequest',
    // The Origin header will be set automatically by the browser
    // It's not necessary to set it manually, and browsers will ignore it if you do
  },
  timeout: config.api.timeout || 30000,
  withCredentials: true
});

// Authentication API endpoints
export const authApi = {
  // User session management
  login: (userData) => api.post(config.auth.endpoints.login, userData),
  loginWithGoogle: (credential) => api.post(config.auth.endpoints.googleLogin, { credential }),
  logout: () => api.post(config.auth.endpoints.logout),      
  refreshToken: () => api.post(config.auth.endpoints.refresh),
  checkSession: () => api.get(config.auth.endpoints.session),
  
  // User registration
  register: (userData) => api.post(config.auth.endpoints.register, userData),
  
  // Admin authentication
  adminLogin: (adminData) => api.post(config.auth.endpoints.adminLogin, adminData),
  getUsers: () => api.get(config.auth.endpoints.adminUsers),
  updateUser: (userId, userData) => api.put(`${config.auth.endpoints.adminUsers}/${userId}`, userData),
};

// Add request interceptor for logging and debugging
api.interceptors.request.use(
  config => {
    if (config.baseURL && config.url) {
      if (config.isDevelopment) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }
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

// Enhanced error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Check for CORS errors
    if (error.message && error.message.includes('Network Error')) {
      console.error('Possible CORS error - check that the origin is allowed:', window.location.origin);
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
