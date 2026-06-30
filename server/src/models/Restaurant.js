import mongoose from 'mongoose';

/**
 * A Restaurant groups dishes under a vendor. Dishes reference a restaurant so the
 * UI can show "from <restaurant>" and we can extend toward multi-vendor later.
 */
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cuisines: [{ type: String }],
    image: String,
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    deliveryFee: { type: Number, default: 0 },
    address: {
      city: String,
      area: String,
    },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
