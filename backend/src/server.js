// server.js — Takes the assembled app and actually "opens the door".
// Opens the port and starts accepting requests.

require('dotenv/config');        // Load .env into environment variables
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
