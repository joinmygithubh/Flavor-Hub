import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Dish } from '../models/Dish.js';

// Maps the API `sort` keyword to a Mongoose sort object.
const SORT_MAP = {
  rating: { rating: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  prep: { prepTime: 1 },
  newest: { createdAt: -1 },
};

/**
 * GET /api/dishes
 * Paginated, filterable, sortable dish listing.
 * Query: cuisine, search, isVeg, minPrice, maxPrice, minRating, sort, page, limit
 */
export const listDishes = asyncHandler(async (req, res) => {
  const { cuisine, search, isVeg, minPrice, maxPrice, minRating, sort, page, limit } =
    req.validatedQuery;

  const filter = { isAvailable: true };
  if (cuisine) filter.cuisine = cuisine;
  if (typeof isVeg === 'boolean') filter.isVeg = isVeg;
  if (minRating !== undefined) filter.rating = { $gte: minRating };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (search) {
    // Case-insensitive partial match on name (more forgiving than $text for UIs).
    filter.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  // Run the page query and the count in parallel for efficiency.
  const [dishes, total] = await Promise.all([
    Dish.find(filter)
      .select('-reviews') // keep list payloads lean; reviews load on detail page
      .sort(SORT_MAP[sort])
      .skip(skip)
      .limit(limit)
      .lean(),
    Dish.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: dishes,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  });
});

/**
 * GET /api/dishes/:id
 * Single dish with full details including reviews.
 */
export const getDishById = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id).populate('restaurant', 'name rating image');
  if (!dish) throw new ApiError(404, 'Dish not found');
  sendSuccess(res, { data: dish });
});

/**
 * GET /api/dishes/meta/cuisines
 * Returns the list of cuisines that currently have at least one dish.
 */
export const getCuisines = asyncHandler(async (req, res) => {
  const cuisines = await Dish.distinct('cuisine', { isAvailable: true });
  sendSuccess(res, { data: cuisines });
});

/**
 * POST /api/dishes/:id/reviews   (auth required)
 * Adds a review and recomputes the dish's average rating.
 */
export const addReview = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, 'Dish not found');

  const alreadyReviewed = dish.reviews.find(
    (r) => r.user && r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) throw new ApiError(409, 'You have already reviewed this dish');

  dish.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  // Recompute average rating from all reviews.
  dish.rating =
    dish.reviews.reduce((sum, r) => sum + r.rating, 0) / dish.reviews.length;

  await dish.save();
  sendSuccess(res, { statusCode: 201, message: 'Review added', data: dish });
});

/* -------------------------- Admin CRUD -------------------------- */

/**
 * POST /api/dishes   (admin)
 */
export const createDish = asyncHandler(async (req, res) => {
  const dish = await Dish.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Dish created', data: dish });
});

/**
 * PUT /api/dishes/:id   (admin)
 */
export const updateDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!dish) throw new ApiError(404, 'Dish not found');
  sendSuccess(res, { message: 'Dish updated', data: dish });
});

/**
 * DELETE /api/dishes/:id   (admin)
 */
export const deleteDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findByIdAndDelete(req.params.id);
  if (!dish) throw new ApiError(404, 'Dish not found');
  sendSuccess(res, { message: 'Dish deleted', data: { id: req.params.id } });
});
