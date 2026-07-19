// qr.js — QR code endpoints.
// Generation is admin-only. Browser verification stays public; the mobile
// verification endpoint requires a signed-in app user.

const express = require('express');
const { requireAdmin, requireAuth } = require('../middleware/auth');
const { createQrCode } = require('../services/qrService');
const { verifyToken } = require('../services/verifyService');

const router = express.Router();

// --- POST /api/qr/generate (admin only) ---
router.post('/generate', requireAdmin, async (req, res) => {
  try {
    const { destinationUrl, label, expiryHours } = req.body;
    const normalizedUrl = normalizeHttpUrl(destinationUrl);
    if (!normalizedUrl) {
      return res.status(400).json({ error: 'A valid http:// or https:// destinationUrl is required' });
    }

    const normalizedExpiryHours = Number(expiryHours);
    if (
      !Number.isInteger(normalizedExpiryHours) ||
      normalizedExpiryHours < 1 ||
      normalizedExpiryHours > 8760
    ) {
      return res.status(400).json({ error: 'expiryHours must be a whole number between 1 and 8760' });
    }

    const qr = await createQrCode({
      destinationUrl: normalizedUrl,
      label: typeof label === 'string' ? label.trim().slice(0, 120) : null,
      expiryHours: normalizedExpiryHours,
      createdById: req.user.userId,
    });
    res.status(201).json(qr);
  } catch (err) {
    console.error('QR generate error:', err);
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// --- POST /api/qr/verify/mobile (authenticated app users only) ---
// The public QR URL remains GET /verify for standard camera scanners. The
// dedicated app extracts that URL's token and sends it here with auth.
router.post('/verify/mobile', requireAuth, async (req, res) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const result = await verifyToken(token, req, { userId: req.user.userId });
    res.json(result);
  } catch (err) {
    console.error('Mobile QR verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// --- GET /api/qr/verify?token= (PUBLIC — never add auth here) ---
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const result = await verifyToken(token, req);

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

function normalizeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

module.exports = router;
