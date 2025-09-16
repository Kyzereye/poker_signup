// login_routes.js
const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  console.log("In the login route of the local machine");
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
      SELECT u.*, uf.first_name, uf.last_name, uf.phone, uf.role 
      FROM users u 
      LEFT JOIN user_features uf ON u.id = uf.user_id 
      WHERE u.email = ?
    `;
    const [results] = await pool.query(query, [email]);

   if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user_data = {
      "id": results[0].id, 
      "username": results[0].username, 
      "email": email,
      "role": results[0].role,
      "first_name": results[0].first_name,
      "last_name": results[0].last_name,
      "phone": results[0].phone
    }
    const is_valid_password = await bcrypt.compare(password, results[0].password);

    if (!is_valid_password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({ success: true, user_data: user_data });
  } catch (error) {
    console.error("Error in query:", error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;
