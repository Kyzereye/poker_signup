const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await pool.query(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    // Rename the destructured email property to avoid naming conflict
    const { email: user_email, crypted_password, salt, screen_name } = user;
    const is_valid_password = await bcrypt.compare(password, crypted_password);

    if (!is_valid_password) {
      return res.status(401).json({ message: 'Invalid password' })
    }
    return res.status(200).json({ success: true })


    // Return or use these values
    return { user_email, password, salt, screen_name };
  } catch (error) {
    console.error("Error in query:", error);
    throw error;
  }
});

router.post('/get_user_data', async (req, res) => {
  console.log("reqbody", req.body);
})

module.exports = router;
