
const express = require('express');
const pool = require('../connection.js');
const router = express.Router();

router.get('/get_all_locations', async (req, res) => {
  try {
    const query = "SELECT id, name FROM locations";
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/get_user_data', async (req, res) => {
  const email = req.body.email
  try {
    const query = `SELECT u.username, u.email, uf.first_name, uf.last_name, uf.phone 
                    FROM users u
                    LEFT JOIN user_features uf ON u.id = uf.user_id
                    WHERE u.email = ?
`;

    const [results] = await pool.query(query, [email]);
    console.log("get_user_data results", results);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/game_sign_up', async (req, res) => {
  const { user_id, selected_game } = req.body;
  
  if (!user_id || !selected_game) {
    return res.status(400).json({ 
      error: 'User ID and selected game are required' 
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

    // Check if user is already signed up for this specific game
    const checkQuery = `
      SELECT user_id FROM user_game_signups 
      WHERE user_id = ? AND game_id = ?
    `;
    const [existingSignup] = await pool.query(checkQuery, [user_id, selected_game]);
    
    if (existingSignup.length > 0) {
      return res.status(409).json({ 
        error: 'User is already signed up for this game' 
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

router.get('/get_game_details/:gameId', async (req, res) => {
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

router.get('/get_player_signups/:gameId', async (req, res) => {
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

module.exports = router;