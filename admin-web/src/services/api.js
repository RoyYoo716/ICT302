const SESSION_KEY = 'vafpqr.admin.session'
const REGISTERED_ADMINS_KEY = 'vafpqr.admin.registeredAdmins'
const QR_CODES_KEY = 'vafpqr.admin.qrCodes'
const ALERTS_KEY = 'vafpqr.admin.alerts'
const USERS_KEY = 'vafpqr.admin.users'
const ADMIN_SETTINGS_KEY = 'vafpqr.admin.settings'

const DEMO_ADMIN = {
  id: 'admin-demo',
  fullName: 'VAFPQR Admin',
  email: 'admin@vafpqr.gov',
  phone: '',
  role: 'Admin',
}

const DEMO_PASSWORD = 'admin123'
const MOCK_DELAY_MS = 250
const MOCK_VERIFY_BASE_URL = 'https://vafpqr.local/verify?token='

const memoryStorage = new Map()

const DASHBOARD_METRICS = {
  metricCards: [
    {
      id: 'totalQrCodes',
      label: 'Total QR Codes',
      value: '1,247',
      icon: 'qr',
      tone: 'blue',
    },
    {
      id: 'activeQrCodes',
      label: 'Active QR Codes',
      value: '1,032',
      icon: 'check',
      tone: 'green',
    },
    {
      id: 'blacklisted',
      label: 'Blacklisted',
      value: '89',
      icon: 'warning',
      tone: 'red',
    },
    {
      id: 'suspicious',
      label: 'Suspicious',
      value: '126',
      icon: 'shield',
      tone: 'amber',
    },
    {
      id: 'alertReports',
      label: 'Alert Reports',
      value: '156',
      icon: 'bell',
      tone: 'rose',
    },
    {
      id: 'totalScans',
      label: 'Total Scans',
      value: '8,945',
      icon: 'eye',
      tone: 'sky',
    },
  ],
  scanVolume: {
    '1h': {
      title: 'Scan Volume - Last Hour',
      subtitle: 'Last hour (per minute bucket)',
      maxValue: 800,
      ticks: [800, 600, 400, 200, 0],
      data: [
        { label: '00:00', displayLabel: '00:00', scans: 35 },
        { label: '01:00', scans: 12 },
        { label: '02:00', scans: 8 },
        { label: '03:00', displayLabel: '03:00', scans: 9 },
        { label: '04:00', scans: 4 },
        { label: '05:00', scans: 10 },
        { label: '06:00', displayLabel: '06:00', scans: 62 },
        { label: '07:00', scans: 205 },
        { label: '08:00', scans: 410 },
        { label: '09:00', displayLabel: '09:00', scans: 545 },
        { label: '10:00', scans: 492 },
        { label: '11:00', scans: 506 },
        { label: '12:00', displayLabel: '12:00', scans: 620 },
        { label: '13:00', scans: 580 },
        { label: '14:00', scans: 548 },
        { label: '15:00', displayLabel: '15:00', scans: 505 },
        { label: '16:00', scans: 462 },
        { label: '17:00', scans: 520 },
        { label: '18:00', displayLabel: '18:00', scans: 448 },
        { label: '19:00', scans: 382 },
        { label: '20:00', scans: 310 },
        { label: '21:00', displayLabel: '21:00', scans: 238 },
        { label: '22:00', scans: 175 },
        { label: '23:00', scans: 96 },
      ],
    },
    '24h': {
      title: 'Scan Volume - Last 24 Hours',
      subtitle: 'Last 24 hours (2-hour buckets)',
      maxValue: 1200,
      ticks: [1200, 900, 600, 300, 0],
      data: [
        { label: '00:00', displayLabel: '00:00', scans: 310 },
        { label: '02:00', displayLabel: '02:00', scans: 190 },
        { label: '04:00', displayLabel: '04:00', scans: 90 },
        { label: '06:00', displayLabel: '06:00', scans: 230 },
        { label: '08:00', displayLabel: '08:00', scans: 890 },
        { label: '10:00', displayLabel: '10:00', scans: 1040 },
        { label: '12:00', displayLabel: '12:00', scans: 1200 },
        { label: '14:00', displayLabel: '14:00', scans: 1060 },
        { label: '16:00', displayLabel: '16:00', scans: 950 },
        { label: '18:00', displayLabel: '18:00', scans: 815 },
        { label: '20:00', displayLabel: '20:00', scans: 635 },
        { label: '22:00', displayLabel: '22:00', scans: 395 },
      ],
    },
    '1w': {
      title: 'Scan Volume - Last 7 Days',
      subtitle: 'Last 7 days',
      maxValue: 2000,
      ticks: [2000, 1500, 1000, 500, 0],
      data: [
        { label: 'Mon', displayLabel: 'Mon', scans: 1240 },
        { label: 'Tue', displayLabel: 'Tue', scans: 980 },
        { label: 'Wed', displayLabel: 'Wed', scans: 1560 },
        { label: 'Thu', displayLabel: 'Thu', scans: 1110 },
        { label: 'Fri', displayLabel: 'Fri', scans: 1910 },
        { label: 'Sat', displayLabel: 'Sat', scans: 1420 },
        { label: 'Sun', displayLabel: 'Sun', scans: 720 },
      ],
    },
    '1M': {
      title: 'Scan Volume - Last 30 Days',
      subtitle: 'Last 30 days (3-day buckets)',
      maxValue: 10000,
      ticks: [10000, 7500, 5000, 2500, 0],
      data: [
        { label: 'Jun 1', displayLabel: 'Jun 1', scans: 4100 },
        { label: 'Jun 4', displayLabel: 'Jun 4', scans: 5800 },
        { label: 'Jun 7', displayLabel: 'Jun 7', scans: 3800 },
        { label: 'Jun 10', displayLabel: 'Jun 10', scans: 6700 },
        { label: 'Jun 13', displayLabel: 'Jun 13', scans: 5050 },
        { label: 'Jun 16', displayLabel: 'Jun 16', scans: 7200 },
        { label: 'Jun 19', displayLabel: 'Jun 19', scans: 6250 },
        { label: 'Jun 22', displayLabel: 'Jun 22', scans: 8100 },
        { label: 'Jun 25', displayLabel: 'Jun 25', scans: 7350 },
        { label: 'Jun 28', displayLabel: 'Jun 28', scans: 6900 },
      ],
    },
  },
  statusDistribution: [
    { label: 'Active', value: 1032, color: '#059669' },
    { label: 'Suspicious', value: 126, color: '#f59e0b' },
    { label: 'Blacklisted', value: 89, color: '#dc2626' },
    { label: 'Expired', value: 54, color: '#6b7280' },
  ],
  recentActivity: [
    {
      id: 'activity-1',
      message: 'QR-003 flagged as Suspicious - 45 alerts',
      time: '2m ago',
      tone: 'warning',
    },
    {
      id: 'activity-2',
      message: 'QR-008 blacklisted by admin',
      time: '14m ago',
      tone: 'danger',
    },
    {
      id: 'activity-3',
      message: 'QR-005 generated 2,431 scans today',
      time: '1h ago',
      tone: 'info',
    },
    {
      id: 'activity-4',
      message: 'Alert ALT-009 resolved - phishing confirmed',
      time: '2h ago',
      tone: 'danger',
    },
    {
      id: 'activity-5',
      message: 'New QR-010 created for feedback campaign',
      time: '3h ago',
      tone: 'info',
    },
  ],
}

