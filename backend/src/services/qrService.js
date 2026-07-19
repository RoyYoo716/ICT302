// qrService.js — Core QR code creation logic.
// Signs a QR token, stores the record, and renders the QR PNG.

const QRCode = require('qrcode');
const crypto = require('crypto');
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
async function createQrCode({ destinationUrl, label, expiryHours, createdById }) {
  // Generate the id first so the record can be created atomically with its
  // final token. A shared temporary token would collide under concurrency.
  const qrCodeId = crypto.randomUUID();
  const expiresIn = `${expiryHours}h`;
  const token = signQrToken(
    { qrCodeId, destinationUrl },
    expiresIn
  );

  const record = await prisma.qrCode.create({
    data: {
      id: qrCodeId,
      token,
      label: label || null,
      destinationUrl,
      status: 'active',
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
      createdById: createdById || null,
    },
  });

  // Render the verify URL into a base64 PNG data URL.
  const verifyUrl = buildVerifyUrl(token);
  const qrImage = await QRCode.toDataURL(verifyUrl);

  return {
    id: record.id,
    label: record.label,
    destinationUrl: record.destinationUrl,
    status: record.status,
    expiresAt: record.expiresAt,
    createdById: record.createdById,
    verifyUrl,
    qrImage, // base64 PNG data URL, ready to display or download
  };
}

module.exports = { createQrCode, buildVerifyUrl };
