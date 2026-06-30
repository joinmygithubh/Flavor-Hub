import api from './axiosInstance.js';

/**
 * Payment endpoints. The online flow is:
 *   1. createSession(items)        -> { orderId, amount, ... }
 *   2. mockPay(orderId, { fail })  -> { paymentId, signature }  (test gateway only)
 *   3. verify({ orderId, paymentId, signature }) -> { verified }
 *   4. POST /orders with the verified payment payload
 */
export const paymentService = {
  createSession: (items) => api.post('/payments/create', { items }).then((r) => r.data),
  mockPay: (orderId, { fail = false } = {}) =>
    api.post(`/payments/mock-pay${fail ? '?fail=true' : ''}`, { orderId }).then((r) => r.data),
  verify: (payload) => api.post('/payments/verify', payload).then((r) => r.data),
};
