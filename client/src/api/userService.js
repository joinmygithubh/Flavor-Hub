import api from './axiosInstance.js';

/** Favorites / wishlist endpoints. */
export const userService = {
  getFavorites: () => api.get('/users/me/favorites').then((r) => r.data),
  getFavoriteIds: () => api.get('/users/me/favorites/ids').then((r) => r.data),
  addFavorite: (dishId) => api.post(`/users/me/favorites/${dishId}`).then((r) => r.data),
  removeFavorite: (dishId) => api.delete(`/users/me/favorites/${dishId}`).then((r) => r.data),
};
