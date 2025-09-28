const express = require('express');
const router = express.Router();
const pool = require('../connection');
const bcrypt = require('bcryptjs');
const PasswordResetService = require('../services/passwordResetService');

const passwordResetService = new PasswordResetService();

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userQuery = 'SELECT id, email FROM users WHERE email = ?';
    const [users] = await pool.query(userQuery, [email]);

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        success: true, 
        message: 'If the email address exists, a password reset link has been sent.' 
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = passwordResetService.generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database
    const updateQuery = `
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires = ? 
      WHERE id = ?
    `;
    await pool.query(updateQuery, [resetToken, resetExpires, user.id]);

    // Send password reset email
    const emailResult = await passwordResetService.sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'If the email address exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Verify password reset token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    // Check if token exists and is not expired
    const tokenQuery = `
      SELECT id, email, password_reset_expires 
      FROM users 
      WHERE password_reset_token = ? AND password_reset_expires > NOW()
    `;
    const [users] = await pool.query(tokenQuery, [token]);

    if (users.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    const user = users[0];

    res.status(200).json({ 
      success: true, 
      email: user.email,
      message: 'Reset token is valid' 
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if token exists and is not expired
    const tokenQuery = `
      SELECT id, email, password_reset_expires 
      FROM users 
      WHERE password_reset_token = ? AND password_reset_expires > NOW()
    `;
    const [users] = await pool.query(tokenQuery, [token]);

    if (users.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    const user = users[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    const updateQuery = `
      UPDATE users 
      SET password = ?, password_reset_token = NULL, password_reset_expires = NULL 
      WHERE id = ?
    `;
    await pool.query(updateQuery, [hashedPassword, user.id]);

    res.status(200).json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
