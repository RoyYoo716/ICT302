// tokenService.js — Central place for signing and verifying JWTs.
// Two completely separate token types, each with its own secret,
// so a leak of one can never forge the other.

require('dotenv/config');
const jwt = require('jsonwebtoken');

const QR_SECRET = process.env.QR_JWT_SECRET;
const AUTH_SECRET = process.env.AUTH_JWT_SECRET;

// Fail fast at startup if the secrets are missing — better to crash
// loudly now than to sign tokens with an undefined key later.
if (!QR_SECRET || !AUTH_SECRET) {
  throw new Error('Missing QR_JWT_SECRET or AUTH_JWT_SECRET in .env');
}

// --- QR tokens: live inside printed QR codes (public) ---

// Sign a QR token. payload = { qrCodeId, destinationUrl }
// expiresIn example: '24h', '7d', '30m'
function signQrToken(payload, expiresIn) {
  return jwt.sign(payload, QR_SECRET, { expiresIn });
}

// Verify a QR token. Throws if signature is invalid or token expired.
function verifyQrToken(token) {
  return jwt.verify(token, QR_SECRET);
}

// --- Auth tokens: login sessions for app and web ---

// Sign an auth token. payload = { userId, role }
function signAuthToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn });
}

// Verify an auth token. Throws if signature is invalid or token expired.
function verifyAuthToken(token) {
  return jwt.verify(token, AUTH_SECRET);
}

module.exports = {
  signQrToken,
  verifyQrToken,
  signAuthToken,
  verifyAuthToken,
};
