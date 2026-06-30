import mongoose from 'mongoose';

export const CUISINES = [
  'African',
  'Italian',
  'Indian',
  'Chinese',
  'Mexican',
  'Continental',
  'Thai',
  'Japanese',
  'Lebanese',
  'Fast Food',
];

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      maxlength: 120,
    },
    cuisine: {
      type: String,
      required: true,
      enum: CUISINES,
      index: true, // listing endpoint filters heavily on cuisine
    },
    description: { type: String, default: '', maxlength: 2000 },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    // We store an external image URL (Unsplash/Pexels) rather than binary uploads
    // to keep the backend lightweight, per the project spec.
    image: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    isVeg: { type: Boolean, default: false, index: true },
    prepTime: { type: Number, default: 20 }, // minutes
    tags: [{ type: String }],

    // Customization options surfaced on the dish detail page.
    spiceLevels: { type: [String], default: ['Mild', 'Medium', 'Hot'] },
    addOns: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, default: 0, min: 0 },
        },
      ],
      default: [],
    },
    ingredients: [{ type: String }],

    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    reviews: [reviewSchema],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index powers the search bar (name + description + tags).
dishSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Dish = mongoose.model('Dish', dishSchema);
