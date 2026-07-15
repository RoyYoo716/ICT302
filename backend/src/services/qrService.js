// qrService.js — Core QR code creation logic.
// Signs a QR token, stores the record, and renders the QR PNG.

const QRCode = require('qrcode');
const prisma = require('../config/prisma');
const { signQrToken } = require('./tokenService');

// Build the full verify URL that gets encoded into the QR image.
// BASE_URL comes from .env so it works both locally and on Render.
function buildVerifyUrl(token) {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  return `${base}/api/qr/verify?token=${token}`;
}

// Create a new QR code: sign token -> save record -> render PNG.
// options: { destinationUrl, label, expiryHours }
async function createQrCode({ destinationUrl, label, expiryHours, createdById}) {
  // 1. Create the DB record first so we have a stable qrCodeId.
  //    Token is filled in a moment later (we need the record id in the token).
  const record = await prisma.qrCode.create({
    data: {
      token: 'pending', // temporary placeholder, replaced below
      label: label || null,
      destinationUrl,
      status: 'active',
      expiresAt: expiryHours
        ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
        : null,
      createdById: createdById || null,
    },
  });

  // 2. Sign a QR token carrying the record id and destination.
  const expiresIn = expiryHours ? `${expiryHours}h` : '365d';
  const token = signQrToken(
    { qrCodeId: record.id, destinationUrl },
    expiresIn
  );

  // 3. Save the real token back onto the record.
  const updated = await prisma.qrCode.update({
    where: { id: record.id },
    data: { token },
  });

  // 4. Render the verify URL into a base64 PNG data URL.
  const verifyUrl = buildVerifyUrl(token);
  const qrImage = await QRCode.toDataURL(verifyUrl);

  return {
    id: updated.id,
    label: updated.label,
    destinationUrl: updated.destinationUrl,
    status: updated.status,
    expiresAt: updated.expiresAt,
    verifyUrl,
    qrImage, // base64 PNG data URL, ready to display or download
  };
}

module.exports = { createQrCode, buildVerifyUrl };
