import ApiError from '../utils/ApiError.js';
export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({ field: issue.path.slice(1).join('.'), message: issue.message }));
      return next(new ApiError(400, 'Request validation failed', errors));
    }
    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.validatedParams = result.data.params;
    if (result.data.query) req.validatedQuery = result.data.query;
    return next();
  };
}
