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
const auth_routes = require('./routes/auth_routes');
const user_routes = require('./routes/user_routes');
const venue_game_routes = require('./routes/venue_game_routes');
const admin_routes = require('./routes/admin_routes');
const verification_routes = require('./routes/verification_routes');

app.use('/api/auth', login_routes); 
app.use('/api/auth', register_routes);
app.use('/api/auth', verification_routes);
app.use('/api/auth', auth_routes);
app.use('/api/users', user_routes);
app.use('/api/venues', venue_game_routes);
app.use('/api/admin', admin_routes);

// Add a simple root route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running!' });
  });

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
