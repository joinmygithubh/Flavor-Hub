import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Payment abstraction layer.
 *
 * This project ships with a self-contained MOCK gateway that mimics the
 * create-order / verify-signature handshake used by Stripe (PaymentIntents) and
 * Razorpay (Orders). It runs with zero external accounts so the app is fully
 * demoable, while keeping a clean seam to drop in a real provider:
 *
 *   - createPaymentSession(): like stripe.paymentIntents.create / razorpay.orders.create
 *   - verifyPayment():        like verifying a Razorpay signature / Stripe webhook
 *
 * To go live: set PAYMENT_PROVIDER=stripe|razorpay and implement those branches
 * using the official SDK + keys from env. The controllers/UI contract stays the same.
 */

const MOCK_SECRET = env.jwtSecret; // reuse a server-side secret for HMAC signing

/**
 * Create a payment session/intent for a given amount (in the smallest unit handled
 * by the UI — here we keep it in whole currency units for clarity).
 * Returns the data the frontend needs to "open" the (mock) checkout.
 */
export const createPaymentSession = async ({ amount, currency = 'USD', receipt }) => {
  if (env.paymentProvider !== 'mock') {
    throw new Error(`Payment provider "${env.paymentProvider}" is not implemented. Use the mock provider or add an SDK integration in paymentService.js.`);
  }

  const orderId = `mock_order_${crypto.randomUUID()}`;
  return {
    provider: 'mock',
    orderId,
    amount,
    currency,
    receipt,
    // The client uses this key to render a fake checkout widget.
    publishableKey: 'mock_pk_test',
    createdAt: new Date().toISOString(),
  };
};

/**
 * Deterministically computes the signature the client should return after a
 * successful mock payment. Mirrors Razorpay's HMAC(order_id|payment_id, secret).
 */
export const computeMockSignature = (orderId, paymentId) =>
  crypto.createHmac('sha256', MOCK_SECRET).update(`${orderId}|${paymentId}`).digest('hex');

/**
 * Verify a payment after the client completes (mock) checkout. Returns
 * { verified, paymentRef }. In a real integration this validates a provider
 * signature or fetches the PaymentIntent status server-side.
 */
export const verifyPayment = async ({ orderId, paymentId, signature }) => {
  if (env.paymentProvider !== 'mock') {
    throw new Error(`Payment provider "${env.paymentProvider}" is not implemented.`);
  }

  if (!orderId || !paymentId || !signature) {
    return { verified: false };
  }

  const expected = computeMockSignature(orderId, paymentId);
  // Constant-time comparison to avoid timing attacks.
  const verified =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  return { verified, paymentRef: verified ? paymentId : undefined };
};
