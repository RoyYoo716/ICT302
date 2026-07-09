// qr.js — QR code endpoints.
// generate is admin-only; verify is PUBLIC forever (scanner users have no login).

const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { isMobileApp } = require('../middleware/userAgent');
const { createQrCode } = require('../services/qrService');
const { verifyToken } = require('../services/verifyService');

const router = express.Router();

// --- POST /api/qr/generate (admin only) ---
router.post('/generate', requireAdmin, async (req, res) => {
  try {
    const { destinationUrl, label, expiryHours } = req.body;
    if (!destinationUrl) {
      return res.status(400).json({ error: 'destinationUrl is required' });
    }
    const qr = await createQrCode({
      destinationUrl,
      label,
      expiryHours: expiryHours ? Number(expiryHours) : null,
    });
    res.status(201).json(qr);
  } catch (err) {
    console.error('QR generate error:', err);
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// --- GET /api/qr/verify?token= (PUBLIC — never add auth here) ---
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const result = await verifyToken(token, req);

    // Branch on who is asking.
    if (isMobileApp(req)) {
      // Mobile app: return JSON for the in-app result screen.
      return res.json(result);
    }

    // Browser: return a simple Landing Page (HTML).
    // (This is a minimal placeholder; the polished React page comes later.)
    const isValid = result.status === 'valid';
    const color = isValid ? '#16a34a' : '#dc2626';
    const heading = isValid ? '✅ Verified' : '⚠️ Warning';
    const message = isValid
      ? 'This QR code is authentic.'
      : `This QR code is not safe: ${result.reason}`;

    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Secure QR Verification</title>
      </head>
      <body style="font-family: system-ui; text-align: center; padding: 40px;">
        <h1 style="color: ${color};">${heading}</h1>
        <p>${message}</p>
        ${isValid ? '<p>To continue, please install the Secure QR app.</p>' : ''}
        <button>Download App</button>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('QR verify error:', err);
    res.status(500).send('Verification failed');
  }
});

module.exports = router;