const INITIAL_QR_CODES = [
  {
    id: 'QR-001',
    destinationUrl: 'https://shop.com',
    status: 'Active',
    expiryDate: '2026-07-01',
    expiresAt: '2026-07-01 23:59',
    scans: 1247,
    alerts: 23,
  },
  {
    id: 'QR-002',
    destinationUrl: 'https://event.io',
    status: 'Blacklisted',
    expiryDate: '2026-06-15',
    expiresAt: '2026-06-15 23:59',
    scans: 856,
    alerts: 12,
  },
  {
    id: 'QR-003',
    destinationUrl: 'https://menu.com',
    status: 'Suspicious',
    expiryDate: '2026-07-10',
    expiresAt: '2026-07-10 23:59',
    scans: 342,
    alerts: 45,
  },
  {
    id: 'QR-004',
    destinationUrl: 'https://pay.com',
    status: 'Expired',
    expiryDate: '2026-05-30',
    expiresAt: '2026-05-30 23:59',
    scans: 89,
    alerts: 2,
  },
  {
    id: 'QR-005',
    destinationUrl: 'https://booking.com',
    status: 'Active',
    expiryDate: '2026-08-01',
    expiresAt: '2026-08-01 23:59',
    scans: 2431,
    alerts: 5,
  },
  {
    id: 'QR-006',
    destinationUrl: 'https://survey.com',
    status: 'Active',
    expiryDate: '2026-07-15',
    expiresAt: '2026-07-15 23:59',
    scans: 567,
    alerts: 0,
  },
  {
    id: 'QR-007',
    destinationUrl: 'https://promo.com',
    status: 'Suspicious',
    expiryDate: '2026-06-30',
    expiresAt: '2026-06-30 23:59',
    scans: 234,
    alerts: 18,
  },
  {
    id: 'QR-008',
    destinationUrl: 'https://login.com',
    status: 'Blacklisted',
    expiryDate: '2026-06-20',
    expiresAt: '2026-06-20 23:59',
    scans: 612,
    alerts: 31,
  },
  {
    id: 'QR-009',
    destinationUrl: 'https://order.com',
    status: 'Active',
    expiryDate: '2026-07-25',
    expiresAt: '2026-07-25 23:59',
    scans: 789,
    alerts: 3,
  },
  {
    id: 'QR-010',
    destinationUrl: 'https://feedback.com',
    status: 'Expired',
    expiryDate: '2026-04-15',
    expiresAt: '2026-04-15 23:59',
    scans: 45,
    alerts: 0,
  },
]

