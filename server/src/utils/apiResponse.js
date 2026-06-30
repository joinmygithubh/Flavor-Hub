/**
 * Helpers that enforce a single, consistent API response shape across the app:
 *   { success: boolean, data: any, message: string, meta?: object }
 *
 * Controllers should always send through these so clients can rely on the shape.
 */
export const sendSuccess = (res, { statusCode = 200, data = null, message = 'OK', meta } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const sendError = (res, { statusCode = 500, message = 'Something went wrong', details } = {}) => {
  const body = { success: false, message, data: null };
  if (details) body.errors = details;
  return res.status(statusCode).json(body);
};
