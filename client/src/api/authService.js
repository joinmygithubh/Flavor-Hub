import api from './axiosInstance.js';

/** Thin wrappers around the auth endpoints. Each returns the unwrapped `data`. */
export const authService = {
  signup: (payload) => api.post('/auth/signup', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (payload) => api.put('/auth/me', payload).then((r) => r.data),
};
