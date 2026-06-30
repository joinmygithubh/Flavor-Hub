/**
 * Generic request-validation middleware factory backed by Zod.
 * Pass a schema describing any of body/query/params; on success the parsed
 * (and coerced) values replace the originals so controllers get clean data.
 *
 *   router.post('/', validate({ body: signupSchema }), controller);
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) {
      // req.query is a read-only getter in Express 5; assign parsed values to a
      // separate validated bag to stay compatible across versions.
      req.validatedQuery = schemas.query.parse(req.query);
    }
    if (schemas.params) req.params = schemas.params.parse(req.params);
    return next();
  } catch (err) {
    return next(err);
  }
};
