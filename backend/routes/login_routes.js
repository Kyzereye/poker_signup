// login_routes.js
const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const query = `
      SELECT u.*, uf.first_name, uf.last_name, uf.phone, r.name as role 
      FROM users u 
      LEFT JOIN user_features uf ON u.id = uf.user_id 
      LEFT JOIN roles r ON uf.role_id = r.id
      WHERE u.email = ?
    `;
    const [results] = await pool.query(query, [email]);

   if (results.length === 0) {
      return res.status(401).json({ error: 'Login credentials are incorrect' });
    }

    const user = results[0];
    const is_valid_password = await bcrypt.compare(password, user.password);

    if (!is_valid_password) {
      return res.status(401).json({ error: 'Login credentials are incorrect' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in. Check your email for a verification link.',
        requires_verification: true,
        email: email
      });
    }

    const user_data = {
      "id": user.id, 
      "username": user.username, 
      "email": email,
      "role": user.role,
      "first_name": user.first_name,
      "last_name": user.last_name,
      "phone": user.phone
    }

    // Generate tokens
    const accessToken = generateAccessToken(user_data.id, user_data.email, user_data.role);
    const refreshToken = generateRefreshToken(user_data.id);

    return res.status(200).json({ 
      success: true, 
      accessToken,
      refreshToken,
      user_data: user_data 
    });
  } catch (error) {
    console.error("Error in query:", error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const { verifyToken, generateAccessToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);

    // Ensure this is a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Get user info from database to ensure user still exists and get role
    const query = `
      SELECT u.id, u.email, uf.role 
      FROM users u 
      LEFT JOIN user_features uf ON u.id = uf.user_id 
      WHERE u.id = ?
    `;
    const [results] = await pool.query(query, [decoded.userId]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(results[0].id, results[0].email, results[0].role);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'An error occurred during token refresh' });
  }
});

module.exports = router;

// http://kyzereyeemporium.com:3333/api/test