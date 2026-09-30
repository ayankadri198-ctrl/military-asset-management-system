import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('mams_api_url')) {
    return window.localStorage.getItem('mams_api_url');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  return 'https://mams-defense-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token and ensure baseURL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('mams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('mams_token');
      localStorage.removeItem('mams_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/auth') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
