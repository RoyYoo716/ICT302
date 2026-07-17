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

// ============================================================
// Real backend plumbing — replaces the localStorage simulator
// step by step. Session shape becomes { token, admin }.
// ============================================================

// Read the JWT saved at login. Returns null when logged out.
function getAuthToken() {
  const session = readSession()
  return session?.token ?? null
}

// One shared request function — every real API call goes through here.
// - Prefixes '/api' (works in dev via Vite proxy, in prod via same-origin)
// - Attaches Authorization: Bearer <token> automatically
// - On 401: clears the dead session and sends the user back to login
// - On error: throws with the backend's { error } message
async function request(path, { method = 'GET', body, headers } = {}) {
  const token = getAuthToken()

  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => null)

  // A 401 only means "session expired" if we actually sent a token.
  // Logged-out calls (login / register / forgot / reset) that return 401
  // are normal auth failures — let the backend's message surface instead
  // of hijacking them into a redirect.
  if (response.status === 401 && token) {
    removeStorage(SESSION_KEY)
    window.location.assign('/login')
    throw new Error('Session expired. Please sign in again.')
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`)
  }

  return data
}

// --- getMetrics adapter: backend numbers → UI shapes ---------------
// The backend sends neutral facts (counts, ISO-timestamped buckets).
// Everything presentational (labels, titles, ticks, colors) is built
// here so timezone formatting happens in the user's browser.

// Static card metadata — order and styling stay frontend-owned.
const METRIC_CARD_META = [
  { id: 'totalQrCodes', backendKey: 'totalQrCodes', label: 'Total QR Codes', icon: 'qr', tone: 'blue' },
  { id: 'activeQrCodes', backendKey: 'activeQrCodes', label: 'Active QR Codes', icon: 'check', tone: 'green' },
  { id: 'blacklisted', backendKey: 'blacklistedQrCodes', label: 'Blacklisted', icon: 'warning', tone: 'red' },
  { id: 'suspicious', backendKey: 'suspiciousQrCodes', label: 'Suspicious', icon: 'shield', tone: 'amber' },
  { id: 'alertReports', backendKey: 'totalAlerts', label: 'Alert Reports', icon: 'bell', tone: 'rose' },
  { id: 'totalScans', backendKey: 'totalScans', label: 'Total Scans', icon: 'eye', tone: 'sky' },
]

const STATUS_DONUT_META = [
  { key: 'active', label: 'Active', color: '#059669' },
  { key: 'suspicious', label: 'Suspicious', color: '#f59e0b' },
  { key: 'blacklisted', label: 'Blacklisted', color: '#dc2626' },
  { key: 'expired', label: 'Expired', color: '#6b7280' },
]

// Round a data max up to a "nice" chart ceiling, then emit 5 ticks.
function buildTicks(dataMax) {
  const max = Math.max(dataMax, 4) // avoid a 0-height chart
  const magnitude = 10 ** Math.floor(Math.log10(max))
  const nice = Math.ceil(max / magnitude) * magnitude
  return {
    maxValue: nice,
    ticks: [nice, nice * 0.75, nice * 0.5, nice * 0.25, 0].map(Math.round),
  }
}

// Format a bucket's ISO start into a chart label, per range.
function bucketLabel(iso, range) {
  const d = new Date(iso) // rendered in the browser's local timezone
  if (range === '1h' || range === '24h') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (range === '1w') {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) // 1M
}

const RANGE_TITLES = {
  '1h': { title: 'Scan Volume - Last Hour', subtitle: 'Last hour (5-minute buckets)' },
  '24h': { title: 'Scan Volume - Last 24 Hours', subtitle: 'Last 24 hours (2-hour buckets)' },
  '1w': { title: 'Scan Volume - Last 7 Days', subtitle: 'Last 7 days' },
  '1M': { title: 'Scan Volume - Last 30 Days', subtitle: 'Last 30 days (3-day buckets)' },
}

function adaptScanVolume(backendVolume) {
  const out = {}
  for (const range of Object.keys(RANGE_TITLES)) {
    const buckets = backendVolume[range] ?? []
    const data = buckets.map((b, i) => {
      const label = bucketLabel(b.start, range)
      return {
        label,
        // 1h: label every 3rd bucket to avoid crowding; others: all.
        ...(range !== '1h' || i % 3 === 0 ? { displayLabel: label } : {}),
        scans: b.scans,
      }
    })
    const { maxValue, ticks } = buildTicks(Math.max(0, ...data.map((d) => d.scans)))
    out[range] = { ...RANGE_TITLES[range], maxValue, ticks, data }
  }
  return out
}

// "2m ago" style relative time, computed in the browser.
function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ActivityLog event type → card tone. Unknown types fall back to info.
const ACTIVITY_TONES = {
  status_changed: 'warning',
  alert_created: 'danger',
  alert_resolved: 'info',
  alert_reopened: 'danger',
}

// GET /api/admin/activity — Recent Activity feed (first page).
export async function getRecentActivity({ page = 1, limit = 8 } = {}) {
  const res = await request(`/admin/activity?page=${page}&limit=${limit}`)
  return {
    activities: res.data.map((a) => ({
      id: a.id,
      message: a.message,
      time: timeAgo(a.createdAt),
      tone: ACTIVITY_TONES[a.type] ?? 'info',
    })),
    pagination: res.pagination,
  }
}

// --- QR Codes adapters ------------------------------------------

// Backend statuses are lowercase ('active'); the UI renders 'Active'.
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// Backend QR row → the shape QRCodeTable renders.
function adaptQRCode(qr) {
  const expires = qr.expiresAt ? new Date(qr.expiresAt) : null
  return {
    id: qr.id,
    label: qr.label,
    destinationUrl: qr.destinationUrl,
    status: capitalize(qr.status),
    expiryDate: expires ? expires.toISOString().slice(0, 10) : '',
    expiresAt: expires ? expires.toLocaleString() : '',
    scans: qr.scanCount ?? 0,
    alerts: qr.alertCount ?? 0,
    createdAt: qr.createdAt,
  }
}

// --- Alerts adapters --------------------------------------------

// gpsLat/gpsLng numbers → the "1.3521°N, 103.8198°E" display string.
function formatGps(lat, lng) {
  if (lat == null || lng == null) return ''
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${ns}, ${Math.abs(lng).toFixed(4)}°${ew}`
}

