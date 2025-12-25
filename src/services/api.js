/**
 * API Service - Axios instance for API calls
 * This provides a centralized axios instance with base configuration
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with default config
// API_BASE_URL already includes /v1, so endpoints should not include /v1
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token if available
api.interceptors.request.use(
  async (config) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userData = await AsyncStorage.getItem('luna_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        const token = parsed.token || parsed.access_token || parsed.data?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('API Error: No response received', error.request);
    } else {
      // Error setting up request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

