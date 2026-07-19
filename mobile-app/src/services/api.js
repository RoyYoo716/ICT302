import { clearSession, loadSession } from "./storage";
import { loadLocalAvatarUri } from "./avatarStorage";
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

export async function requestPasswordReset(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: { email: (email || "").trim().toLowerCase() }
  });
}

export async function resetPassword({ token, newPassword }) {
  return request("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword }
  });
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

export async function getUserProfile() {
  const session = await loadSession();
  if (!session?.user) return null;

  const avatarUri = await loadLocalAvatarUri(session.user.id);
  return { ...session.user, avatarUri };
}

export async function updateUserProfile(profileData) {
  return request("/auth/profile", {
    method: "PATCH",
    body: {
      fullName: profileData?.fullName?.trim(),
      phoneNumber: profileData?.phoneNumber?.trim() || null
    }
  });
}

export async function changePassword(currentPassword, newPassword) {
  return request("/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword }
  });
}

function getDomain(value) {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
