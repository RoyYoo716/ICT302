// admin.js — Admin-only endpoints. Every route sits behind requireAdmin.

const express = require('express');
const QRCode = require('qrcode');
const prisma = require('../config/prisma');
const { requireAdmin } = require('../middleware/auth');
const { buildVerifyUrl } = require('../services/qrService');

const router = express.Router();

// Apply admin protection to EVERY route in this file.
router.use(requireAdmin);

// --- GET /api/admin/qrcodes?search=&status=&page=&limit= ---
// Paginated list plus the summary counts used by the stat cards.
router.get('/qrcodes', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const { search, status } = req.query;

    // Build the filter from the optional query params.
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { label: { contains: search, mode: 'insensitive' } },
        { destinationUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Run the page query and the total count together.
    const [qrCodes, total] = await Promise.all([
      prisma.qrCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          // Attach scan and alert counts without fetching the rows themselves.
          _count: { select: { ScanLog: true, Alert: true } },
        },
      }),
      prisma.qrCode.count({ where }),
    ]);

    // Summary counts for the stat cards (ignore the current filter).
    const [totalAll, active, suspicious, blacklisted] = await Promise.all([
      prisma.qrCode.count(),
      prisma.qrCode.count({ where: { status: 'active' } }),
      prisma.qrCode.count({ where: { status: 'suspicious' } }),
      prisma.qrCode.count({ where: { status: 'blacklisted' } }),
    ]);

    res.json({
      data: qrCodes.map((qr) => ({
        id: qr.id,
        label: qr.label,
        destinationUrl: qr.destinationUrl,
        status: qr.status,
        expiresAt: qr.expiresAt,
        createdAt: qr.createdAt,
        scanCount: qr._count.ScanLog,
        alertCount: qr._count.Alert,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { total: totalAll, active, suspicious, blacklisted },
    });
  } catch (err) {
    console.error('Admin qrcodes list error:', err);
    res.status(500).json({ error: 'Failed to load QR codes' });
  }
});

// --- GET /api/admin/qrcodes/export ---
// MUST be declared before '/qrcodes/:id', or Express treats "export" as an id.
router.get('/qrcodes/export', async (req, res) => {
  try {
    const qrCodes = await prisma.qrCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { ScanLog: true, Alert: true } } },
    });

    // Escape a value for CSV: wrap in quotes, double any inner quotes.
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const header = 'id,label,destinationUrl,status,expiresAt,createdAt,scanCount,alertCount';
    const rows = qrCodes.map((qr) =>
      [
        qr.id,
        qr.label,
        qr.destinationUrl,
        qr.status,
        qr.expiresAt,
        qr.createdAt,
        qr._count.ScanLog,
        qr._count.Alert,
      ].map(esc).join(',')
    );

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="qrcodes.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Admin qrcodes export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// --- GET /api/admin/qrcodes/:id ---
// Full detail for the details pop-up, with the QR PNG regenerated on the fly.
router.get('/qrcodes/:id', async (req, res) => {
  try {
    const qr = await prisma.qrCode.findUnique({
      where: { id: req.params.id },
      include: {
        ScanLog: { orderBy: { scannedAt: 'desc' }, take: 50 },
        Alert: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!qr) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Images are never stored — regenerate the PNG from the saved token.
    const qrImage = await QRCode.toDataURL(buildVerifyUrl(qr.token));

    res.json({
      id: qr.id,
      label: qr.label,
      destinationUrl: qr.destinationUrl,
      status: qr.status,
      expiresAt: qr.expiresAt,
      createdAt: qr.createdAt,
      totalScans: qr.ScanLog.length,
      scanHistory: qr.ScanLog,
      alerts: qr.Alert,
      qrImage,
    });
  } catch (err) {
    console.error('Admin qrcode detail error:', err);
    res.status(500).json({ error: 'Failed to load QR code' });
  }
});

// --- PATCH /api/admin/qrcodes/:id ---
// Status update, then write an ActivityLog entry.
router.patch('/qrcodes/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'blacklisted', 'suspicious', 'expired'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const existing = await prisma.qrCode.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qr = await prisma.qrCode.update({
      where: { id: req.params.id },
      data: { status },
    });

    // The "ship's log" — record who changed what.
    await prisma.activityLog.create({
      data: {
        qrCodeId: qr.id,
        type: 'status_changed',
        message: `QR "${qr.label || qr.id}" status changed from ${existing.status} to ${status}`,
        status,
      },
    });

    res.json(qr);
  } catch (err) {
    console.error('Admin qrcode update error:', err);
    res.status(500).json({ error: 'Status update failed' });
  }
});

// ============ B PART: alerts, users, metrics, activity ============

