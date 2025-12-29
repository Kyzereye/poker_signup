const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '30m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate an access token for a user
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role (player, dealer, admin)
 * @returns {string} JWT access token
 */
function generateAccessToken(userId, email, role) {
  const payload = {
    userId,
    email,
    role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY
  });
}

/**
 * Generate a refresh token for a user
 * @param {number} userId - User ID
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(userId) {
  const payload = {
    userId,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.name = 'TokenExpiredError';
      throw err;
    } else if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.name = 'JsonWebTokenError';
      throw err;
    }
    throw error;
  }
}

/**
 * Decode a token without verification (for debugging/logging purposes only)
 * @param {string} token - JWT token to decode
 * @returns {object} Decoded token payload
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};

