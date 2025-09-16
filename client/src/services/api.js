import axios from 'axios';

const inferLocalApi = () => {
  try {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || 'localhost';
      // Prefer 5002 where backend is currently running
      return `http://${host}:5002/api`;
    }
  } catch (_) {}
  return 'http://localhost:5002/api';
};

// Prefer explicit env var in production; fall back to local inference
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || inferLocalApi();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Tenant API
export const tenantAPI = {
  create: (tenantData) => api.post('/tenants', tenantData),
  getAll: () => api.get('/tenants'),
  getById: (tenantId) => api.get(`/tenants/${tenantId}`),
  update: (tenantId, tenantData) => api.put(`/tenants/${tenantId}`, tenantData),
  getUsers: (tenantId) => api.get(`/tenants/${tenantId}/users`),
  createUser: (tenantId, userData) => api.post(`/tenants/${tenantId}/users`, userData),
};

// Sync API
export const syncAPI = {
  syncCustomers: (tenantId) => api.post(`/sync/${tenantId}/customers`),
  syncProducts: (tenantId) => api.post(`/sync/${tenantId}/products`),
  syncOrders: (tenantId) => api.post(`/sync/${tenantId}/orders`),
  fullSync: (tenantId) => api.post(`/sync/${tenantId}/full`),
  getStatus: (tenantId) => api.get(`/sync/${tenantId}/status`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: (tenantId, params = {}) => 
    api.get(`/analytics/${tenantId}/dashboard`, { params }),
  getCustomerAnalytics: (tenantId, params = {}) => 
    api.get(`/analytics/${tenantId}/customers`, { params }),
  getOrderAnalytics: (tenantId, params = {}) => 
    api.get(`/analytics/${tenantId}/orders`, { params }),
  getProductAnalytics: (tenantId, params = {}) => 
    api.get(`/analytics/${tenantId}/products`, { params }),
};

export default api;