const INITIAL_ALERTS = [
  {
    id: 'ALT-001',
    qrCodeId: 'QR-003',
    userName: 'John Doe',
    contact: 'reporter@anonymous.sg',
    gpsLocation: '1.3521掳N, 103.8198掳E',
    description: 'Sticker replaced over original QR code with a different one',
    status: 'New',
    submittedAt: '2026-06-24 09:14',
    adminNotes: '',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-001'),
    evidencePhotoFileName: 'ALT-001-evidence.jpg',
  },
  {
    id: 'ALT-002',
    qrCodeId: 'QR-007',
    userName: 'Anonymous',
    contact: 'reporter@anonymous.sg',
    gpsLocation: '1.2987掳N, 103.8512掳E',
    description: 'QR code damaged, partially obscured by physical sticker',
    status: 'New',
    submittedAt: '2026-06-24 10:32',
    adminNotes: '',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-002'),
    evidencePhotoFileName: 'ALT-002-evidence.jpg',
  },
  {
    id: 'ALT-003',
    qrCodeId: 'QR-001',
    userName: 'Mary Tan',
    contact: 'mary.tan@example.com',
    gpsLocation: '1.4123掳N, 103.8234掳E',
    description: 'Fake QR overlay placed on top of legitimate code',
    status: 'Reviewed',
    submittedAt: '2026-06-23 14:55',
    adminNotes: 'Store manager contacted for verification.',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-003'),
    evidencePhotoFileName: 'ALT-003-evidence.jpg',
  },
  {
    id: 'ALT-004',
    qrCodeId: 'QR-004',
    userName: 'Peter Lim',
    contact: 'reporter@anonymous.sg',
    gpsLocation: '1.3567掳N, 103.9123掳E',
    description: 'Suspicious link redirecting to unknown payment portal',
    status: 'Resolved',
    submittedAt: '2026-06-22 16:20',
    adminNotes: 'Confirmed duplicate report and closed.',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-004'),
    evidencePhotoFileName: 'ALT-004-evidence.jpg',
  },
  {
    id: 'ALT-005',
    qrCodeId: 'QR-009',
    userName: 'Sarah Wong',
    contact: 'sarah.wong@example.com',
    gpsLocation: '1.3198掳N, 103.8456掳E',
    description: 'Covered with sticker, destination URL appears altered',
    status: 'New',
    submittedAt: '2026-06-24 11:47',
    adminNotes: '',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-005'),
    evidencePhotoFileName: 'ALT-005-evidence.jpg',
  },
  {
    id: 'ALT-006',
    qrCodeId: 'QR-003',
    userName: 'Ahmad R.',
    contact: 'ahmad.r@example.com',
    gpsLocation: '1.3456掳N, 103.8765掳E',
    description: 'URL looks fake, redirecting to phishing site mirror',
    status: 'Reviewed',
    submittedAt: '2026-06-23 08:30',
    adminNotes: 'Escalated to security review queue.',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-006'),
    evidencePhotoFileName: 'ALT-006-evidence.jpg',
  },
  {
    id: 'ALT-007',
    qrCodeId: 'QR-010',
    userName: 'Anonymous',
    contact: 'reporter@anonymous.sg',
    gpsLocation: '1.2897掳N, 103.8321掳E',
    description: 'QR code cut out and replaced at restaurant table',
    status: 'Resolved',
    submittedAt: '2026-06-21 19:05',
    adminNotes: 'Resolved after venue replaced the printed code.',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-007'),
    evidencePhotoFileName: 'ALT-007-evidence.jpg',
  },
  {
    id: 'ALT-008',
    qrCodeId: 'QR-005',
    userName: 'Lila Chen',
    contact: 'lila.chen@example.com',
    gpsLocation: '1.3024掳N, 103.7891掳E',
    description: 'Scanned code opens unrelated promotional page',
    status: 'New',
    submittedAt: '2026-06-24 12:18',
    adminNotes: '',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-008'),
    evidencePhotoFileName: 'ALT-008-evidence.jpg',
  },
  {
    id: 'ALT-009',
    qrCodeId: 'QR-008',
    userName: 'Security Staff',
    contact: 'security@example.com',
    gpsLocation: '1.3611掳N, 103.8864掳E',
    description: 'Phishing confirmed by internal security team',
    status: 'Reviewed',
    submittedAt: '2026-06-23 18:42',
    adminNotes: 'Pending final closure.',
    evidencePhotoUrl: createEvidencePhotoUrl('ALT-009'),
    evidencePhotoFileName: 'ALT-009-evidence.jpg',
  },
  {
    id: 'ALT-010',
    qrCodeId: 'QR-006',
    userName: 'Vanessa Lee',
    contact: 'vanessa.lee@example.com',
    gpsLocation: '1.3745掳N, 103.9020掳E',
    description: 'Printed QR code appears tampered near entrance display',
    status: 'New',
    submittedAt: '2026-06-24 13:05',
    adminNotes: '',
    evidencePhotoUrl: '',
    evidencePhotoFileName: '',
  },
]

