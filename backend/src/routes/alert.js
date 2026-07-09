// alert.js — Tamper alert reporting endpoint (PUBLIC — scanner users report).
// Uses multer memoryStorage: file lives in RAM, then goes straight to Supabase.
// NEVER use diskStorage on Render — the filesystem is ephemeral.

const express = require('express');
const multer = require('multer');
const { createAlert } = require('../services/alertService');

const router = express.Router();

// memoryStorage keeps the upload in RAM (file.buffer), not on disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap (risk R14)
  fileFilter: (req, file, cb) => {
    // Only accept images (risk R14: malicious file upload).
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// --- POST /api/alert/report ---
// multipart/form-data: photo (file), qrCodeId, gpsLat, gpsLng, description,
// reporterName?, contactInfo?
router.post('/report', upload.single('photo'), async (req, res) => {
  try {
    const { qrCodeId, reporterName, contactInfo, gpsLat, gpsLng, description } = req.body;

    if (!qrCodeId) {
      return res.status(400).json({ error: 'qrCodeId is required' });
    }

    const alert = await createAlert(
      { qrCodeId, reporterName, contactInfo, gpsLat, gpsLng, description },
      req.file
    );

    res.status(201).json({ message: 'Alert reported', alert });
  } catch (err) {
    console.error('Alert report error:', err);
    res.status(500).json({ error: err.message || 'Alert submission failed' });
  }
});

module.exports = router;
