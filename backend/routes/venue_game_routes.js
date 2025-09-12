const express = require('express');
const pool = require('../connection.js');
const router = express.Router();

// ===== VENUE/LOCATION ROUTES =====

// Get all locations/venues
router.get('/locations', async (req, res) => {
  try {
    const query = 'SELECT * FROM locations ORDER BY name ASC';
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get location by ID
router.get('/locations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM locations WHERE id = ?';
    const [results] = await pool.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Create new location
router.post('/locations', async (req, res) => {
  const { name, address } = req.body;
  
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }
  
  try {
    const query = 'INSERT INTO locations (name, address) VALUES (?, ?)';
    const [result] = await pool.query(query, [name, address]);
    
    res.status(201).json({ 
      success: true, 
      message: 'Location created successfully',
      locationId: result.insertId 
    });
  } catch (error) {
    console.error('Create location error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Location with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Update location
router.put('/locations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }
  
  try {
    // Check if location exists
    const checkQuery = 'SELECT id FROM locations WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const query = 'UPDATE locations SET name = ?, address = ? WHERE id = ?';
    await pool.query(query, [name, address, id]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Location updated successfully' 
    });
  } catch (error) {
    console.error('Update location error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Location with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Delete location
router.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if location has associated games
    const gamesQuery = 'SELECT COUNT(*) as gameCount FROM games WHERE location_id = ?';
    const [gamesResult] = await pool.query(gamesQuery, [id]);
    
    if (gamesResult[0].gameCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete location with associated games. Please delete games first.' 
      });
    }
    
    // Check if location exists
    const checkQuery = 'SELECT id FROM locations WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const query = 'DELETE FROM locations WHERE id = ?';
    await pool.query(query, [id]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Location deleted successfully' 
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ===== GAME ROUTES =====

// Get all games with location info
router.get('/games', async (req, res) => {
  try {
    const query = `
      SELECT 
        g.id,
        g.location_id,
        g.game_day,
        g.start_time,
        g.notes,
        l.name as location_name,
        l.address as location_address
      FROM games g
      LEFT JOIN locations l ON g.location_id = l.id
      ORDER BY g.game_day, g.start_time
    `;
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get game by ID
router.get('/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        g.id,
        g.location_id,
        g.game_day,
        g.start_time,
        g.notes,
        l.name as location_name,
        l.address as location_address
      FROM games g
      LEFT JOIN locations l ON g.location_id = l.id
      WHERE g.id = ?
    `;
    const [results] = await pool.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Create new game
router.post('/games', async (req, res) => {
  const { location_id, game_day, start_time, notes } = req.body;
  
  if (!location_id || !game_day || !start_time) {
    return res.status(400).json({ error: 'Location, game day, and start time are required' });
  }
  
  try {
    // Check if location exists
    const locationQuery = 'SELECT id FROM locations WHERE id = ?';
    const [locationResult] = await pool.query(locationQuery, [location_id]);
    
    if (locationResult.length === 0) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }
    
    const query = 'INSERT INTO games (location_id, game_day, start_time, notes) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [location_id, game_day, start_time, notes || null]);
    
    res.status(201).json({ 
      success: true, 
      message: 'Game created successfully',
      gameId: result.insertId 
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update game
router.put('/games/:id', async (req, res) => {
  const { id } = req.params;
  const { location_id, game_day, start_time, notes } = req.body;
  
  if (!location_id || !game_day || !start_time) {
    return res.status(400).json({ error: 'Location, game day, and start time are required' });
  }
  
  try {
    // Check if game exists
    const checkQuery = 'SELECT id FROM games WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if location exists
    const locationQuery = 'SELECT id FROM locations WHERE id = ?';
    const [locationResult] = await pool.query(locationQuery, [location_id]);
    
    if (locationResult.length === 0) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }
    
    const query = 'UPDATE games SET location_id = ?, game_day = ?, start_time = ?, notes = ? WHERE id = ?';
    await pool.query(query, [location_id, game_day, start_time, notes || null, id]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Game updated successfully' 
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete game
router.delete('/games/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if game has signups
    const signupsQuery = 'SELECT COUNT(*) as signupCount FROM user_game_signups WHERE game_id = ?';
    const [signupsResult] = await pool.query(signupsQuery, [id]);
    
    if (signupsResult[0].signupCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete game with active signups. Please remove signups first.' 
      });
    }
    
    // Check if game exists
    const checkQuery = 'SELECT id FROM games WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const query = 'DELETE FROM games WHERE id = ?';
    await pool.query(query, [id]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Game deleted successfully' 
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ===== LEGACY VENUE ROUTES (for backward compatibility) =====

// Get venue data with games (legacy endpoint from venue_routes.js)
router.post('/get_venue_data', async (req, res) => {
  const { venue_id } = req.body;

  if (!venue_id) {
    return res.status(400).json({ error: 'Venue ID is required' });
  }

  try {
    const query = `
      SELECT l.name, l.address, g.id AS game_id, g.game_day, g.start_time, g.notes
      FROM locations AS l
      JOIN games AS g ON l.id = g.location_id
      WHERE l.id = ?`;

    const [results] = await pool.query(query, [venue_id]);
    return res.status(200).json(results);

  } catch (error) {
    console.error("Error in get_venue_data query:", error);
    return res.status(500).json({ error: 'An error occurred while fetching venue data' });
  }
});

module.exports = router;
