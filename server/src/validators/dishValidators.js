import { z } from 'zod';
import { CUISINES } from '../models/Dish.js';

// Query params arrive as strings; we coerce/validate them here.
export const listDishesQuerySchema = z.object({
  cuisine: z.enum(CUISINES).optional(),
  search: z.string().trim().max(100).optional(),
  isVeg: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(['rating', 'price_asc', 'price_desc', 'prep', 'newest']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

const addOnSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0).default(0),
});

export const createDishSchema = z.object({
  name: z.string().trim().min(2).max(120),
  cuisine: z.enum(CUISINES),
  description: z.string().max(2000).optional().default(''),
  price: z.number().min(0),
  image: z.string().url('Image must be a valid URL'),
  rating: z.number().min(0).max(5).optional(),
  isVeg: z.boolean().optional().default(false),
  prepTime: z.number().int().min(1).max(180).optional().default(20),
  tags: z.array(z.string()).optional().default([]),
  spiceLevels: z.array(z.string()).optional(),
  addOns: z.array(addOnSchema).optional().default([]),
  ingredients: z.array(z.string()).optional().default([]),
});

// All fields optional for partial updates (PATCH-style PUT).
export const updateDishSchema = createDishSchema.partial();

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().default(''),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
});

export const dishIdParamSchema = z.object({
  dishId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid dish id'),
});