const INITIAL_USERS = [
  {
    id: 'USR-001',
    fullName: 'Admin User',
    email: 'admin@vafpqr.gov',
    role: 'Super Admin',
    status: 'Active',
    joined: '2024-01-15',
    lastLogin: '2026-07-09 19:51',
    lastIp: '103.12.45.67',
    qrManaged: 1247,
    alertsReviewed: 89,
    twoFactorEnabled: true,
  },
  {
    id: 'USR-002',
    fullName: 'Sarah Lim',
    email: 'sarah.lim@vafpqr.gov',
    role: 'Admin',
    status: 'Active',
    joined: '2024-03-02',
    lastLogin: '2026-06-25 07:11',
    lastIp: '103.20.16.22',
    qrManaged: 312,
    alertsReviewed: 34,
    twoFactorEnabled: true,
  },
  {
    id: 'USR-003',
    fullName: 'David Tan',
    email: 'david.tan@vafpqr.gov',
    role: 'Reviewer',
    status: 'Active',
    joined: '2024-04-18',
    lastLogin: '2026-06-24 18:55',
    lastIp: '103.44.19.88',
    qrManaged: 0,
    alertsReviewed: 156,
    twoFactorEnabled: false,
  },
  {
    id: 'USR-004',
    fullName: 'Priya Nair',
    email: 'priya.nair@vafpqr.gov',
    role: 'Admin',
    status: 'Active',
    joined: '2024-06-09',
    lastLogin: '2026-06-24 15:30',
    lastIp: '103.18.76.11',
    qrManaged: 489,
    alertsReviewed: 67,
    twoFactorEnabled: true,
  },
  {
    id: 'USR-005',
    fullName: 'James Wong',
    email: 'james.wong@vafpqr.gov',
    role: 'Reviewer',
    status: 'Suspended',
    joined: '2024-08-21',
    lastLogin: '2026-06-20 11:02',
    lastIp: '103.65.10.41',
    qrManaged: 0,
    alertsReviewed: 22,
    twoFactorEnabled: false,
  },
  {
    id: 'USR-006',
    fullName: 'Mei Ling',
    email: 'mei.ling@vafpqr.gov',
    role: 'Admin',
    status: 'Active',
    joined: '2024-09-12',
    lastLogin: '2026-06-25 09:15',
    lastIp: '103.31.88.90',
    qrManaged: 203,
    alertsReviewed: 41,
    twoFactorEnabled: true,
  },
  {
    id: 'USR-007',
    fullName: 'Ahmad Razif',
    email: 'a.razif@vafpqr.gov',
    role: 'Reviewer',
    status: 'Inactive',
    joined: '2025-01-20',
    lastLogin: '2026-06-01 10:00',
    lastIp: '103.22.67.15',
    qrManaged: 0,
    alertsReviewed: 18,
    twoFactorEnabled: false,
  },
  {
    id: 'USR-008',
    fullName: 'Olivia Chan',
    email: 'olivia.chan@vafpqr.gov',
    role: 'Admin',
    status: 'Active',
    joined: '2025-03-11',
    lastLogin: '2026-06-25 12:24',
    lastIp: '103.75.32.18',
    qrManaged: 87,
    alertsReviewed: 29,
    twoFactorEnabled: true,
  },
]

const INITIAL_ADMIN_SETTINGS = {
  profile: {
    id: 'USR-001',
    fullName: 'Admin User',
    email: 'admin@vafpqr.gov',
    phone: '+65 9123 4567',
    role: 'Super Admin',
    status: 'Active',
  },
  security: {
    currentPassword: 'admin123',
  },
  notifications: {
    emailAlerts: true,
    newAlertReports: true,
  },
}

function wait() {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, MOCK_DELAY_MS)
  })
}

function getStorage() {
  return globalThis.localStorage || globalThis.window?.localStorage || null
}

function readStorage(key) {
  const storage = getStorage()

  if (!storage) {
    return memoryStorage.get(key) || null
  }

  try {
    return storage.getItem(key)
  } catch {
    return memoryStorage.get(key) || null
  }
}

function writeStorage(key, value) {
  const storage = getStorage()

  if (!storage) {
    memoryStorage.set(key, value)
    return
  }

  try {
    storage.setItem(key, value)
  } catch {
    memoryStorage.set(key, value)
  }
}

function removeStorage(key) {
  const storage = getStorage()

  if (!storage) {
    memoryStorage.delete(key)
    return
  }

  try {
    storage.removeItem(key)
  } catch {
    memoryStorage.delete(key)
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function getStoredAdmins() {
  try {
    return JSON.parse(readStorage(REGISTERED_ADMINS_KEY)) || []
  } catch {
    return []
  }
}

function saveStoredAdmins(admins) {
  writeStorage(REGISTERED_ADMINS_KEY, JSON.stringify(admins))
}

function saveSession(admin) {
  writeStorage(SESSION_KEY, JSON.stringify(admin))
}

function readSession() {
  try {
    return JSON.parse(readStorage(SESSION_KEY))
  } catch {
    return null
  }
}

function toPublicAdmin(admin) {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
  }
}

function hashString(value) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function isFinderArea(row, column, size) {
  const inTop = row < 8
  const inBottom = row >= size - 8
  const inLeft = column < 8
  const inRight = column >= size - 8

  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft)
}

function shouldFillModule(row, column, hash) {
  const value = row * 31 + column * 17 + hash
  return value % 5 === 0 || value % 7 === 0 || value % 11 === 0
}

function drawFinder(ctx, x, y, moduleSize) {
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5)
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3)
}

