const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/user_registration', async (req, res) => {
  const { email, password, screen_name } = req.body;

  try {
    // Check if email or screen_name already exists
    const check_query = "SELECT email, screen_name FROM users WHERE email = ? OR screen_name = ?";
    const [existing_users] = await pool.query(check_query, [email, screen_name]);

    if (existing_users.length > 0) {
      let errors = [];
      if (existing_users.some(user => user.email === email)) {
        errors.push('Email already exists');
      }
      if (existing_users.some(user => user.screen_name === screen_name)) {
        errors.push('Screen name already exists');
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

    // Correct SQL syntax
    const insert_query = `
      INSERT INTO users 
        (email, crypted_password, salt, screen_name, created_at, updated_at) 
      VALUES 
        (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Execute insert with correct parameters
    const [result] = await pool.query(insert_query, [
      email,
      password_hash,
      salt,
      screen_name
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
