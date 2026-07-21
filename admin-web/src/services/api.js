const SESSION_KEY = 'vafpqr.admin.session'

// ============================================================
// Real backend plumbing — replaces the localStorage simulator
// step by step. Session shape becomes { token, admin }.
// ============================================================

// Read the API URL dynamically from Vite's environment config
const API_BASE_URL = import.meta.env.VITE_API_URL || ''; 

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

  // Change this line to use standard quotes and a plus sign
  const response = await fetch(API_BASE_URL + '/api' + path, {
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
    clearSession()
    window.location.assign('/login')
    throw new Error('Session expired. Please sign in again.')
  }

  if (response.status === 403 && token && data?.error === 'Admin access required') {
    clearSession()
    window.location.assign('/login')
    throw new Error('Your admin access has changed. Please sign in again.')
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
  // Preserve the display tone for historical records; reopening is no longer allowed.
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
  const creates = qr.createdAt ? new Date(qr.createdAt) : null
  return {
    id: qr.id,
    label: qr.label,
    destinationUrl: qr.destinationUrl,
    status: capitalize(qr.status),
    expiryDate: expires ? expires.toISOString().slice(0, 10) : '',
    expiresAt: expires ? expires.toLocaleString() : '',
    scans: qr.scanCount ?? 0,
    alerts: qr.alertCount ?? 0,
    creationDate: creates ? creates.toISOString().slice(0, 10) : '',
    createdAt: qr.createdAt,
    createdBy: qr.createdBy
      ? {
          id: qr.createdBy.id,
          fullName: qr.createdBy.fullName || '',
          email: qr.createdBy.email || '',
        }
      : null,
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

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function getSessionStorage() {
  return globalThis.sessionStorage || globalThis.window?.sessionStorage || null
}

function saveSession(session) {
  const storage = getSessionStorage()
  if (!storage) return

  try {
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    return
  }

  // Remove the former shared-tab session after the migration.
  try {
    globalThis.localStorage?.removeItem(SESSION_KEY)
  } catch {
    // The tab-scoped session is already saved; legacy cleanup is best-effort.
  }
}

function readSession() {
  const storage = getSessionStorage()
  if (!storage) return null

  try {
    return JSON.parse(storage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function clearSession() {
  try {
    getSessionStorage()?.removeItem(SESSION_KEY)
  } catch {
    // Redirect/logout must continue even if browser storage is unavailable.
  }

  try {
    globalThis.localStorage?.removeItem(SESSION_KEY)
  } catch {
    // Legacy cleanup is best-effort.
  }
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

// POST /api/auth/forgot-password — returns the reset link used by
// the in-app reset-password screen.
export async function requestPasswordReset(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: { email: normalizeEmail(email) },
  })
}

// POST /api/auth/reset-password — consumes the single-use token.
export async function resetPassword({ token, newPassword }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  })
}

// Provisional endpoint — to be confirmed with backend team.
// POST /api/auth/logout
// Payload: none
// Expected response: { success }
// Purpose: clear the current admin session.
// JWT is stateless — logging out is purely client-side.
export async function logoutAdmin() {
  clearSession()
  return { success: true }
}

export async function getCurrentAdmin() {
  const session = readSession()
  if (!session?.token) return null

  const user = await request('/auth/me')
  if (user.role !== 'admin') {
    clearSession()
    return null
  }

  saveSession({ ...session, admin: user })
  return user
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
      ...adaptQRCode(qr),
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
  // Change this line to use standard quotes and a plus sign
  const response = await fetch(API_BASE_URL + '/api/admin/qrcodes/export', {
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
    summary: res.summary,
  }
}

// PATCH /api/admin/alerts/:id — resolve a New alert.
export async function resolveAlert(id) {
  const response = await request(`/admin/alerts/${id}`, {
    method: 'PATCH',
    body: { status: 'resolved' },
  })
  return {
    alert: adaptAlert(response.alert),
    summary: response.summary,
  }
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

// DELETE /api/admin/users/:id — permanent.
export async function deleteUser(id) {
  return request(`/admin/users/${id}`, { method: 'DELETE' })
}

// POST /api/admin/users — admin creates an account directly.
export async function createUser(payload) {
  const user = await request('/admin/users', {
    method: 'POST',
    body: {
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phone || undefined,
      password: payload.password,
      role: (payload.role || 'user').toLowerCase(),
    },
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
