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
    if (isDev) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
