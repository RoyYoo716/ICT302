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

     // Browser: redirect to the Landing Page with the verify result.
    // Verification and scan logging already happened above — the landing
    // page only DISPLAYS the result (never re-verifies; avoids double logs).
    const params = new URLSearchParams();
    params.set('valid', result.status === 'valid' ? 'true' : 'false');
    if (result.reason) params.set('reason', result.reason);
    if (process.env.APK_DOWNLOAD_URL) params.set('apk', process.env.APK_DOWNLOAD_URL);
    // NOTE: destinationUrl is deliberately NOT passed — browser users
    // never receive the destination (app-required model).
    return res.redirect(`/landing/?${params.toString()}`);
  } catch (err) {
    console.error('QR verify error:', err);
    res.status(500).send('Verification failed');
  }
});

module.exports = router;
