// seed-demo.js — Populates realistic demo data so the dashboard charts,
// deltas, and donut have something to show.
// Spreads scans across the last 30 days so period-over-period deltas work.
// Safe to re-run: it appends more demo rows (it does not wipe existing data).

require('dotenv/config');
const prisma = require('../src/config/prisma');
const { signQrToken } = require('../src/services/tokenService');

const DAY = 24 * 60 * 60 * 1000;

// Pick a random element from an array.
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Random integer between min and max (inclusive).
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// A random moment within the last `days` days.
const randomDateWithin = (days) =>
  new Date(Date.now() - Math.random() * days * DAY);

const DEMO_QRS = [
  { label: 'City Hall Notice Board', url: 'https://example.com/city-hall', status: 'active' },
  { label: 'Bus Stop 4102', url: 'https://example.com/bus-4102', status: 'active' },
  { label: 'Library Entrance', url: 'https://example.com/library', status: 'active' },
  { label: 'Museum Ticket Desk', url: 'https://example.com/museum', status: 'active' },
  { label: 'Cafe Menu Table 7', url: 'https://example.com/cafe-menu', status: 'suspicious' },
  { label: 'Parking Meter B12', url: 'https://example.com/parking', status: 'suspicious' },
  { label: 'Train Platform 3', url: 'https://example.com/platform-3', status: 'blacklisted' },
  { label: 'Old Promo Poster', url: 'https://example.com/promo-2025', status: 'expired' },
];

const SAMPLE_UAS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
  'SecureQRApp/1.0',
  'SecureQRApp/1.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
];

const DESCRIPTIONS = [
  'A sticker appears to be placed over the original code.',
  'The QR code looks reprinted and misaligned with the frame.',
  'Someone pasted a different code on top of the official one.',
  'Code is peeling at the corner, another layer visible underneath.',
];

async function main() {
  console.log('Seeding demo data...');

  // --- 1. Create demo QR codes ---
  const createdQrs = [];

  for (const demo of DEMO_QRS) {
    const createdAt = randomDateWithin(20);

    const record = await prisma.qrCode.create({
      data: {
        token: 'pending',
        label: demo.label,
        destinationUrl: demo.url,
        status: demo.status,
        createdAt,
        expiresAt:
          demo.status === 'expired'
            ? new Date(Date.now() - 2 * DAY) // already past
            : new Date(Date.now() + 30 * DAY),
      },
    });

    const token = signQrToken(
      { qrCodeId: record.id, destinationUrl: demo.url },
      '365d'
    );

    const updated = await prisma.qrCode.update({
      where: { id: record.id },
      data: { token },
    });

    createdQrs.push(updated);
  }

  console.log(`  Created ${createdQrs.length} QR codes`);

  // --- 2. Scatter scan logs across the last 14 days ---
  // More scans in the recent week than the previous week, so deltas trend up.
  const scanRows = [];

  for (const qr of createdQrs) {
    // Older window (days 14-30 ago): sparse scans so the 30-day chart
    // has data on its left half.
    const olderScans = randInt(4, 10);
    for (let i = 0; i < olderScans; i++) {
      const scannedAt = new Date(Date.now() - (14 * DAY + Math.random() * 16 * DAY));
      scanRows.push({
        qrCodeId: qr.id,
        scannedAt,
        ipAddress: `203.0.113.${randInt(1, 254)}`,
        userAgent: pick(SAMPLE_UAS),
        result: Math.random() < 0.9 ? 'valid' : pick(['expired', 'invalid']),
      });
    }

    // Previous week (days 7-14 ago): fewer scans.
    const prevWeekScans = randInt(5, 15);
    for (let i = 0; i < prevWeekScans; i++) {
      const scannedAt = new Date(Date.now() - (7 * DAY + Math.random() * 7 * DAY));
      scanRows.push({
        qrCodeId: qr.id,
        scannedAt,
        ipAddress: `203.0.113.${randInt(1, 254)}`,
        userAgent: pick(SAMPLE_UAS),
        result: Math.random() < 0.9 ? 'valid' : pick(['expired', 'invalid']),
      });
    }

    // Recent week (last 7 days): more scans.
    const recentScans = randInt(10, 25);
    for (let i = 0; i < recentScans; i++) {
      const scannedAt = randomDateWithin(7);

      // Blacklisted / suspicious codes produce flagged results.
      let result = 'valid';
      if (qr.status === 'blacklisted') result = 'blacklisted';
      else if (qr.status === 'suspicious') result = Math.random() < 0.5 ? 'suspicious' : 'valid';
      else if (qr.status === 'expired') result = 'expired';
      else if (Math.random() < 0.08) result = pick(['invalid', 'expired']);

      scanRows.push({
        qrCodeId: qr.id,
        scannedAt,
        ipAddress: `203.0.113.${randInt(1, 254)}`,
        userAgent: pick(SAMPLE_UAS),
        result,
      });
    }
  }

  // A few scans of unknown/tampered codes — no parent QR (qrCodeId stays null).
  for (let i = 0; i < 12; i++) {
    scanRows.push({
      qrCodeId: null,
      scannedAt: randomDateWithin(30),
      ipAddress: `198.51.100.${randInt(1, 254)}`,
      userAgent: pick(SAMPLE_UAS),
      result: 'invalid',
    });
  }

  await prisma.scanLog.createMany({ data: scanRows });
  console.log(`  Created ${scanRows.length} scan logs`);

  // --- 3. Alerts on the suspicious / blacklisted codes ---
  const flagged = createdQrs.filter((q) =>
    ['suspicious', 'blacklisted'].includes(q.status)
  );

  let alertCount = 0;
  for (const qr of flagged) {
    const howMany = randInt(1, 3);
    for (let i = 0; i < howMany; i++) {
      const createdAt = randomDateWithin(14);
      const resolved = Math.random() < 0.4;

      const alert = await prisma.alert.create({
        data: {
          qrCodeId: qr.id,
          reporterName: Math.random() < 0.6 ? pick(['Anna Lee', 'Marcus Tan', 'Priya S.']) : null,
          contactInfo: Math.random() < 0.3 ? 'reporter@example.com' : null,
          gpsLat: 1.3 + Math.random() * 0.1,
          gpsLng: 103.8 + Math.random() * 0.1,
          photoUrl: null, // demo rows have no uploaded photo
          description: pick(DESCRIPTIONS),
          status: resolved ? 'resolved' : 'new',
          createdAt,
        },
      });

      await prisma.activityLog.create({
        data: {
          qrCodeId: qr.id,
          type: 'alert_created',
          message: `Tamper alert reported for QR "${qr.label}"`,
          status: 'new',
          createdAt,
        },
      });

      if (resolved) {
        await prisma.activityLog.create({
          data: {
            qrCodeId: qr.id,
            type: 'alert_resolved',
            message: `Alert ${alert.id} marked as resolved`,
            status: 'resolved',
            createdAt: new Date(createdAt.getTime() + randInt(1, 48) * 60 * 60 * 1000),
          },
        });
      }

      alertCount++;
    }
  }

  console.log(`  Created ${alertCount} alerts`);

  // --- 4. A few status-change activity entries ---
  for (const qr of flagged) {
    await prisma.activityLog.create({
      data: {
        qrCodeId: qr.id,
        type: 'status_changed',
        message: `QR "${qr.label}" status changed to ${qr.status}`,
        status: qr.status,
        createdAt: randomDateWithin(10),
      },
    });
  }

  console.log('✅ Demo data seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });