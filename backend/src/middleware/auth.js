// auth.js — Gatekeeper middleware for protected routes.
// requireAuth: valid auth token required.
// requireAdmin: valid auth token AND role === 'admin'.

const { verifyAuthToken } = require('../services/tokenService');
const prisma = require('../config/prisma');

// Pull the token out of the "Authorization: Bearer <token>" header.
function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7); // remove "Bearer "
}

// Require any logged-in user.
async function authenticate(req, res) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return false;
  }

  let decoded;
  try {
    decoded = verifyAuthToken(token);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return false;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        authVersion: true,
      },
    });

    if (!user || decoded.authVersion !== user.authVersion) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return false;
    }

    req.user = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      authVersion: user.authVersion,
    };
    return true;
  } catch (err) {
    console.error('Authentication database error:', err);
    res.status(500).json({ error: 'Authentication service unavailable' });
    return false;
  }
}

async function requireAuth(req, res, next) {
  if (await authenticate(req, res)) next();
}

// Require a logged-in user who is also an admin.
// Runs requireAuth first, then checks the role.
async function requireAdmin(req, res, next) {
  if (!(await authenticate(req, res))) return;
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
