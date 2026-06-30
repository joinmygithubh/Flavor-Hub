import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from './asyncHandler.js';
import { User } from '../models/User.js';

/**
 * Extracts a Bearer token from the Authorization header.
 */
const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/**
 * `protect` requires a valid JWT and attaches the current user to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, 'Not authorized: no token provided');

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.sub).select('-password');
  if (!user) throw new ApiError(401, 'Not authorized: user no longer exists');

  req.user = user;
  next();
});

/**
 * `authorize('admin')` restricts a route to one or more roles. Must run after `protect`.
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }
  next();
};
