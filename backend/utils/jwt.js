const jwt = require('jsonwebtoken');
const AppError = require('../middleware/AppError');

const jwtSecret = process.env.JWT_SECRET || 'change_this_secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

const signToken = (payload) => {
  if (!jwtSecret) {
    throw new AppError('JWT secret is not configured', 500);
  }
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

const verifyToken = (token) => {
  if (!jwtSecret) {
    throw new AppError('JWT secret is not configured', 500);
  }
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  signToken,
  verifyToken
};