// --- GET /api/admin/alerts?page=&limit= ---
// Paginated tamper alerts, each with its QR code's destination and status.
router.get('/alerts', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          QrCode: { select: { id: true, label: true, destinationUrl: true, status: true } },
        },
      }),
      prisma.alert.count(),
    ]);

    res.json({
      data: alerts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin alerts list error:', err);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

// --- PATCH /api/admin/alerts/:id ---
// Resolve (or reopen) an alert, then write an ActivityLog entry.
router.patch('/alerts/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'resolved'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const existing = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { status },
    });

    await prisma.activityLog.create({
      data: {
        qrCodeId: alert.qrCodeId,
        type: status === 'resolved' ? 'alert_resolved' : 'alert_reopened',
        message: `Alert ${alert.id} marked as ${status}`,
        status,
      },
    });

    res.json(alert);
  } catch (err) {
    console.error('Admin alert update error:', err);
    res.status(500).json({ error: 'Alert update failed' });
  }
});

// --- GET /api/admin/users?search=&page=&limit= ---
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        // Never expose passwordHash or reset tokens.
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// --- PATCH /api/admin/users/:id ---
// Role change, protected by the last-admin guard.
router.patch('/users/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['user', 'admin'];

    if (!allowed.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${allowed.join(', ')}` });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    // LAST-ADMIN GUARD: never allow the system to be left without an admin.
    if (target.role === 'admin' && role === 'user') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot demote the last remaining admin',
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true },
    });

    res.json(user);
  } catch (err) {
    console.error('Admin user update error:', err);
    res.status(500).json({ error: 'Role change failed' });
  }
});

// --- GET /api/admin/metrics ---
// Stat cards with period-over-period deltas, weekly scan volume,
// status donut counts, and sidebar badge counts.
router.get('/metrics', async (req, res) => {
  try {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const last7Start = new Date(now.getTime() - 7 * day);
    const prev7Start = new Date(now.getTime() - 14 * day);

    // Percentage change vs the previous period.
    // Returns null when there is no baseline to compare against.
    const delta = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : null;
      return Math.round(((current - previous) / previous) * 100);
    };

    const [
      totalQr, activeQr, suspiciousQr, blacklistedQr, expiredQr,
      totalScans, totalAlerts, newAlerts,
      scansLast7, scansPrev7,
      alertsLast7, alertsPrev7,
      qrLast7, qrPrev7,
    ] = await Promise.all([
      prisma.qrCode.count(),
      prisma.qrCode.count({ where: { status: 'active' } }),
      prisma.qrCode.count({ where: { status: 'suspicious' } }),
      prisma.qrCode.count({ where: { status: 'blacklisted' } }),
      prisma.qrCode.count({ where: { status: 'expired' } }),
      prisma.scanLog.count(),
      prisma.alert.count(),
      prisma.alert.count({ where: { status: 'new' } }),
      prisma.scanLog.count({ where: { scannedAt: { gte: last7Start } } }),
      prisma.scanLog.count({ where: { scannedAt: { gte: prev7Start, lt: last7Start } } }),
      prisma.alert.count({ where: { createdAt: { gte: last7Start } } }),
      prisma.alert.count({ where: { createdAt: { gte: prev7Start, lt: last7Start } } }),
      prisma.qrCode.count({ where: { createdAt: { gte: last7Start } } }),
      prisma.qrCode.count({ where: { createdAt: { gte: prev7Start, lt: last7Start } } }),
    ]);

    // Weekly scan volume: last 7 days, one bucket per day.
    const recentScans = await prisma.scanLog.findMany({
      where: { scannedAt: { gte: last7Start } },
      select: { scannedAt: true, result: true },
    });

    const weeklyScanVolume = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + day);

      const inDay = recentScans.filter(
        (s) => s.scannedAt >= dayStart && s.scannedAt < dayEnd
      );

      weeklyScanVolume.push({
        date: dayStart.toISOString().slice(0, 10),
        total: inDay.length,
        flagged: inDay.filter((s) => s.result !== 'valid').length,
      });
    }

    res.json({
      statCards: {
        totalQrCodes: { value: totalQr, delta: delta(qrLast7, qrPrev7) },
        activeQrCodes: { value: activeQr, delta: null },
        suspiciousQrCodes: { value: suspiciousQr, delta: null },
        blacklistedQrCodes: { value: blacklistedQr, delta: null },
        totalScans: { value: totalScans, delta: delta(scansLast7, scansPrev7) },
        totalAlerts: { value: totalAlerts, delta: delta(alertsLast7, alertsPrev7) },
      },
      weeklyScanVolume,
      statusDonut: {
        active: activeQr,
        suspicious: suspiciousQr,
        blacklisted: blacklistedQr,
        expired: expiredQr,
      },
      sidebarBadges: {
        qrCodes: totalQr,
        alerts: newAlerts,
      },
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ error: 'Failed to load metrics' });
  }
});

// --- GET /api/admin/activity?page=&limit= ---
// The Recent Activity feed, read straight from ActivityLog.
router.get('/activity', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count(),
    ]);

    res.json({
      data: activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin activity error:', err);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

module.exports = router;