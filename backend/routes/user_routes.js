
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
  console.log("reqbody", req.body);
  const email = req.body.email
  console.log("email", email);
  try {
    const query = `SELECT u.screen_name, u.email, uf.first_name, uf.last_name, uf.phone 
                    FROM users u
                    LEFT JOIN user_features uf ON u.id = uf.user_id
                    WHERE u.email = ?
`;

    const [results] = await pool.query(query, [email]);
    console.log("results", results);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/game_sign_up', async (req, res) => {
  console.log(req.body)
});

module.exports = router;