import api from './axiosInstance.js';

/**
 * Dish catalogue endpoints. `listDishes` returns the full envelope so callers can
 * read both `data` (dishes) and `meta` (pagination).
 */
export const dishService = {
  listDishes: (params) => api.get('/dishes', { params }),
  getDish: (id) => api.get(`/dishes/${id}`).then((r) => r.data),
  getCuisines: () => api.get('/dishes/meta/cuisines').then((r) => r.data),
  addReview: (id, payload) => api.post(`/dishes/${id}/reviews`, payload).then((r) => r.data),

  // Admin
  createDish: (payload) => api.post('/dishes', payload).then((r) => r.data),
  updateDish: (id, payload) => api.put(`/dishes/${id}`, payload).then((r) => r.data),
  deleteDish: (id) => api.delete(`/dishes/${id}`).then((r) => r.data),
};
