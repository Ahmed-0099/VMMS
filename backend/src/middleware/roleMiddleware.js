const { createHttpError } = require("../utils/httpError");

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      next(createHttpError(401, "Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(createHttpError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}

module.exports = {
  requireRole,
};
