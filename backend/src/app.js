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

// Static: Landing Page and Admin Frontend (pointing to root-level admin-web/dist)
app.use('/landing', express.static(path.join(__dirname, '../landing-dist')));
app.use(express.static(path.join(__dirname, '../../admin-web/dist')));

// SPA fallback: any non-API, non-file route serves the admin app's
// index.html so react-router deep links survive a page refresh.
// (Middleware instead of app.get('*') — Express 5 changed wildcard syntax.)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/landing')) {
    return next(); // let API 404s stay API 404s
  }
  res.sendFile(path.join(__dirname, '../../admin-web/dist/index.html'));
});

// Server listener (Missing from previous version, causing app to exit early without starting)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running successfully on port ${PORT}`);
  });
}

module.exports = app;
