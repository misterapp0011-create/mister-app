import axios from 'axios';

const API_URL = 'https://mister-app-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mister_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize 401 handling: drop the stale token and let the app redirect to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mister_token');
      localStorage.removeItem('mister_user');
    }
    return Promise.reject(err);
  }
);
