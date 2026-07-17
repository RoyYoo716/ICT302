const SESSION_KEY = 'vafpqr.admin.session'
const REGISTERED_ADMINS_KEY = 'vafpqr.admin.registeredAdmins'
const QR_CODES_KEY = 'vafpqr.admin.qrCodes'
const ALERTS_KEY = 'vafpqr.admin.alerts'
const USERS_KEY = 'vafpqr.admin.users'

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

// Session admin → the shape AccountProfileCard renders/edits.
function adaptProfile(u) {
  return {
    fullName: u.fullName,
    email: u.email,
    phone: u.phoneNumber || '',
    role: capitalize(u.role),
  }
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

function getNewAlertCount(alerts) {
  return alerts.filter((alert) => alert.status === 'New').length
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

// POST /api/auth/login — real backend call.
// Backend returns { token, user }; we store both, return { admin } as before.
export async function loginAdmin({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email: normalizeEmail(email), password },
  })

  // This dashboard is admin-only. Regular accounts are valid for the
  // mobile app, but must not get a web session.
  if (data.user?.role !== 'admin') {
    throw new Error('This account does not have admin access.')
  }
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

// Settings data lives in the session — no server round-trip.
// Page expects { settings: { profile } }.
export async function getAdminSettings() {
  const session = readSession()
  return {
    settings: { profile: session?.admin ? adaptProfile(session.admin) : null },
  }
}

// PATCH /api/auth/profile — updates DB, then refreshes the stored
// session so the rest of the UI stays in sync.
export async function updateAdminProfile(payload) {
  const user = await request('/auth/profile', {
    method: 'PATCH',
    body: { fullName: payload.fullName, phoneNumber: payload.phone },
  })
  const session = readSession()
  if (session) saveSession({ ...session, admin: { ...session.admin, ...user } })
  return { profile: adaptProfile(user) }
}

// PATCH /api/auth/password — backend verifies the current password.
export async function updateAdminPassword(payload) {
  return request('/auth/password', {
    method: 'PATCH',
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    },
  })
}