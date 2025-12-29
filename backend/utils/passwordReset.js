const crypto = require('crypto');
const pool = require('../connection');

// Password reset token expiry time (1 hour)
const TOKEN_EXPIRY_HOURS = 1;

/**
 * Generate a secure random token
 * @returns {string} Random token string
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset token for a user
 * @param {number} userId - User ID
 * @returns {Promise<string>} The generated token
 */
async function createResetToken(userId) {
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  const query = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `;

  await pool.query(query, [userId, token, expiresAt]);
  return token;
}

/**
 * Validate a password reset token
 * @param {string} token - Reset token to validate
 * @returns {Promise<object|null>} Token record if valid, null otherwise
 */
async function validateResetToken(token) {
  const query = `
    SELECT prt.*, u.id as user_id, u.email
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = ? 
      AND prt.used = FALSE
      AND prt.expires_at > NOW()
  `;

  const [results] = await pool.query(query, [token]);

  if (results.length === 0) {
    return null;
  }

  return results[0];
}

/**
 * Mark a token as used
 * @param {string} token - Token to mark as used
 */
async function markTokenAsUsed(token) {
  const query = `
    UPDATE password_reset_tokens
    SET used = TRUE
    WHERE token = ?
  `;

  await pool.query(query, [token]);
}

/**
 * Clean up expired tokens (can be called by a scheduled job)
 * @returns {Promise<number>} Number of tokens deleted
 */
async function cleanupExpiredTokens() {
  const query = `
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() OR used = TRUE
  `;

  const [result] = await pool.query(query);
  return result.affectedRows;
}

/**
 * Invalidate all existing tokens for a user (when requesting new reset)
 * @param {number} userId - User ID
 */
async function invalidateUserTokens(userId) {
  const query = `
    UPDATE password_reset_tokens
    SET used = TRUE
    WHERE user_id = ? AND used = FALSE
  `;

  await pool.query(query, [userId]);
}

module.exports = {
  generateResetToken,
  createResetToken,
  validateResetToken,
  markTokenAsUsed,
  cleanupExpiredTokens,
  invalidateUserTokens
};