// Backend Alert row → the shape the alerts table and modal render.
function adaptAlert(a) {
  return {
    id: a.id,
    qrCodeId: a.qrCodeId,
    qrLabel: a.QrCode?.label ?? '',
    userName: a.reporterName || 'Anonymous',
    contact: a.contactInfo || '',
    gpsLocation: formatGps(a.gpsLat, a.gpsLng),
    description: a.description,
    status: capitalize(a.status),
    submittedAt: a.createdAt ? new Date(a.createdAt).toLocaleString() : '',
    adminNotes: '', // not a backend feature — kept so the modal doesn't break
    evidencePhotoUrl: a.photoUrl || '',
    evidencePhotoFileName: a.photoUrl ? a.photoUrl.split('/').pop() : '',
  }
}

// --- Users adapters ---------------------------------------------

// Backend User row → the shape the users table renders.
// Fields with no backend counterpart (status, 2FA, stats) are
// deliberately absent — their columns are removed, not faked.
function adaptUser(u) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phoneNumber: u.phoneNumber || '',
    role: capitalize(u.role), // 'admin' → 'Admin'
    joined: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : '',
    lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never',
  }
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

// POST /api/auth/login — real backend call.
// Backend returns { token, user }; we store both, return { admin } as before.
export async function loginAdmin({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email: normalizeEmail(email), password },
  })
  saveSession({ token: data.token, admin: data.user })
  return { admin: data.user }
}

