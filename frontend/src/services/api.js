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
    
    // DO NOT manually set Origin header - browsers set this automatically
    // and will reject requests that try to override it
    // Removed: config.headers.Origin = window.location.origin;
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log('Request headers:', config.headers);
      console.log('Request origin (automatic):', window.location.origin);
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

// OpenAI API endpoints
export const openaiApi = {
  // Health check
  checkHealth: () => api.get('/api/openai/health'),
  
  // Document processing
  processDocument: (content, options = {}) => api.post('/api/openai/process-document', {
    content,
    file_name: options.fileName || null,
    document_type: options.documentType || 'unknown',
    user_instruction: options.userInstruction || null
  }),
  
  // Inventory analysis
  analyzeInventory: (items) => api.post('/api/openai/analyze-inventory', { items }),
  
  // General insights
  generateInsights: (data, context = null) => api.post('/api/openai/generate-insights', {
    data_type: 'general',
    data,
    context
  }),
  
  // Image description processing
  processImageDescription: (imageUrl, description) => api.post('/api/openai/process-image-description', {
    image_url: imageUrl,
    description
  }),
  
  // Batch processing
  batchProcess: (items) => api.post('/api/openai/batch-process', { items })
};

// Dashboard API endpoints
export const dashboardApi = {
  // Summary statistics
  getSummary: (options = {}) => {
    const params = new URLSearchParams();
    if (options.period) params.append('period', options.period);
    if (options.includeInsights !== undefined) {
      params.append('include_insights', options.includeInsights.toString());
    }
    
    const queryString = params.toString();
    return api.get(`/api/dashboard/summary${queryString ? '?' + queryString : ''}`);
  },
  
  // Activity feed
  getActivity: (limit = 20) => api.get(`/api/dashboard/activity?limit=${limit}`),
  
  // Statistics
  getStats: (type = 'general') => api.get(`/api/dashboard/stats?type=${type}`),
  
  // AI insights
  getInsights: () => api.get('/api/dashboard/insights')
};

// Enhanced error handling interceptor - improve debugging of authentication errors
api.interceptors.response.use(
  response => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  error => {
    // Detailed error logging for debugging
    console.group('🚨 API Error Details');
    console.error('Error:', error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    console.error('Request Origin:', window.location.origin);
    console.error('API Base URL:', config.apiUrl);
    
    if (error.response?.data) {
      console.error('Response Data:', error.response.data);
    }
    
    if (error.config?.headers) {
      console.error('Request Headers:', error.config.headers);
    }
    console.groupEnd();

    // Authentication errors
    if (error.response?.status === 401) {
      console.warn('🔒 Authentication error: User session may have expired');
      
      // Emit custom event for auth error (can be handled by auth context)
      const authErrorEvent = new CustomEvent('auth:error', { 
        detail: { status: 401, message: 'Session expired' }
      });
      window.dispatchEvent(authErrorEvent);
    }
    
    // Handle CORS errors specially since they're common in cross-origin auth
    if (error.message && error.message.includes('Network Error')) {
      console.error('🌐 CORS error detected - verify CORS configuration');
      console.error(`Frontend origin: ${window.location.origin}`);
      console.error(`API URL: ${config.apiUrl}`);
      console.error(`Expected CORS origin: https://hocomnia.com`);
      
      // Check if this might be a source map issue masking the real error
      if (error.config?.url?.includes('.map')) {
        console.warn('⚠️ This error may be related to source map loading, not the actual API call');
        error.userMessage = 'Source map loading error (this may not affect functionality)';
      } else {
        error.userMessage = 'Unable to connect to the server. Please check your connection and try again.';
      }
    }
    
    // Handle specific authentication flow errors
    if (error.response?.status === 403) {
      console.warn('🚫 Access forbidden - insufficient permissions');
      error.userMessage = 'Access denied. You may not have permission for this action.';
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('🔥 Server error detected');
      error.userMessage = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
