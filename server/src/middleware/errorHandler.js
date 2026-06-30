import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * 404 handler for unmatched routes. Placed after all routes.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized error-handling middleware. Normalizes a variety of error types
 * (our ApiError, Zod validation, Mongoose cast/validation/duplicate-key) into
 * the consistent { success, message, data } response shape.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details;

  // Zod request validation failures.
  if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // Invalid ObjectId, e.g. /api/dishes/not-an-id
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose schema validation.
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Duplicate key (e.g. email already registered).
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists`;
  }

  // JWT errors.
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  if (statusCode >= 500) {
    // Log unexpected errors with stack for observability.
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  return sendError(res, {
    statusCode,
    message,
    details: details || (env.isProd ? undefined : err.details),
  });
};
