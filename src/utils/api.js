import axios from 'axios';
import { API_BASE_URL } from '../config.js';

const isDev = process.env.NODE_ENV === 'development';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';
    const isAdminOrAuthRequest = reqUrl.includes('/api/admin') || reqUrl.includes('/api/auth');

    if (status === 429 && isAdminOrAuthRequest) {
      const originalData = error.response?.data || {};
      error.response.data = {
        ...originalData,
        error: 'Rate limit reached, wait 15 min or retry.'
      };
    }

    if (isDev) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
