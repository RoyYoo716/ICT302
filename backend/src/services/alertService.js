// alertService.js — Handles tamper alert reports.
// Uploads the photo to Supabase Storage (never to local disk), stores only
// the URL, flags the QR as suspicious, and writes an ActivityLog entry.

const crypto = require('crypto');
const prisma = require('../config/prisma');
const supabase = require('../config/supabase');

const BUCKET = 'alert-photos'; // change if your bucket has a different name

// Upload an in-memory photo buffer to Supabase Storage, return its public URL.
async function uploadPhoto(file) {
  if (!file) return null;

  // Build a unique file name so uploads never collide.
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  // Get the public URL for the uploaded file (bucket must be public).
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

// Create a tamper alert. data: { qrCodeId, reporterName?, contactInfo?,
// gpsLat?, gpsLng?, description }, plus an optional uploaded photo file.
async function createAlert({ qrCodeId, reporterName, contactInfo, gpsLat, gpsLng, description }, file) {
  // 1. Confirm the QR code exists.
  const qr = await prisma.qrCode.findUnique({ where: { id: qrCodeId } });
  if (!qr) {
    throw new Error('QR code not found');
  }

  // 2. Upload the photo (if any) and get back only its URL.
  const photoUrl = await uploadPhoto(file);

  // 3. Store the alert — the DB holds the URL, never the binary.
  const alert = await prisma.alert.create({
    data: {
      qrCodeId,
      reporterName: reporterName || null,
      contactInfo: contactInfo || null,
      gpsLat: gpsLat ? Number(gpsLat) : null,
      gpsLng: gpsLng ? Number(gpsLng) : null,
      photoUrl,
      description: description || null,
      status: 'new',
    },
  });

  // 4. Flag the QR code as suspicious on report.
  await prisma.qrCode.update({
    where: { id: qrCodeId },
    data: { status: 'suspicious' },
  });

  // 5. Write an ActivityLog entry (the "ship's log").
  await prisma.activityLog.create({
    data: {
      qrCodeId,
      type: 'alert_created',
      message: `Tamper alert reported for QR "${qr.label || qr.id}"`,
      status: 'new',
    },
  });

  return alert;
}

module.exports = { createAlert };
