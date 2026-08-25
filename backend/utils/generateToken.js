const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id, role }, secret, {
    expiresIn
  });
};

module.exports = generateToken;
