import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { signAuthToken } from '../services/tokenService.js';

/**
 * POST /api/auth/signup
 * Registers a new user and returns a JWT + the public user profile.
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with that email already exists');

  const user = await User.create({ name, email, password });
  const token = signAuthToken(user);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: { token, user: user.toJSON() },
  });
});

/**
 * POST /api/auth/login
 * Authenticates a user via email + password.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select the password since it's `select: false` on the schema.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    // Same message for both cases to avoid user enumeration.
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signAuthToken(user);
  sendSuccess(res, {
    message: 'Logged in successfully',
    data: { token, user: user.toJSON() },
  });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user } });
});

/**
 * PUT /api/auth/me
 * Updates the authenticated user's name and/or saved addresses.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const { name, addresses } = req.body;
  if (name !== undefined) req.user.name = name;
  if (addresses !== undefined) req.user.addresses = addresses;
  await req.user.save();
  sendSuccess(res, { message: 'Profile updated', data: { user: req.user } });
});
