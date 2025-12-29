const express = require('express');
const pool = require('../connection');
const router = express.Router();
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { createResetToken, validateResetToken, markTokenAsUsed, invalidateUserTokens } = require('../utils/passwordReset');
const { sendPasswordResetEmail } = require('../services/email.service');

// Rate limiting for password reset requests
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour per IP
  message: { error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset attempts by email
const passwordResetEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour per email
  keyGenerator: (req) => req.body.email || req.ip,
  message: { error: 'Too many password reset requests for this email. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot password endpoint
router.post('/forgot-password', passwordResetLimiter, passwordResetEmailLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if user exists (don't reveal if email doesn't exist - security)
    const userQuery = 'SELECT id, email FROM users WHERE email = ?';
    const [users] = await pool.query(userQuery, [email]);

    // Always return success message to prevent email enumeration
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = users[0];

    // Invalidate any existing tokens for this user
    await invalidateUserTokens(user.id);

    // Generate and store reset token
    const resetToken = await createResetToken(user.id);

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't reveal email sending failure to user for security
    }

    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'An error occurred processing your request' });
  }
});

// Verify reset token endpoint
router.get('/verify-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' });
  }

  try {
    const tokenRecord = await validateResetToken(token);

    if (!tokenRecord) {
      return res.status(200).json({
        valid: false,
        message: 'Invalid or expired token'
      });
    }

    return res.status(200).json({
      valid: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({ valid: false, error: 'An error occurred verifying the token' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  // Validate password requirements (match registration requirements)
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Check for at least one number, one uppercase, one lowercase, and one special character
  const hasNumber = /\d/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword);

  if (!hasNumber || !hasUpper || !hasLower || !hasSpecial) {
    return res.status(400).json({
      error: 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'
    });
  }

  try {
    // Validate token
    const tokenRecord = await validateResetToken(token);

    if (!tokenRecord) {
      return res.status(400).json({
        error: 'Invalid or expired token. Please request a new password reset.'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    await pool.query(updateQuery, [hashedPassword, tokenRecord.user_id]);

    // Mark token as used
    await markTokenAsUsed(token);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'An error occurred resetting your password' });
  }
});

module.exports = router;

