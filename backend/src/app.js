// app.js — Assembles the Express app (does not open the port yet).

const express = require('express');
const cors = require('cors');

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

module.exports = app;
