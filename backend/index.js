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
const venue_routes = require('./routes/venue_routes');

app.use('/login_routes', login_routes); 
app.use('/register_routes', register_routes);
app.use('/user_routes', user_routes);
app.use('/venue_routes', venue_routes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;