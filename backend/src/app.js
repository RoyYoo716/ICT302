// app.js — Assembles the Express app (does not open the port yet).

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Secure QR backend is running' });
});

// Feature routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/alert', require('./routes/alert'));
app.use('/api/admin', require('./routes/admin'));

// Static: Landing Page (Vite build copied into backend/landing-dist at deploy).
// Browser users arrive here via the redirect from GET /api/qr/verify.
app.use('/landing', express.static(path.join(__dirname, '../landing-dist')));

module.exports = app;