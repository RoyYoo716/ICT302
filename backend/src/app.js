// app.js — Assembles the Express app (does not open the port yet).

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const { verifySecuritySession } = require('./middleware/SecurityAuth');

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Secure QR backend is running' });
});

// Feature routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/qr', verifySecuritySession, require('./routes/qr'));
app.use('/api/scans', verifySecuritySession, require('./routes/scan'));
app.use('/api/alert', verifySecuritySession, require('./routes/alert'));
app.use('/api/admin', verifySecuritySession, require('./routes/admin'));

// Static: Landing Page (Vite build copied into backend/landing-dist at deploy).
// Browser users arrive here via the redirect from GET /api/qr/verify.
app.use('/landing', express.static(path.join(__dirname, '../landing-dist')));
app.use(express.static(path.join(__dirname, '../admin-dist')));

// SPA fallback: any non-API, non-file route serves the admin app's
// index.html so react-router deep links survive a page refresh.
// (Middleware instead of app.get('*') — Express 5 changed wildcard syntax.)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/landing')) {
    return next(); // let API 404s stay API 404s
  }
  res.sendFile(path.join(__dirname, '../admin-dist/index.html'));
});

module.exports = app;
