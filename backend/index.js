// index.js
const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const login_routes = require('./routes/login_routes');
const register_routes = require('./routes/register_routes');
const user_routes = require('./routes/user_routes');
const venue_game_routes = require('./routes/venue_game_routes');
const admin_routes = require('./routes/admin_routes');

app.use('/login_routes', login_routes); 
app.use('/register_routes', register_routes);
app.use('/user_routes', user_routes);
app.use('/venue_routes', venue_game_routes);
app.use('/admin_routes', admin_routes);
// Add a simple root route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Host Backend server is running!' });
  });

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
