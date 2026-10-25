// Authorization helpers can be added here when the API gains role-based permissions.
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new Error('Forbidden'));
  return next();
};
