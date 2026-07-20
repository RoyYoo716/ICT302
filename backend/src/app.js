// app.js — Assembles the Express app (does not open the port yet).

require('dotenv/config');
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

try {
  console.log("Initializing Express app...");
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server running successfully on port ${PORT}`);
    });
  }

} catch (err) {
  console.error("FATAL STARTUP EXCEPTION:", err);
  process.exit(1);
}

// Feature routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/qr', verifySecuritySession, require('./routes/qr'));
app.use('/api/scans', verifySecuritySession, require('./routes/scan'));
app.use('/api/alert', verifySecuritySession, require('./routes/alert'));
app.use('/api/admin', verifySecuritySession, require('./routes/admin'));

// Static: Landing Page and Admin Frontend (pointing to root-level admin-web/dist)
app.use('/landing', express.static(path.join(__dirname, '../landing-dist')));
app.use(express.static(path.join(__dirname, '../../admin-web/dist')));

// SPA fallback: serve index.html for non-API, non-landing routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/landing')) {
    return next(); // let API 404s stay API 404s
  }
  res.sendFile(path.join(__dirname, '../../admin-web/dist/index.html'));
});

module.exports = app;
