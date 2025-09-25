const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');

router.post('/user_registration', async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  console.log("reqbody", req.body);

  try {
    // Check if email or username already exists
    const check_query = "SELECT email, username FROM users WHERE email = ? OR username = ?";
    const [existing_users] = await pool.query(check_query, [email, username]);

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

    // Generate verification token and expiration
    const verificationToken = emailService.generateVerificationToken();
    const tokenExpiration = emailService.generateTokenExpiration();

    console.log("username", username);
    const insert_user_query = `
      INSERT INTO users 
        (email, password, username, email_verified, verification_token, verification_token_expires) 
      VALUES 
        (?, ?, ?, ?, ?, ?)
    `;

    // Execute insert with correct parameters
    const [user_result] = await pool.query(insert_user_query, [
      email,
      password_hash,
      username,
      false, // email_verified starts as false
      verificationToken,
      tokenExpiration
    ]);

    const user_id = user_result.insertId;

    // Insert into user_features table
    const insert_features_query = `
      INSERT INTO user_features 
        (user_id, first_name, last_name, role) 
      VALUES 
        (?, ?, ?, ?)
    `;

    await pool.query(insert_features_query, [
      user_id,
      firstName,
      lastName,
      'player' // Default role for new users
    ]);

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      email, 
      firstName, 
      verificationToken
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Note: User is still created, but they'll need to request resend
    }

    // Return appropriate response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user_id: user_id,
      email_sent: emailResult.success
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database constraint violations
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('email')) {
        return res.status(409).json({
          success: false,
          errors: ['Email already exists']
        });
      } else if (error.sqlMessage.includes('username')) {
        return res.status(409).json({
          success: false,
          errors: ['User name already exists']
        });
      }
    }
    
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
