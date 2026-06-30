import mongoose from 'mongoose';

export const ORDER_STATUSES = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
export const PAYMENT_METHODS = ['COD', 'Online'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

// Snapshot of a dish at purchase time so order history is stable even if the
// dish is later edited or deleted.
const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    spiceLevel: String,
    addOns: [{ name: String, price: Number }],
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order must contain at least one item'],
    },
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },
    // Reference to the (mock) payment provider transaction for reconciliation.
    paymentRef: { type: String },

    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Placed', index: true },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        at: { type: Date, default: Date.now },
      },
    ],

    deliveryAddress: { type: deliveryAddressSchema, required: true },
    estimatedDeliveryAt: { type: Date },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
