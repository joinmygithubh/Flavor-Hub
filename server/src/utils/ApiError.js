/**
 * Operational error with an attached HTTP status code.
 * Throw this anywhere in the app to produce a predictable error response.
 *
 *   throw new ApiError(404, 'Dish not found');
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    // Marks errors we intentionally throw vs. unexpected programmer errors.
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
