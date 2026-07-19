// verifyService.js — Core QR verification logic.
// Checks signature -> expiry -> blacklist, and always logs the scan.
// Returns a result object the route uses to branch on User-Agent.

const prisma = require('../config/prisma');
const { verifyQrToken, verifyQrTokenIgnoringExpiration } = require('./tokenService');

// Log every scan attempt, no matter the outcome.
// A failed scan is evidence of tampering, so we never skip logging.
async function logScan({ qrCodeId, userId, req, result }) {
  return prisma.scanLog.create({
    data: {
      qrCodeId: qrCodeId || null,
      userId: userId || null,
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      result,
    },
  });
}

// Verify a token and return a structured result.
// result.status: 'valid' | 'invalid' | 'expired' | 'blacklisted' | 'suspicious'
async function verifyToken(token, req, { userId = null } = {}) {
  // No token at all.
  if (!token) {
    await logScan({ qrCodeId: null, userId, req, result: 'invalid' });
    return { status: 'invalid', reason: 'No token provided' };
  }

  // 1. Signature + expiry check (jwt.verify throws on either failure).
  let payload;
  try {
    payload = verifyQrToken(token);
  } catch (err) {
    const result = err.name === 'TokenExpiredError' ? 'expired' : 'invalid';
    let expiredQr = null;

    if (result === 'expired') {
      try {
        const expiredPayload = verifyQrTokenIgnoringExpiration(token);
        expiredQr = await prisma.qrCode.findUnique({ where: { id: expiredPayload.qrCodeId } });
      } catch {
        expiredQr = null;
      }
    }

    await logScan({ qrCodeId: expiredQr?.id, userId, req, result });
    return {
      status: result,
      reason: result === 'expired' ? 'This QR code has expired' : 'Invalid QR code signature',
      qr: expiredQr ? publicQr(expiredQr) : null,
    };
  }

  // 2. Look up the QR record.
  const qr = await prisma.qrCode.findUnique({ where: { id: payload.qrCodeId } });
  if (!qr) {
    await logScan({ qrCodeId: null, userId, req, result: 'invalid' });
    return { status: 'invalid', reason: 'QR code not found' };
  }

  if (qr.expiresAt && qr.expiresAt <= new Date()) {
    const expiredQr = { ...qr, status: 'expired' };
    if (qr.status === 'active') {
      await prisma.qrCode.update({ where: { id: qr.id }, data: { status: 'expired' } });
    }
    await logScan({ qrCodeId: qr.id, userId, req, result: 'expired' });
    return { status: 'expired', qr: publicQr(expiredQr), reason: 'This QR code has expired' };
  }

  if (qr.status !== 'active') {
    const knownStatus = ['blacklisted', 'suspicious', 'expired'].includes(qr.status)
      ? qr.status
      : 'invalid';
    const reasons = {
      blacklisted: 'This QR code has been blacklisted',
      suspicious: 'This QR code is flagged as suspicious',
      expired: 'This QR code has expired',
      invalid: 'This QR code has an invalid status',
    };
    await logScan({ qrCodeId: qr.id, userId, req, result: knownStatus });
    return { status: knownStatus, qr: publicQr(qr), reason: reasons[knownStatus] };
  }

  await logScan({ qrCodeId: qr.id, userId, req, result: 'valid' });
  return { status: 'valid', qr: publicQr(qr), destinationUrl: qr.destinationUrl };
}

function publicQr(qr) {
  return {
    id: qr.id,
    label: qr.label,
    status: qr.status,
    expiresAt: qr.expiresAt,
  };
}

module.exports = { verifyToken };
