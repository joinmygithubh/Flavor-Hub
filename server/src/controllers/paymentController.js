import crypto from 'crypto';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildOrderPricing } from '../utils/pricing.js';
import {
  createPaymentSession,
  verifyPayment,
  computeMockSignature,
} from '../services/paymentService.js';

/**
 * POST /api/payments/create   (auth required)
 *
 * Creates a payment session/intent for the current cart. Totals are computed
 * server-side from the DB so the charged amount cannot be tampered with.
 * Returns the session the frontend uses to open the (mock) checkout widget.
 */
export const createPayment = asyncHandler(async (req, res) => {
  const pricing = await buildOrderPricing(req.body.items);

  const session = await createPaymentSession({
    amount: pricing.totalAmount,
    currency: 'USD',
    receipt: `rcpt_${Date.now()}`,
  });

  sendSuccess(res, {
    message: 'Payment session created',
    data: {
      ...session,
      amount: pricing.totalAmount,
      breakdown: {
        itemsTotal: pricing.itemsTotal,
        deliveryFee: pricing.deliveryFee,
        tax: pricing.tax,
      },
    },
  });
});

/**
 * POST /api/payments/mock-pay   (auth required)
 *
 * MOCK-ONLY helper that simulates the client-side gateway completing a payment.
 * In a real Stripe/Razorpay flow this is handled by the provider's hosted widget;
 * here it lets the frontend obtain a valid paymentId + signature for testing.
 *
 * Pass ?fail=true to simulate a failed/cancelled payment.
 */
export const mockPay = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const shouldFail = req.query.fail === 'true';

  if (shouldFail) {
    return sendSuccess(res, {
      message: 'Payment failed',
      data: { status: 'failed', orderId },
    });
  }

  const paymentId = `mock_pay_${crypto.randomUUID()}`;
  const signature = computeMockSignature(orderId, paymentId);

  sendSuccess(res, {
    message: 'Payment successful',
    data: { status: 'success', orderId, paymentId, signature },
  });
});

/**
 * POST /api/payments/verify   (auth required)
 *
 * Verifies a completed payment before the order is confirmed. Returns whether the
 * signature is valid; the client then calls POST /api/orders with the same payload.
 */
export const verifyPaymentController = asyncHandler(async (req, res) => {
  const result = await verifyPayment(req.body);
  sendSuccess(res, {
    message: result.verified ? 'Payment verified' : 'Payment verification failed',
    data: { verified: result.verified, paymentRef: result.paymentRef || null },
  });
});
