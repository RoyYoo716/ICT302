// verifyService.js — Core QR verification logic.
// Checks signature -> expiry -> blacklist, and always logs the scan.
// Returns a result object the route uses to branch on User-Agent.

const prisma = require('../config/prisma');
const { verifyQrToken } = require('./tokenService');

// Log every scan attempt, no matter the outcome.
// A failed scan is evidence of tampering, so we never skip logging.
async function logScan({ qrCodeId, req, result }) {
  try {
    await prisma.scanLog.create({
      data: {
        qrCodeId: qrCodeId || null,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
        result,
      },
    });
  } catch (err) {
    // Logging must never crash the verify flow.
    console.error('Scan log error:', err.message);
  }
}

// Verify a token and return a structured result.
// result.status: 'valid' | 'invalid' | 'expired' | 'blacklisted' | 'suspicious'
async function verifyToken(token, req) {
  // No token at all.
  if (!token) {
    await logScan({ qrCodeId: null, req, result: 'invalid' });
    return { status: 'invalid', reason: 'No token provided' };
  }

  // 1. Signature + expiry check (jwt.verify throws on either failure).
  let payload;
  try {
    payload = verifyQrToken(token);
  } catch (err) {
    // Distinguish expired from tampered for a clearer message.
    const result = err.name === 'TokenExpiredError' ? 'expired' : 'invalid';
    await logScan({ qrCodeId: null, req, result });
    return { status: result, reason: err.message };
  }

  // 2. Look up the QR record.
  const qr = await prisma.qrCode.findUnique({ where: { id: payload.qrCodeId } });
  if (!qr) {
    await logScan({ qrCodeId: null, req, result: 'invalid' });
    return { status: 'invalid', reason: 'QR code not found' };
  }

  // 3. Blacklist / suspicious status check.
  if (qr.status === 'blacklisted') {
    await logScan({ qrCodeId: qr.id, req, result: 'blacklisted' });
    return { status: 'blacklisted', qr, reason: 'This QR code has been blacklisted' };
  }
  if (qr.status === 'suspicious') {
    await logScan({ qrCodeId: qr.id, req, result: 'suspicious' });
    return { status: 'suspicious', qr, reason: 'This QR code is flagged as suspicious' };
  }

  // 4. All good — valid scan.
  await logScan({ qrCodeId: qr.id, req, result: 'valid' });
  return { status: 'valid', qr, destinationUrl: qr.destinationUrl };
}

module.exports = { verifyToken };
