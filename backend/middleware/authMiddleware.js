const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication token is missing' });
      }

      const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production';
      const decoded = jwt.verify(token, secret);

      // Retrieve user from DB, excluding passwordHash
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        return res.status(401).json({ error: 'User associated with token no longer exists' });
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Authentication token has expired' });
      }
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  }

  return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
};

module.exports = { protect };
