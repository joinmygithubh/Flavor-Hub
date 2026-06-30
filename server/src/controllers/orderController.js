import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Order } from '../models/Order.js';
import { buildOrderPricing } from '../utils/pricing.js';
import { verifyPayment } from '../services/paymentService.js';

const ESTIMATED_DELIVERY_MINUTES = 40;

/**
 * POST /api/orders   (auth required)
 *
 * Creates an order. Handles both payment flows:
 *  - COD:    paymentStatus = "Pending", order confirmed immediately.
 *  - Online: requires a verified payment payload; only then is the order created
 *            with paymentStatus = "Paid". A failed verification does NOT create a
 *            confirmed order, so the client can show a retry option.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, deliveryAddress, payment } = req.body;

  // Recompute prices/totals from the DB — never trust client-sent amounts.
  const pricing = await buildOrderPricing(items);

  let paymentStatus = 'Pending';
  let paymentRef;

  if (paymentMethod === 'Online') {
    if (!payment) {
      throw new ApiError(400, 'Payment details are required for online payments');
    }
    const result = await verifyPayment(payment);
    if (!result.verified) {
      // Surface a 402 so the client knows to offer a retry without a created order.
      throw new ApiError(402, 'Payment verification failed. Please try again.');
    }
    paymentStatus = 'Paid';
    paymentRef = result.paymentRef;
  }

  const order = await Order.create({
    user: req.user._id,
    items: pricing.items,
    itemsTotal: pricing.itemsTotal,
    deliveryFee: pricing.deliveryFee,
    tax: pricing.tax,
    totalAmount: pricing.totalAmount,
    paymentMethod,
    paymentStatus,
    paymentRef,
    orderStatus: 'Placed',
    statusHistory: [{ status: 'Placed', at: new Date() }],
    deliveryAddress,
    estimatedDeliveryAt: new Date(Date.now() + ESTIMATED_DELIVERY_MINUTES * 60 * 1000),
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Order placed successfully',
    data: order,
  });
});

/**
 * GET /api/orders/me   (auth required)
 * Order history for the authenticated user, newest first.
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { data: orders });
});

/**
 * GET /api/orders/:id   (auth required)
 * Single order. Users can only read their own orders; admins can read any.
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this order');
  }
  sendSuccess(res, { data: order });
});

/* -------------------------- Admin -------------------------- */

/**
 * GET /api/orders   (admin)
 * All orders with basic pagination.
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(),
  ]);

  sendSuccess(res, {
    data: orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * PATCH /api/orders/:id/status   (admin)
 * Advances/sets the order status and appends to status history.
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.orderStatus = req.body.orderStatus;
  order.statusHistory.push({ status: req.body.orderStatus, at: new Date() });

  // Mark COD orders paid once delivered.
  if (req.body.orderStatus === 'Delivered' && order.paymentMethod === 'COD') {
    order.paymentStatus = 'Paid';
  }

  await order.save();
  sendSuccess(res, { message: 'Order status updated', data: order });
});
