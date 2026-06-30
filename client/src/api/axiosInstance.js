import axios from 'axios';

/**
 * Single, shared Axios instance used by every service. Centralizing it here means
 * base URL, auth header injection and error normalization live in ONE place
 * instead of being repeated across the codebase.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

const TOKEN_KEY = 'flavorhub_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Request interceptor: attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: unwrap the consistent { success, data, message } envelope
// and surface a normalized error so callers get a predictable shape.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;

    // Auto-logout on 401 (expired/invalid token), except on the login attempt itself.
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      tokenStorage.clear();
    }

    return Promise.reject({
      status,
      message: payload?.message || error.message || 'Network error. Please try again.',
      errors: payload?.errors,
    });
  }
);

export default api;
