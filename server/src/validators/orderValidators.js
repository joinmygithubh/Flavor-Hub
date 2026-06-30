import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

const orderItemSchema = z.object({
  dish: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid dish id'),
  quantity: z.number().int().min(1).max(50),
  spiceLevel: z.string().optional(),
  addOns: z
    .array(z.object({ name: z.string(), price: z.number().min(0) }))
    .optional()
    .default([]),
});

const deliveryAddressSchema = z.object({
  street: z.string().trim().min(3, 'Street is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  zip: z.string().trim().min(3, 'ZIP/Postal code is required'),
  phone: z.string().trim().min(7, 'A valid phone number is required'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Your cart is empty'),
  paymentMethod: z.enum(['COD', 'Online']),
  deliveryAddress: deliveryAddressSchema,
  // Present only for online payments; verified server-side before confirming.
  payment: z
    .object({
      orderId: z.string(),
      paymentId: z.string(),
      signature: z.string(),
    })
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES),
});

export const createPaymentSessionSchema = z.object({
  items: z
    .array(
      z.object({
        dish: z.string().regex(/^[0-9a-fA-F]{24}$/),
        quantity: z.number().int().min(1),
        addOns: z.array(z.object({ name: z.string(), price: z.number().min(0) })).optional(),
      })
    )
    .min(1),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});
