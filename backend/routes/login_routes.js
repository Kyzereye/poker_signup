// login_routes.js
const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');

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
      return res.status(404).json({ error: 'Login credentials are incorrect' });
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

    return res.status(200).json({ success: true, user_data: user_data });
  } catch (error) {
    console.error("Error in query:", error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;

// http://kyzereyeemporium.com:3333/api/test