function createSvgQrImage(seed) {
  const size = 25
  const moduleSize = 8
  const padding = 12
  const imageSize = size * moduleSize + padding * 2
  const hash = hashString(seed)
  const rects = []

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (!isFinderArea(row, column, size) && shouldFillModule(row, column, hash)) {
        rects.push(
          `<rect x="${padding + column * moduleSize}" y="${padding + row * moduleSize}" width="${moduleSize}" height="${moduleSize}" />`,
        )
      }
    }
  }

  const finder = (x, y) => `
    <rect x="${x}" y="${y}" width="${moduleSize * 7}" height="${moduleSize * 7}" />
    <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${moduleSize * 5}" height="${moduleSize * 5}" fill="#fff" />
    <rect x="${x + moduleSize * 2}" y="${y + moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" />
  `

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}" viewBox="0 0 ${imageSize} ${imageSize}">
    <rect width="100%" height="100%" fill="#fff" />
    <g fill="#1f2937">
      ${finder(padding, padding)}
      ${finder(padding + moduleSize * 18, padding)}
      ${finder(padding, padding + moduleSize * 18)}
      ${rects.join('')}
    </g>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function createMockQrImage(seed) {
  const documentRef = globalThis.document || globalThis.window?.document

  if (!documentRef) {
    return createSvgQrImage(seed)
  }

  const size = 25
  const moduleSize = 8
  const padding = 12
  const imageSize = size * moduleSize + padding * 2
  const hash = hashString(seed)
  const canvas = documentRef.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = imageSize
  canvas.height = imageSize
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, imageSize, imageSize)
  ctx.fillStyle = '#1f2937'

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (!isFinderArea(row, column, size) && shouldFillModule(row, column, hash)) {
        ctx.fillRect(
          padding + column * moduleSize,
          padding + row * moduleSize,
          moduleSize,
          moduleSize,
        )
      }
    }
  }

  drawFinder(ctx, padding, padding, moduleSize)
  drawFinder(ctx, padding + moduleSize * 18, padding, moduleSize)
  drawFinder(ctx, padding, padding + moduleSize * 18, moduleSize)

  return canvas.toDataURL('image/png')
}

