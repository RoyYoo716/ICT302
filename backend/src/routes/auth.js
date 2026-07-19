// auth.js — Authentication endpoints (register, login, password reset).
// Shared by both the web dashboard and the mobile app.

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { signAuthToken } = require('../services/tokenService');
const { requireAuth } = require('../middleware/auth');
const { isMobileApp } = require('../middleware/userAgent');

const router = express.Router();

const ADMIN_RESET_MOBILE_ONLY_ERROR =
  'This account is registered as a mobile user. Please reset your password in the VAFPQR mobile app.';

const SALT_ROUNDS = 10; // bcrypt work factor — higher = slower but safer

// --- POST /api/auth/register ---
// Single form for everyone. Always creates role 'user' (no role field).
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email, and password are required' });
    }

    // Basic email format check — full RFC validation is overkill;
    // "something@something.something" catches real-world mistakes.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Reject if the email is already taken.
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash the password before storing — never store plain text.
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        phoneNumber: phoneNumber || null,
        passwordHash,
        role: 'user', // always 'user' — admins are promoted later
      },
    });

    // Never send the hash back to the client.
    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// --- POST /api/auth/login ---
// Verifies credentials and returns an auth JWT (userId, role).
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Use the same error for "no such user" and "wrong password" so an
    // attacker can't tell which emails are registered.
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = signAuthToken({ userId: user.id, role: user.role });

    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: user.role, lastlogin: user.lastLogin },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- POST /api/auth/forgot-password ---
// Creates a single-use, expiring reset token.
// Returns the reset link directly so both clients can continue in-app.
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond the same way, even if the email doesn't exist,
    // so we don't leak which emails are registered.
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been created.' });
    }

    if (!isMobileApp(req) && user.role !== 'admin') {
      return res.status(403).json({ error: ADMIN_RESET_MOBILE_ONLY_ERROR });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiresAt },
    });

    // Return the link for the web and mobile reset-password screens.
    res.json({
      message: 'Password reset link created.',
      resetLink: `/reset-password?token=${resetToken}`,
    });
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ error: 'Request failed' });
  }
});

// --- POST /api/auth/reset-password ---
// Verifies the reset token and sets a new password.
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'token and newPassword are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() }, // not expired
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (!isMobileApp(req) && user.role !== 'admin') {
      return res.status(403).json({ error: ADMIN_RESET_MOBILE_ONLY_ERROR });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Set new password and clear the reset token so it can't be reused.
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset-password error:', err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// PATCH /api/auth/profile — update own fullName / phoneNumber.
// Email is intentionally NOT editable: it is the login identifier.
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'fullName is required' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber?.trim() || null,
      },
      select: { id: true, fullName: true, email: true, phoneNumber: true, role: true },
    });

    res.json(user);
  } catch (err) {
    console.error('Profile-update error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// --- PATCH /api/auth/password ---
// Logged-in password change (Settings page). Requires a valid auth token.
router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user.passwordHash) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      // 400, not 401: the auth token is valid — the request payload is wrong.
      // A 401 here would trip the frontend's session-expiry redirect.
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash);
    if (sameAsCurrent) {
      return res.status(400).json({ error: 'New password must be different from the current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password-change error:', err);
    res.status(500).json({ error: 'Password change failed' });
  }
});

module.exports = router;
