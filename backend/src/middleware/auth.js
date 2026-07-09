// auth.js — Gatekeeper middleware for protected routes.
// requireAuth: valid auth token required.
// requireAdmin: valid auth token AND role === 'admin'.

const { verifyAuthToken } = require('../services/tokenService');

// Pull the token out of the "Authorization: Bearer <token>" header.
function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7); // remove "Bearer "
}

// Require any logged-in user.
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    // Attach the decoded payload (userId, role) to the request
    // so downstream handlers know who is calling.
    req.user = verifyAuthToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Require a logged-in user who is also an admin.
// Runs requireAuth first, then checks the role.
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
