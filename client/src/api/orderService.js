import api from './axiosInstance.js';

export const orderService = {
  createOrder: (payload) => api.post('/orders', payload).then((r) => r.data),
  getMyOrders: () => api.get('/orders/me').then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),

  // Admin
  getAllOrders: (params) => api.get('/orders', { params }),
  updateStatus: (id, orderStatus) =>
    api.patch(`/orders/${id}/status`, { orderStatus }).then((r) => r.data),
};
