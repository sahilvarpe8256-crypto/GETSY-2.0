/**
 * Middleware to restrict route access by user role(s).
 * Must be used after authMiddleware `protect`.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied. User role not found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. ${allowedRoles.join(' or ')} role required.`
      });
    }

    next();
  };
};

module.exports = { requireRole };
