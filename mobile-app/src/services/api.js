import { loadSession, clearSession } from "./storage";
import { File } from "expo-file-system";
// ---- Real backend plumbing ---------------------------------------
// Dev + prod both talk to the live Render backend. If you ever need a
// local backend, swap BASE_URL to "http://<your-PC-LAN-IP>:3000".
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Identifies us as the dedicated app — the server branches on this
// User-Agent to return JSON instead of the landing page.
const APP_USER_AGENT = "SecureQRApp/1.0";

async function request(path, { method = "GET", body, headers } = {}) {
  const session = await loadSession();
  const token = session?.token || null;

  const response = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      "User-Agent": APP_USER_AGENT,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  // Same rule as the web: a 401 only means "session expired"
  // if we actually sent a token.
  if (response.status === 401 && token) {
    await clearSession();
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }

  return data;
}


import {
  mockNotificationPreferences,
  mockSafeResult,
  mockScanHistory,
  mockSecuritySettings,
  mockUser,
  mockWarningResult
} from "../data/mockData";

const MOCK_DELAY_MS = 350;
const localScanHistory = [];
const deletedScanHistoryIds = new Set();
let mutableUserProfile = { ...mockUser };
let mockCurrentPassword = "password123";
let mutableSecuritySettings = { ...mockSecuritySettings };
let mutableNotificationPreferences = { ...mockNotificationPreferences };

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function login(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: {
      email: (credentials?.email || "").trim().toLowerCase(),
      password: credentials?.password,
    },
  });
  // Backend returns { token, user } — exactly what AuthContext saves.
}

export async function register(payload) {
  const user = await request("/auth/register", {
    method: "POST",
    body: {
      fullName: payload.fullName,
      email: (payload.email || "").trim().toLowerCase(),
      phoneNumber: payload.phoneNumber || undefined,
      password: payload.password,
    },
  });
  return user;
}

export async function socialSignIn(provider, profile) {
  await wait();

  const normalizedProvider = provider === "apple" ? "apple" : "google";

  mutableUserProfile = {
    ...mutableUserProfile,
    name: profile?.name?.trim() || mutableUserProfile.name,
    email: profile?.email?.trim() || mutableUserProfile.email,
    authProvider: normalizedProvider
  };

  return {
    token: `mock-${normalizedProvider}-session-token`,
    user: { ...mutableUserProfile }
  };
}

export async function verifyQRCode(payload) {
  const value = payload?.value || "";

  // Extract the token from the scanned URL. Any QR without a token
  // param is not one of ours — the backend has nothing to verify.
  const match = value.match(/[?&]token=([^&\s]+)/);
  if (!match) {
    return {
      status: "invalid",
      reason: "Not a secure QR code issued by this system.",
      destinationUrl: null,
      domain: null,
      qrId: null,
      label: null,
    };
  }

  const result = await request(`/qr/verify?token=${encodeURIComponent(match[1])}`);

  // Adapt the backend contract to what the screens need.
  const destinationUrl = result.destinationUrl || result.qr?.destinationUrl || null;
  return {
    status: result.status,               // valid | expired | invalid | blacklisted | suspicious
    reason: result.reason || null,
    destinationUrl,
    domain: destinationUrl ? getDomain(destinationUrl) : null,
    qrId: result.qr?.id || null,          // needed for the tamper report (Step 3)
    label: result.qr?.label || null,
  };
}


export async function saveScanHistoryRecord(scan) {
  await wait(100);

  const url = scan?.destinationUrl || scan?.scannedValue || "";
  const domain = scan?.domain || getDomain(url) || "Unknown destination";
  const status = scan?.status === "blocked" ? "blocked" : "safe";
  const requestedId = scan?.scanId || scan?.id || "";
  const duplicate = localScanHistory.find((record) => {
    if (requestedId && record.id === requestedId) return true;
    return !requestedId && record.url === url && record.status === status;
  });

  if (duplicate) {
    return { ...duplicate };
  }

  const record = {
    id: requestedId || `scan_local_${Date.now()}`,
    domain,
    url,
    status,
    scannedAt: new Date().toISOString(),
    source: scan?.source || "camera"
  };

  deletedScanHistoryIds.delete(record.id);
  localScanHistory.unshift(record);
  return { ...record };
}

export async function deleteScanHistoryRecord(id) {
  await wait(100);

  if (!id) {
    return { success: false, id };
  }

  deletedScanHistoryIds.add(id);
  const localIndex = localScanHistory.findIndex((record) => record.id === id);

  if (localIndex >= 0) {
    localScanHistory.splice(localIndex, 1);
  }

  return { success: true, id };
}

export async function submitTamperReport(report) {
  const form = new FormData();
  form.append("qrCodeId", report.qrCodeId);
  if (report.description) form.append("description", report.description);
  if (report.reporterName) form.append("reporterName", report.reporterName);
  if (report.contactInfo) form.append("contactInfo", report.contactInfo);
  if (report.location) {
    form.append("gpsLat", String(report.location.latitude));
    form.append("gpsLng", String(report.location.longitude));
  }
  if (report.photo?.uri) {
    // SDK 54+ fetch only accepts real Blob/File parts in FormData.
    // expo-file-system's File implements the Blob interface, so it can
    // wrap the picker's cached file and stream it as the "photo" part.
    const file = new File(report.photo.uri);
    form.append("photo", file);
  }

  // NOTE: no Content-Type header — fetch must generate the multipart
  // boundary itself. Setting it manually breaks multer parsing.
  const response = await fetch(`${BASE_URL}/api/alert/report`, {
    method: "POST",
    headers: { "User-Agent": APP_USER_AGENT },
    body: form,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Report failed (${response.status})`);
  }
  return data;
}

export async function getScanHistory() {
  await wait();

  return [...localScanHistory, ...mockScanHistory].filter(
    (record) => !deletedScanHistoryIds.has(record.id)
  );
}

export async function getUserProfile() {
  const session = await loadSession();
  return session?.user ?? null;
}

export async function updateUserProfile(profileData) {
  await wait();

  mutableUserProfile = {
    ...mutableUserProfile,
    ...profileData
  };

  return { ...mutableUserProfile };
}

export async function changePassword(currentPassword, newPassword) {
  await wait();

  if (currentPassword !== mockCurrentPassword) {
    const error = new Error("Current password is incorrect.");
    error.code = "INVALID_CURRENT_PASSWORD";
    throw error;
  }

  if (newPassword === currentPassword) {
    const error = new Error("New password must be different from the current password.");
    error.code = "PASSWORD_REUSED";
    throw error;
  }

  mockCurrentPassword = newPassword;

  return {
    success: true,
    message: "Password updated successfully"
  };
}

export async function getSecuritySettings() {
  await wait();

  return { ...mutableSecuritySettings };
}

export async function updateSecuritySettings(settings) {
  await wait(120);

  mutableSecuritySettings = {
    ...mutableSecuritySettings,
    ...settings
  };

  return { ...mutableSecuritySettings };
}

export async function getNotificationPreferences() {
  await wait();

  return { ...mutableNotificationPreferences };
}

export async function updateNotificationPreferences(preferences) {
  await wait(120);

  mutableNotificationPreferences = {
    ...mutableNotificationPreferences,
    ...preferences
  };

  return { ...mutableNotificationPreferences };
}

function getDomain(value) {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
