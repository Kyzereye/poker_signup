// venue_routes.js
const express = require('express');
const pool = require('../connection.js');
const router = express.Router();

router.post('/get_venue_data', async (req, res) => {
  const { venue_id } = req.body;

  if (!venue_id) {
    return res.status(400).json({ error: 'Venue name is required' });
  }

  try {
    const query = `
    SELECT l.name, l.address, g.id AS game_id, g.game_day, g.start_time, g.notes
    FROM
      locations AS l
    JOIN
      games AS g ON l.id = g.location_id
    WHERE l.id = ?`;

    const [results] = await pool.query(query, [venue_id]);
    return res.status(200).json(results);


  } catch (error) {
    console.error("Error in query:", error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
})

module.exports = router;