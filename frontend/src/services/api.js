import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables HTTP-only cookies transmission
  headers: {
    'Content-Type': 'application/json',
    // Never serve dashboard/auth data from browser cache (avoids 304s
    // with empty bodies on revalidation).
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  }
});

// Request interceptor to attach Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data
    };
    return Promise.reject(customError);
  }
);

export default api;
