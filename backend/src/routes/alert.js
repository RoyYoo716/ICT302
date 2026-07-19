// alert.js — Tamper alert reporting endpoint (PUBLIC — scanner users report).
// Uses multer memoryStorage: file lives in RAM, then goes straight to Supabase.
// NEVER use diskStorage on Render — the filesystem is ephemeral.

const express = require('express');
const multer = require('multer');
const { createAlert } = require('../services/alertService');
const { requireAuth } = require('../middleware/auth');

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
// contactInfo?. Reporter identity comes from the authenticated account.
router.post('/report', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { qrCodeId, contactInfo, gpsLat, gpsLng, description } = req.body;

    if (!qrCodeId) {
      return res.status(400).json({ error: 'qrCodeId is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'description is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'An evidence photo is required' });
    }

    const coordinates = parseCoordinates(gpsLat, gpsLng);
    if (!coordinates.valid) {
      return res.status(400).json({ error: coordinates.error });
    }

    const alert = await createAlert(
      {
        qrCodeId,
        reportedById: req.user.userId,
        reporterName: req.user.fullName,
        contactInfo: typeof contactInfo === 'string' ? contactInfo.trim().slice(0, 200) : null,
        gpsLat: coordinates.latitude,
        gpsLng: coordinates.longitude,
        description: description.trim(),
      },
      req.file
    );

    res.status(201).json({ message: 'Alert reported', alert });
  } catch (err) {
    console.error('Alert report error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Alert submission failed' });
  }
});

function parseCoordinates(gpsLat, gpsLng) {
  const hasLatitude = gpsLat !== undefined && gpsLat !== '';
  const hasLongitude = gpsLng !== undefined && gpsLng !== '';

  if (!hasLatitude && !hasLongitude) {
    return { valid: true, latitude: null, longitude: null };
  }
  if (!hasLatitude || !hasLongitude) {
    return { valid: false, error: 'gpsLat and gpsLng must be provided together' };
  }

  const latitude = Number(gpsLat);
  const longitude = Number(gpsLng);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { valid: false, error: 'Invalid GPS coordinates' };
  }

  return { valid: true, latitude, longitude };
}

module.exports = router;
