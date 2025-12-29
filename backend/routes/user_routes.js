
const express = require('express');
const pool = require('../connection.js');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/get_all_locations', authenticateToken, async (req, res) => {
  try {
    const query = "SELECT id, name FROM locations";
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/get_user_data', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const query = `SELECT u.username, u.email, uf.first_name, uf.last_name, uf.phone 
                    FROM users u
                    LEFT JOIN user_features uf ON u.id = uf.user_id
                    WHERE u.id = ?
`;

    const [results] = await pool.query(query, [userId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/game_sign_up', authenticateToken, async (req, res) => {
  const { selected_game } = req.body;
  const user_id = req.user.userId;
  
  if (!selected_game) {
    return res.status(400).json({ 
      error: 'Selected game is required' 
    });
  }

  try {
    // First, get the location_id from the selected game
    const gameQuery = `
      SELECT l.id as location_id 
      FROM locations l 
      JOIN games g ON l.id = g.location_id 
      WHERE g.id = ?
    `;
    const [gameResults] = await pool.query(gameQuery, [selected_game]);
    
    if (gameResults.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const location_id = gameResults[0].location_id;

    // Check if user is already signed up for ANY game
    const checkQuery = `
      SELECT ugs.user_id, g.id as game_id, l.name as location_name, g.game_day, g.start_time
      FROM user_game_signups ugs
      JOIN games g ON ugs.game_id = g.id
      JOIN locations l ON g.location_id = l.id
      WHERE ugs.user_id = ?
    `;
    const [existingSignup] = await pool.query(checkQuery, [user_id]);
    
    if (existingSignup.length > 0) {
      const currentGame = existingSignup[0];
      return res.status(409).json({ 
        error: 'You are already signed up for a game',
        currentGame: {
          game_id: currentGame.game_id,
          location_name: currentGame.location_name,
          game_day: currentGame.game_day,
          start_time: currentGame.start_time
        },
        message: `You are already signed up for ${currentGame.location_name} on ${currentGame.game_day} at ${currentGame.start_time}. Please delete your current signup before signing up for another game.`
      });
    }

    // Insert the game signup into user_game_signups table
    const insertQuery = `
      INSERT INTO user_game_signups (user_id, game_id, location_id, signup_time) 
      VALUES (?, ?, ?, NOW())
    `;
    const [result] = await pool.query(insertQuery, [user_id, selected_game, location_id]);
    
    res.status(201).json({
      success: true,
      message: 'Successfully signed up for the game',
      game_signup_id: result.insertId
    });

  } catch (error) {
    console.error('Game signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

router.get('/get_game_details/:gameId', authenticateToken, async (req, res) => {
  const { gameId } = req.params;
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  try {
    const query = `
      SELECT g.id as game_id, g.location_id, l.name as location_name, 
             l.address, g.game_day, g.start_time, g.notes
      FROM games g
      JOIN locations l ON g.location_id = l.id
      WHERE g.id = ?
    `;
    
    const [results] = await pool.query(query, [gameId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get game details error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

router.get('/get_player_signups/:gameId', authenticateToken, async (req, res) => {
  const { gameId } = req.params;
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  try {
    const query = `
      SELECT ugs.user_id, u.username, uf.first_name, uf.last_name, ugs.signup_time
      FROM user_game_signups ugs
      JOIN users u ON ugs.user_id = u.id
      LEFT JOIN user_features uf ON u.id = uf.user_id
      WHERE ugs.game_id = ?
      ORDER BY ugs.signup_time ASC
    `;
    
    const [results] = await pool.query(query, [gameId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Get player signups error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get user's current game signup
router.get('/get_user_current_game/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const query = `
      SELECT ugs.user_id, ugs.game_id, ugs.signup_time,
             g.game_day, g.start_time, g.notes,
             l.id as location_id, l.name as location_name, l.address
      FROM user_game_signups ugs
      JOIN games g ON ugs.game_id = g.id
      JOIN locations l ON g.location_id = l.id
      WHERE ugs.user_id = ?
    `;
    
    const [results] = await pool.query(query, [userId]);
    
    if (results.length === 0) {
      return res.status(200).json({ 
        hasSignup: false,
        message: 'User has not signed up for any game'
      });
    }
    
    res.status(200).json({
      hasSignup: true,
      game: results[0]
    });
  } catch (error) {
    console.error('Get user current game error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Delete game signup
router.delete('/delete_game_signup', authenticateToken, async (req, res) => {
  const { user_id, game_id } = req.body;
  
  if (!user_id || !game_id) {
    return res.status(400).json({ 
      error: 'User ID and Game ID are required' 
    });
  }

  try {
    // Check if user is signed up for this game
    const checkQuery = `
      SELECT user_id FROM user_game_signups 
      WHERE user_id = ? AND game_id = ?
    `;
    const [existingSignup] = await pool.query(checkQuery, [user_id, game_id]);
    
    if (existingSignup.length === 0) {
      return res.status(404).json({ 
        error: 'User is not signed up for this game' 
      });
    }

    // Delete the signup
    const deleteQuery = `
      DELETE FROM user_game_signups 
      WHERE user_id = ? AND game_id = ?
    `;
    await pool.query(deleteQuery, [user_id, game_id]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Successfully removed from game signup' 
    });
  } catch (error) {
    console.error('Delete game signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all locations with their games for a specific day
router.get('/get_locations_with_games/:day', authenticateToken, async (req, res) => {
  const { day } = req.params;
  
  try {
    const query = `
      SELECT l.id as location_id, l.name as location_name, l.address,
             g.id as game_id, g.game_day, g.start_time, g.notes
      FROM locations l
      JOIN games g ON l.id = g.location_id
      WHERE g.game_day = ?
      ORDER BY l.name, g.start_time
    `;
    
    const [results] = await pool.query(query, [day]);
    
    // Group by location
    const groupedResults = results.reduce((acc, game) => {
      const locationId = game.location_id;
      if (!acc[locationId]) {
        acc[locationId] = {
          id: game.location_id,
          name: game.location_name,
          address: game.address,
          games: []
        };
      }
      acc[locationId].games.push({
        game_id: game.game_id,
        game_day: game.game_day,
        start_time: game.start_time,
        notes: game.notes
      });
      return acc;
    }, {});
    
    res.status(200).json(Object.values(groupedResults));
  } catch (error) {
    console.error('Get locations with games error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all player signups from all games
router.get('/get_all_player_signups', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT ugs.user_id, u.username, uf.first_name, uf.last_name, ugs.signup_time,
             g.id as game_id, l.name as location_name, g.game_day, g.start_time
      FROM user_game_signups ugs
      JOIN users u ON ugs.user_id = u.id
      LEFT JOIN user_features uf ON u.id = uf.user_id
      JOIN games g ON ugs.game_id = g.id
      JOIN locations l ON g.location_id = l.id
      ORDER BY ugs.signup_time ASC
    `;
    
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Get all player signups error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Update user profile
router.put('/update_profile', authenticateToken, async (req, res) => {
  const { email, screenName, firstName, lastName, phone } = req.body;
  const user_id = req.user.userId;

  try {
    // Check if email is being changed and if it already exists
    if (email) {
      const emailCheckQuery = `
        SELECT id FROM users 
        WHERE email = ? AND id != ?
      `;
      const [emailResults] = await pool.query(emailCheckQuery, [email, user_id]);
      
      if (emailResults.length > 0) {
        return res.status(409).json({ 
          error: 'Email address is already in use by another account' 
        });
      }
    }

    // Check if screen name is being changed and if it already exists
    if (screenName) {
      const usernameCheckQuery = `
        SELECT id FROM users 
        WHERE username = ? AND id != ?
      `;
      const [usernameResults] = await pool.query(usernameCheckQuery, [screenName, user_id]);
      
      if (usernameResults.length > 0) {
        return res.status(409).json({ 
          error: 'Screen name is already in use by another account' 
        });
      }
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update users table
      if (email || screenName) {
        const updateUsersQuery = `
          UPDATE users 
          SET ${email ? 'email = ?' : ''}${email && screenName ? ', ' : ''}${screenName ? 'username = ?' : ''}
          WHERE id = ?
        `;
        
        const updateParams = [];
        if (email) updateParams.push(email);
        if (screenName) updateParams.push(screenName);
        updateParams.push(user_id);
        
        await pool.query(updateUsersQuery, updateParams);
      }

      // Update or insert user_features table
      const checkFeaturesQuery = `
        SELECT user_id FROM user_features WHERE user_id = ?
      `;
      const [featuresExist] = await pool.query(checkFeaturesQuery, [user_id]);

      if (featuresExist.length > 0) {
        // Update existing user_features
        const updateFeaturesQuery = `
          UPDATE user_features 
          SET ${firstName ? 'first_name = ?' : ''}${firstName && lastName ? ', ' : ''}${lastName ? 'last_name = ?' : ''}${(firstName || lastName) && phone ? ', ' : ''}${phone ? 'phone = ?' : ''}
          WHERE user_id = ?
        `;
        
        const updateFeaturesParams = [];
        if (firstName) updateFeaturesParams.push(firstName);
        if (lastName) updateFeaturesParams.push(lastName);
        if (phone) updateFeaturesParams.push(phone);
        updateFeaturesParams.push(user_id);
        
        await pool.query(updateFeaturesQuery, updateFeaturesParams);
      } else {
        // Insert new user_features record with default role
        const insertFeaturesQuery = `
          INSERT INTO user_features (user_id, first_name, last_name, phone, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(insertFeaturesQuery, [user_id, firstName || null, lastName || null, phone || null, 'player']);
      }

      // Commit transaction
      await pool.query('COMMIT');

      res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully' 
      });

    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get user role
router.get('/get_user_role/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ 
      error: 'User ID is required' 
    });
  }

  try {
    const query = `
      SELECT uf.role 
      FROM user_features uf
      WHERE uf.user_id = ?
    `;
    const [results] = await pool.query(query, [userId]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.status(200).json({ role: results[0].role });
  } catch (error) {
    console.error('Get user role error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all available roles
router.get('/get_all_roles', authenticateToken, async (req, res) => {
  try {
    const roles = [
      { id: 'player', name: 'player' },
      { id: 'dealer', name: 'dealer' },
      { id: 'admin', name: 'admin' }
    ];
    res.status(200).json(roles);
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Update user role
router.put('/update_user_role', authenticateToken, async (req, res) => {
  const { user_id, role } = req.body;
  
  if (!user_id || !role) {
    return res.status(400).json({ 
      error: 'User ID and role are required' 
    });
  }

  // Validate role
  const validRoles = ['player', 'dealer', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      error: 'Invalid role. Must be one of: player, dealer, admin' 
    });
  }

  try {
    // Check if user exists
    const checkQuery = `SELECT id FROM users WHERE id = ?`;
    const [existing] = await pool.query(checkQuery, [user_id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Get role_id from role name
    const roleQuery = 'SELECT id FROM roles WHERE name = ?';
    const [roleResult] = await pool.query(roleQuery, [role]);
    
    if (roleResult.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid role name' 
      });
    }
    
    const roleId = roleResult[0].id;

    // Update user role in user_features table
    const updateQuery = `
      UPDATE user_features 
      SET role_id = ? 
      WHERE user_id = ?
    `;
    await pool.query(updateQuery, [roleId, user_id]);
    
    res.status(200).json({ 
      success: true, 
      message: 'User role updated successfully' 
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Change user password
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      error: 'Current password and new password are required' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      error: 'New password must be at least 6 characters long' 
    });
  }

  try {
    // Get user from session/token (you'll need to implement proper authentication)
    // For now, we'll assume the user ID is passed in the request
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Get current user's hashed password
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const user = users[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

module.exports = router;