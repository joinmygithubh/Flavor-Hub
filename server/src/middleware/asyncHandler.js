/**
 * Wraps an async route handler so that any rejected promise is forwarded to
 * Express's error-handling middleware via `next`. This removes the need for a
 * try/catch block in every single controller.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