function createEvidencePhotoUrl(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
    <defs>
      <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#dbeafe" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
    </defs>
    <rect width="480" height="320" fill="url(#sky)" />
    <rect x="72" y="54" width="336" height="212" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="5" />
    <rect x="126" y="92" width="128" height="128" rx="8" fill="#111827" />
    <rect x="142" y="108" width="96" height="96" rx="6" fill="#ffffff" />
    <rect x="154" y="120" width="72" height="72" rx="4" fill="#111827" />
    <rect x="278" y="104" width="76" height="14" rx="7" fill="#94a3b8" />
    <rect x="278" y="134" width="86" height="14" rx="7" fill="#94a3b8" />
    <rect x="278" y="164" width="58" height="14" rx="7" fill="#94a3b8" />
    <rect x="96" y="238" width="288" height="18" rx="9" fill="#fee2e2" />
    <text x="240" y="286" fill="#475569" font-family="Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle">${label} evidence photo</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function buildVerifyUrl(id) {
  return `${MOCK_VERIFY_BASE_URL}mock-token-${id.toLowerCase()}`
}

function hydrateQRCode(qrCode) {
  const verifyUrl = qrCode.verifyUrl || buildVerifyUrl(qrCode.id)

  return {
    ...qrCode,
    verifyUrl,
    qrImageUrl: qrCode.qrImageUrl || createMockQrImage(`${verifyUrl}:${qrCode.destinationUrl}`),
  }
}

function cloneQRCode(qrCode) {
  return { ...qrCode }
}

function cloneQRCodes(qrCodes) {
  return qrCodes.map(cloneQRCode)
}

function cloneAlert(alert) {
  const legacyEvidencePhoto = Array.isArray(alert.evidencePhotos)
    ? alert.evidencePhotos.find((photo) => photo?.url)
    : null
  const alertFields = { ...alert }
  delete alertFields.evidencePhotos

  return {
    ...alertFields,
    user: alert.user || alert.userName,
    evidencePhotoUrl: alert.evidencePhotoUrl || legacyEvidencePhoto?.url || '',
    evidencePhotoFileName:
      alert.evidencePhotoFileName || legacyEvidencePhoto?.fileName || '',
  }
}

function cloneAlerts(alerts) {
  return alerts.map(cloneAlert)
}

function getNewAlertCount(alerts) {
  return alerts.filter((alert) => alert.status === 'New').length
}

function cloneUser(user) {
  return { ...user }
}

function cloneUsers(users) {
  return users.map(cloneUser)
}

function cloneAdminSettings(settings) {
  return {
    profile: { ...settings.profile },
    notifications: { ...settings.notifications },
  }
}

function normalizeAdminSettings(settings = INITIAL_ADMIN_SETTINGS) {
  return {
    profile: {
      ...INITIAL_ADMIN_SETTINGS.profile,
      ...(settings.profile || {}),
    },
    security: {
      currentPassword:
        settings.security?.currentPassword || INITIAL_ADMIN_SETTINGS.security.currentPassword,
    },
    notifications: {
      ...INITIAL_ADMIN_SETTINGS.notifications,
      ...(settings.notifications || {}),
    },
  }
}

function loadQRCodes() {
  try {
    const storedQRCodes = JSON.parse(readStorage(QR_CODES_KEY))

    if (Array.isArray(storedQRCodes) && storedQRCodes.length > 0) {
      return storedQRCodes.map(hydrateQRCode)
    }
  } catch {
    // Fall back to seed data below.
  }

  const initialQRCodes = INITIAL_QR_CODES.map(hydrateQRCode)
  saveQRCodes(initialQRCodes)
  return initialQRCodes
}

function saveQRCodes(qrCodes) {
  writeStorage(QR_CODES_KEY, JSON.stringify(qrCodes))
}

function loadAlerts() {
  try {
    const storedAlerts = JSON.parse(readStorage(ALERTS_KEY))

    if (Array.isArray(storedAlerts) && storedAlerts.length > 0) {
      return storedAlerts.map(cloneAlert)
    }
  } catch {
    // Fall back to seed data below.
  }

  const initialAlerts = cloneAlerts(INITIAL_ALERTS)
  saveAlerts(initialAlerts)
  return initialAlerts
}

function saveAlerts(alerts) {
  writeStorage(ALERTS_KEY, JSON.stringify(alerts))
}

function loadUsers() {
  try {
    const storedUsers = JSON.parse(readStorage(USERS_KEY))

    if (Array.isArray(storedUsers) && storedUsers.length > 0) {
      return storedUsers
    }
  } catch {
    // Fall back to seed data below.
  }

  const initialUsers = cloneUsers(INITIAL_USERS)
  saveUsers(initialUsers)
  return initialUsers
}

function saveUsers(users) {
  writeStorage(USERS_KEY, JSON.stringify(users))
}

function loadAdminSettings() {
  try {
    const storedSettings = JSON.parse(readStorage(ADMIN_SETTINGS_KEY))

    if (storedSettings?.profile && storedSettings?.security) {
      return normalizeAdminSettings(storedSettings)
    }
  } catch {
    // Fall back to seed data below.
  }

  const initialSettings = normalizeAdminSettings()

  saveAdminSettings(initialSettings)
  return initialSettings
}

function saveAdminSettings(settings) {
  writeStorage(ADMIN_SETTINGS_KEY, JSON.stringify(settings))
}

function getNextUserId(users) {
  const nextNumber =
    Math.max(
      ...users.map((user) => {
        const match = user.id.match(/USR-(\d+)/)
        return match ? Number(match[1]) : 0
      }),
    ) + 1

  return `USR-${String(nextNumber).padStart(3, '0')}`
}

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function escapeCsvValue(value) {
  const text = String(value ?? '')
  const escapedText = text.replace(/"/g, '""')

  return /[",\r\n]/.test(escapedText) ? `"${escapedText}"` : escapedText
}

function buildCsv(headers, rows) {
  return [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\r\n')
}

function createCsvBlob(csv) {
  const BlobRef = globalThis.Blob || globalThis.window?.Blob

  if (!BlobRef) {
    throw new Error('CSV export is not supported in this browser.')
  }

  return new BlobRef([`\ufeff${csv}`], {
    type: 'text/csv;charset=utf-8',
  })
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function getNextQRCodeId(qrCodes) {
  const nextNumber =
    Math.max(
      ...qrCodes.map((qrCode) => {
        const match = qrCode.id.match(/QR-(\d+)/)
        return match ? Number(match[1]) : 0
      }),
    ) + 1

  return `QR-${String(nextNumber).padStart(3, '0')}`
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/auth/login
// Payload: { email, password }
// Expected response: { admin }
// Purpose: authenticate an admin user and return the current admin profile.
export async function loginAdmin({ email, password }) {
  await wait()

  const normalizedEmail = normalizeEmail(email)
  const storedAdmins = getStoredAdmins()
  const registeredAdmin = storedAdmins.find(
    (admin) => admin.email === normalizedEmail && admin.password === password,
  )

  if (normalizedEmail === DEMO_ADMIN.email && password === DEMO_PASSWORD) {
    saveSession(DEMO_ADMIN)
    return { admin: DEMO_ADMIN }
  }

  if (registeredAdmin) {
    const admin = toPublicAdmin(registeredAdmin)
    saveSession(admin)
    return { admin }
  }

  throw new Error('Invalid email or password.')
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/auth/register
// Payload: { fullName, email, phone, role, password }
// Expected response: { admin }
// Purpose: create a staff account request/profile for admin web access.
export async function registerAdmin({ fullName, email, phone, role, password }) {
  await wait()

  const normalizedEmail = normalizeEmail(email)
  const storedAdmins = getStoredAdmins()
  const emailExists =
    normalizedEmail === DEMO_ADMIN.email ||
    storedAdmins.some((admin) => admin.email === normalizedEmail)

  if (emailExists) {
    throw new Error('This email is already registered.')
  }

  const admin = {
    id: `mock-admin-${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    role,
    password,
  }

  saveStoredAdmins([...storedAdmins, admin])

  return { admin: toPublicAdmin(admin) }
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/auth/logout
// Payload: none
// Expected response: { success }
// Purpose: clear the current admin session.
export async function logoutAdmin() {
  await wait()
  removeStorage(SESSION_KEY)
  return { success: true }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/auth/me
// Payload: none
// Expected response: admin profile or null
// Purpose: return the current authenticated admin profile.
export async function getCurrentAdmin() {
  await wait()
  return readSession()
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/metrics
// Payload: none
// Expected response: dashboard metric cards, scan volume, status distribution, and recent activity.
// Purpose: return dashboard metric cards, scan volume chart data, QR status distribution, and recent activity.
export async function getMetrics() {
  await wait()
  return DASHBOARD_METRICS
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/qr
// Payload: none
// Expected response: { qrCodes }
// Purpose: return QR code list for Admin Web.
export async function getQRCodes() {
  await wait()
  return { qrCodes: cloneQRCodes(loadQRCodes()) }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/qr/:id
// Payload: route param { id }
// Expected response: { qrCode }
// Purpose: return one QR code detail.
export async function getQRCodeById(id) {
  await wait()

  const qrCode = loadQRCodes().find((item) => item.id === id)

  if (!qrCode) {
    throw new Error('QR code not found.')
  }

  return { qrCode: cloneQRCode(qrCode) }
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/qr/generate
// Payload: { destinationUrl, expiryDuration }
// Expected response: { qrCode }
// Purpose: generate new secure QR code.
export async function generateQRCode({ destinationUrl, expiryDuration }) {
  await wait()

  const trimmedDestinationUrl = destinationUrl.trim()

  if (!trimmedDestinationUrl) {
    throw new Error('Destination URL is required.')
  }

  const qrCodes = loadQRCodes()
  const id = getNextQRCodeId(qrCodes)
  const durationHours = Number(expiryDuration || 24)
  const expiry = new Date(Date.now() + durationHours * 60 * 60 * 1000)
  const expiresAt = formatDateTime(expiry)
  const verifyUrl = buildVerifyUrl(id)
  const qrCode = hydrateQRCode({
    id,
    destinationUrl: trimmedDestinationUrl,
    status: 'Active',
    expiryDate: expiresAt.slice(0, 10),
    expiresAt,
    scans: 0,
    alerts: 0,
    verifyUrl,
  })

  saveQRCodes([qrCode, ...qrCodes])

  return { qrCode: cloneQRCode(qrCode) }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/qr/:id/status
// Payload: { status }
// Expected response: { qrCode }
// Purpose: activate or blacklist QR code.
export async function updateQRCodeStatus(id, status) {
  await wait()

  const qrCodes = loadQRCodes()
  const nextQRCodes = qrCodes.map((qrCode) =>
    qrCode.id === id ? { ...qrCode, status } : qrCode,
  )
  const updatedQRCode = nextQRCodes.find((qrCode) => qrCode.id === id)

  if (!updatedQRCode) {
    throw new Error('QR code not found.')
  }

  saveQRCodes(nextQRCodes)

  return { qrCode: cloneQRCode(updatedQRCode) }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/qr/export
// Payload: none
// Expected response: text/csv containing all QR code records.
// Purpose: export all QR Code records as a CSV file; backend should return all records, not one page.
export async function exportQRCodesCsv() {
  await wait()

  const qrCodes = loadQRCodes()
  const headers = ['QR ID', 'Destination URL', 'Status', 'Expiry Date', 'Scans', 'Alerts']
  const rows = qrCodes.map((qrCode) => [
    qrCode.id,
    qrCode.destinationUrl,
    qrCode.status,
    qrCode.expiryDate,
    qrCode.scans,
    qrCode.alerts,
  ])
  const csv = buildCsv(headers, rows)

  return {
    blob: createCsvBlob(csv),
    fileName: `vafpqr-qr-codes-${formatDate(new Date())}.csv`,
  }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/alerts
// Payload: none
// Expected response: { alerts, newAlertCount }
// Purpose: return tamper alert list for Admin Web.
export async function getAlerts() {
  await wait()

  const alerts = loadAlerts()

  return {
    alerts: cloneAlerts(alerts),
    newAlertCount: getNewAlertCount(alerts),
  }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/alerts/:id
// Payload: route param { id }
// Expected response: { alert: { id, qrCodeId, user, contact, gpsLocation, description, status, submittedAt, adminNotes, evidencePhotoUrl } }
// Purpose: return the full tamper report, including photo evidence previously uploaded by the Mobile App user.
export async function getAlertById(id) {
  await wait()

  const alert = loadAlerts().find((item) => item.id === id)

  if (!alert) {
    throw new Error('Alert not found.')
  }

  return { alert: cloneAlert(alert) }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/alerts/:id/status
// Payload: { status, adminNotes }
// Expected response: { alert, newAlertCount }
// Purpose: mark alert as Reviewed or Resolved and save admin notes.
export async function updateAlertStatus(id, payload) {
  await wait()

  const alerts = loadAlerts()
  const nextAlerts = alerts.map((alert) =>
    alert.id === id
      ? {
          ...alert,
          status: payload.status,
          adminNotes: payload.adminNotes,
        }
      : alert,
  )
  const updatedAlert = nextAlerts.find((alert) => alert.id === id)

  if (!updatedAlert) {
    throw new Error('Alert not found.')
  }

  saveAlerts(nextAlerts)

  return {
    alert: cloneAlert(updatedAlert),
    newAlertCount: getNewAlertCount(nextAlerts),
  }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/users
// Payload: none
// Expected response: { users }
// Purpose: return admin user list.
export async function getUsers() {
  await wait()

  return { users: cloneUsers(loadUsers()) }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/users/:id
// Payload: route param { id }
// Expected response: { user }
// Purpose: return one admin user profile.
export async function getUserById(id) {
  await wait()

  const user = loadUsers().find((item) => item.id === id)

  if (!user) {
    throw new Error('User not found.')
  }

  return { user: cloneUser(user) }
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/users
// Payload: { fullName, email, role, status, password, twoFactorEnabled }
// Expected response: { user }
// Purpose: create a new admin user.
export async function createUser(payload) {
  await wait()

  const users = loadUsers()
  const id = getNextUserId(users)
  const user = {
    id,
    fullName: payload.fullName.trim(),
    email: normalizeEmail(payload.email),
    role: payload.role,
    status: payload.status,
    joined: formatDate(new Date()),
    lastLogin: 'Never',
    lastIp: '-',
    qrManaged: 0,
    alertsReviewed: 0,
    twoFactorEnabled: Boolean(payload.twoFactorEnabled),
    passwordUpdatedAt: formatDateTime(new Date()),
  }

  saveUsers([user, ...users])

  return { user: cloneUser(user) }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/users/:id
// Payload: { fullName, email, role, status, twoFactorEnabled }
// Expected response: { user }
// Purpose: update user profile, role, status, and 2FA setting.
export async function updateUser(id, payload) {
  await wait()

  const users = loadUsers()
  const nextUsers = users.map((user) =>
    user.id === id
      ? {
          ...user,
          fullName: payload.fullName.trim(),
          email: normalizeEmail(payload.email),
          role: payload.role,
          status: payload.status,
          twoFactorEnabled: Boolean(payload.twoFactorEnabled),
        }
      : user,
  )
  const updatedUser = nextUsers.find((user) => user.id === id)

  if (!updatedUser) {
    throw new Error('User not found.')
  }

  saveUsers(nextUsers)

  return { user: cloneUser(updatedUser) }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/users/:id/password
// Payload: { password }
// Expected response: { success }
// Purpose: reset user password.
export async function resetUserPassword(id, payload) {
  await wait()

  const users = loadUsers()
  const userExists = users.some((user) => user.id === id)

  if (!userExists) {
    throw new Error('User not found.')
  }

  if (!payload.password || payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  const nextUsers = users.map((user) =>
    user.id === id ? { ...user, passwordUpdatedAt: formatDateTime(new Date()) } : user,
  )

  saveUsers(nextUsers)

  return { success: true }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/users/:id/status
// Payload: { status }
// Expected response: { user }
// Purpose: suspend or restore user account.
export async function updateUserStatus(id, status) {
  await wait()

  const users = loadUsers()
  const nextUsers = users.map((user) =>
    user.id === id ? { ...user, status } : user,
  )
  const updatedUser = nextUsers.find((user) => user.id === id)

  if (!updatedUser) {
    throw new Error('User not found.')
  }

  saveUsers(nextUsers)

  return { user: cloneUser(updatedUser) }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/admin/settings
// Payload: none
// Expected response: { settings: { profile, notifications } }
// Purpose: return current admin profile and notification preferences.
export async function getAdminSettings() {
  await wait()

  return { settings: cloneAdminSettings(loadAdminSettings()) }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/admin/profile
// Payload: { fullName, email, phone }
// Expected response: { profile }
// Purpose: update current admin profile.
export async function updateAdminProfile(payload) {
  await wait()

  const settings = loadAdminSettings()
  const nextSettings = {
    ...settings,
    profile: {
      ...settings.profile,
      fullName: payload.fullName.trim(),
      email: normalizeEmail(payload.email),
      phone: payload.phone.trim(),
    },
  }

  saveAdminSettings(nextSettings)

  return { profile: { ...nextSettings.profile } }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/admin/password
// Payload: { currentPassword, newPassword }
// Expected response: { success }
// Purpose: verify current password and update password.
export async function updateAdminPassword(payload) {
  await wait()

  const settings = loadAdminSettings()

  if (payload.currentPassword !== settings.security.currentPassword) {
    throw new Error('Current password is incorrect.')
  }

  if (!payload.newPassword || payload.newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters.')
  }

  const nextSettings = {
    ...settings,
    security: {
      ...settings.security,
      currentPassword: payload.newPassword,
    },
  }

  saveAdminSettings(nextSettings)

  return { success: true }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/admin/notifications
// Payload: { emailAlerts, newAlertReports }
// Expected response: { notifications }
// Purpose: update notification preferences.
export async function updateNotificationSettings(payload) {
  await wait()

  const settings = loadAdminSettings()
  const nextSettings = {
    ...settings,
    notifications: {
      ...settings.notifications,
      ...payload,
    },
  }

  saveAdminSettings(nextSettings)

  return { notifications: { ...nextSettings.notifications } }
}
