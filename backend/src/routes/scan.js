// scan.js — Authenticated mobile scan history.

const express = require('express');
const prisma = require('../config/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/scans/history?page=&limit=
// ScanLog is the audit source of truth. Users may view but not delete it.
router.get('/history', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const where = { userId: req.user.userId };

    const [logs, total, safe] = await Promise.all([
      prisma.scanLog.findMany({
        where,
        orderBy: { scannedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          QrCode: {
            select: {
              id: true,
              label: true,
              destinationUrl: true,
            },
          },
        },
      }),
      prisma.scanLog.count({ where }),
      prisma.scanLog.count({ where: { ...where, result: 'valid' } }),
    ]);

    res.json({
      data: logs.map((log) => ({
        id: log.id,
        qrCodeId: log.qrCodeId,
        label: log.QrCode?.label || null,
        destinationUrl: log.result === 'valid' ? log.QrCode?.destinationUrl || null : null,
        result: log.result,
        scannedAt: log.scannedAt,
      })),
      summary: {
        total,
        safe,
        blocked: total - safe,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Scan history error:', err);
    res.status(500).json({ error: 'Failed to load scan history' });
  }
});

module.exports = router;
