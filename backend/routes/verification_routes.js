const express = require('express');
const pool = require('../connection.js');
const emailService = require('../services/emailService');
const router = express.Router();

// Verify email with token
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Verification token is required'
    });
  }

  try {
    // Find user with this token and check if it's not expired
    const query = `
      SELECT id, email, email_verified, verification_token_expires 
      FROM users 
      WHERE verification_token = ? 
      AND verification_token_expires > NOW()
    `;
    
    const [results] = await pool.query(query, [token]);

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    const user = results[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email address is already verified'
      });
    }

    // Update user to verified and clear token
    const updateQuery = `
      UPDATE users 
      SET email_verified = true, 
          verification_token = NULL, 
          verification_token_expires = NULL 
      WHERE id = ?
    `;
    
    await pool.query(updateQuery, [user.id]);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email address is required'
    });
  }

  try {
    // Check if user exists and is not verified
    const checkQuery = `
      SELECT u.id, u.email, u.email_verified, uf.first_name 
      FROM users u 
      LEFT JOIN user_features uf ON u.id = uf.user_id 
      WHERE u.email = ?
    `;
    
    const [results] = await pool.query(checkQuery, [email]);

    if (results.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If the email address exists and is unverified, a new verification email has been sent'
      });
    }

    const user = results[0];

    // If already verified, don't reveal this
    if (user.email_verified) {
      return res.status(200).json({
        success: true,
        message: 'If the email address exists and is unverified, a new verification email has been sent'
      });
    }

    // Generate new token and expiration
    const verificationToken = emailService.generateVerificationToken();
    const tokenExpiration = emailService.generateTokenExpiration();

    // Update user with new token
    const updateQuery = `
      UPDATE users 
      SET verification_token = ?, 
          verification_token_expires = ? 
      WHERE id = ?
    `;
    
    await pool.query(updateQuery, [verificationToken, tokenExpiration, user.id]);

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      user.email, 
      user.first_name, 
      verificationToken
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If the email address exists and is unverified, a new verification email has been sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check verification status (for frontend to check if user needs verification)
router.post('/check-verification-status', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email address is required'
    });
  }

  try {
    const query = `
      SELECT email_verified, verification_token_expires 
      FROM users 
      WHERE email = ?
    `;
    
    const [results] = await pool.query(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = results[0];
    const hasExpiredToken = user.verification_token_expires && new Date(user.verification_token_expires) <= new Date();

    res.status(200).json({
      success: true,
      email_verified: user.email_verified,
      has_pending_verification: !user.email_verified && !hasExpiredToken,
      token_expired: hasExpiredToken
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
