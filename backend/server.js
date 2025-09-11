// server.js
require("dotenv").config();
const http = require('http');
const app = require('./index.js')
const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});