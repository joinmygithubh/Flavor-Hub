import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { Dish } from '../models/Dish.js';

/**
 * GET /api/users/me/favorites
 * Returns the authenticated user's favorited dishes (full dish docs, minus the
 * heavy reviews array). Silently drops any favorites whose dish was deleted.
 */
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    select: '-reviews',
  });
  sendSuccess(res, { data: user.favorites.filter(Boolean) });
});

/**
 * GET /api/users/me/favorites/ids
 * Lightweight list of favorited dish ids — used by the client to render the
 * heart toggle state across the catalogue without fetching full dishes.
 */
export const getFavoriteIds = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('favorites');
  sendSuccess(res, { data: user.favorites.map((id) => id.toString()) });
});

/**
 * POST /api/users/me/favorites/:dishId
 * Adds a dish to favorites (idempotent via $addToSet).
 */
export const addFavorite = asyncHandler(async (req, res) => {
  const { dishId } = req.params;

  const dish = await Dish.exists({ _id: dishId });
  if (!dish) throw new ApiError(404, 'Dish not found');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: dishId } },
    { new: true }
  ).select('favorites');

  sendSuccess(res, {
    statusCode: 201,
    message: 'Added to favorites',
    data: user.favorites.map((id) => id.toString()),
  });
});

/**
 * DELETE /api/users/me/favorites/:dishId
 * Removes a dish from favorites (idempotent via $pull).
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: req.params.dishId } },
    { new: true }
  ).select('favorites');

  sendSuccess(res, {
    message: 'Removed from favorites',
    data: user.favorites.map((id) => id.toString()),
  });
});
