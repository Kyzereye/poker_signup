const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/user_registration', async (req, res) => {
  const { email, password, username } = req.body;
  console.log("reqbody", req.body);

  try {
    // Check if email or username already exists
    const check_query = "SELECT email, username FROM users WHERE email = ?";
    const [existing_users] = await pool.query(check_query, [email]);

    if (existing_users.length > 0) {
      let errors = [];
      if (existing_users.some(user => user.email === email)) {
        errors.push('Email already exists');
      }
      if (existing_users.some(user => user.username === username)) {
        errors.push('User name already exists');
      }
      if (errors.length > 0) {
        return res.status(409).json({
          success: false,
          errors: errors
        });
      }
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    console.log("username", username);
    const insert_query = `
      INSERT INTO users 
        (email, password, username) 
      VALUES 
        (?, ?, ?)
    `;

    // Execute insert with correct parameters
    const [result] = await pool.query(insert_query, [
      email,
      password_hash,
      username
    ]);

    // Return appropriate response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user_id: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});



// function generateSalt(length = 20) {
//   const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
//   let salt_result = '';
//   const character_length = characters.length;
//   for (let i = 0; i < length; i++) {
//     salt_result += characters.charAt(Math.floor(Math.random() * character_length))
//   }
//   return salt_result;
// }

module.exports = router;