// POST /api/auth/register — backend has NO role field; every new
// account is role 'user'. The UI's role input is intentionally dropped.
export async function registerAdmin({ fullName, email, phone, password }) {
  const user = await request('/auth/register', {
    method: 'POST',
    body: {
      fullName: fullName.trim(),
      email: normalizeEmail(email),
      phoneNumber: phone?.trim() || undefined,
      password,
    },
  })
  return { admin: user }
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/auth/logout
// Payload: none
// Expected response: { success }
// Purpose: clear the current admin session.
// JWT is stateless — logging out is purely client-side.
export async function logoutAdmin() {
  removeStorage(SESSION_KEY)
  return { success: true }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/auth/me
// Payload: none
// Expected response: admin profile or null
// Purpose: return the current authenticated admin profile.
// Session restore: read the user saved at login. No server round-trip.
export async function getCurrentAdmin() {
  const session = readSession()
  return session?.admin ?? null
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/metrics
// Payload: none
// Expected response: dashboard metric cards, scan volume, status distribution, and recent activity.
// Purpose: return dashboard metric cards, scan volume chart data, QR status distribution, and recent activity.
export async function getMetrics() {
  const m = await request('/admin/metrics')
  return {
    metricCards: METRIC_CARD_META.map(({ backendKey, ...meta }) => ({
      ...meta,
      value: (m.statCards[backendKey]?.value ?? 0).toLocaleString(),
    })),
    scanVolume: adaptScanVolume(m.scanVolume),
    statusDistribution: STATUS_DONUT_META.map(({ key, label, color }) => ({
      label,
      color,
      value: m.statusDonut[key] ?? 0,
    })),
    recentActivity: [],
  }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/qr
// Payload: none
// Expected response: { qrCodes }
// Purpose: return QR code list for Admin Web.
export async function getQRCodes({ search = '', status = 'All', page = 1, limit = 7 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search.trim()) params.set('search', search.trim())
  if (status && status !== 'All') params.set('status', status.toLowerCase())

  const res = await request(`/admin/qrcodes?${params}`)
  return {
    qrCodes: res.data.map(adaptQRCode),
    pagination: res.pagination,
    summary: res.summary,
  }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/qr/:id
// Payload: route param { id }
// Expected response: { qrCode }
// Purpose: return one QR code detail.
export async function getQRCodeById(id) {
  const qr = await request(`/admin/qrcodes/${id}`)
  return {
    qrCode: {
      ...adaptQRCode({ ...qr, scanCount: qr.totalScans, alertCount: qr.alerts?.length ?? 0 }),
      qrImageUrl: qr.qrImage,     // backend regenerates the PNG on the fly
      scanHistory: qr.scanHistory, // available for later use (last 50 scans)
    },
  }
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/qr/generate
// Payload: { destinationUrl, expiryDuration, label }
// Expected response: { qrCode }
// Purpose: generate new secure QR code.
export async function generateQRCode({ destinationUrl, expiryDuration, label }) {
  const qr = await request('/qr/generate', {
    method: 'POST',
    body: {
      destinationUrl: destinationUrl.trim(),
      label: label?.trim() || undefined,
      expiryHours: Number(expiryDuration || 24),
    },
  })
  return {
    qrCode: {
      ...adaptQRCode({ ...qr, scanCount: 0, alertCount: 0 }),
      verifyUrl: qr.verifyUrl,
      qrImageUrl: qr.qrImage, // backend: qrImage → UI: qrImageUrl
    },
  }
}

// Provisional endpoint — to be confirmed with backend team.
// PATCH /api/qr/:id/status
// Payload: { status }
// Expected response: { qrCode }
// Purpose: activate or blacklist QR code.
export async function updateQRCodeStatus(id, status) {
  const qr = await request(`/admin/qrcodes/${id}`, {
    method: 'PATCH',
    body: { status: status.toLowerCase() },
  })
  return { qrCode: adaptQRCode(qr) }
}

// Provisional endpoint — to be confirmed with backend team.
// GET /api/qr/export
// Payload: none
// Expected response: text/csv containing all QR code records.
// Purpose: export all QR Code records as a CSV file; backend should return all records, not one page.
export async function exportQRCodesCsv() {
  const token = getAuthToken()
  const response = await fetch('/api/admin/qrcodes/export', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error(`CSV export failed (${response.status})`)
  }
  return {
    blob: await response.blob(),
    fileName: `qr-codes-${new Date().toISOString().slice(0, 10)}.csv`,
  }
}

// GET /api/admin/alerts — server-side pagination + status filter.
export async function getAlerts({ status = 'All', page = 1, limit = 7 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status && status !== 'All') params.set('status', status.toLowerCase())
  const res = await request(`/admin/alerts?${params}`)
  return {
    alerts: res.data.map(adaptAlert),
    pagination: res.pagination,
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

// PATCH /api/admin/alerts/:id — resolve or reopen.
export async function updateAlertStatus(id, payload) {
  const status = (typeof payload === 'string' ? payload : payload?.status || '')
  const alert = await request(`/admin/alerts/${id}`, {
    method: 'PATCH',
    body: { status: status.toLowerCase() },
  })
  return { alert: adaptAlert(alert) }
}

// GET /api/admin/users — server-side search + role filter + pagination.
export async function getUsers({ search = '', role = 'All', page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search.trim()) params.set('search', search.trim())
  if (role && role !== 'All') params.set('role', role.toLowerCase())
  const res = await request(`/admin/users?${params}`)
  return {
    users: res.data.map(adaptUser),
    pagination: res.pagination,
  }
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

// PATCH /api/admin/users/:id — role change only.
// The backend enforces the last-admin guard; its error message
// ('Cannot demote the last remaining admin') surfaces to the UI.
export async function updateUser(id, payload) {
  const role = (typeof payload === 'string' ? payload : payload?.role || '')
  const user = await request(`/admin/users/${id}`, {
    method: 'PATCH',
    body: { role: role.toLowerCase() },
  })
  return { user: adaptUser(user) }
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
