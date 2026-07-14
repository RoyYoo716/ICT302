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
  await wait();

  mutableUserProfile = {
    ...mutableUserProfile,
    email: credentials?.email || mutableUserProfile.email
  };

  return {
    token: "mock-session-token",
    user: { ...mutableUserProfile }
  };
}

export async function register(payload) {
  await wait();

  mutableUserProfile = {
    ...mutableUserProfile,
    name: payload?.name || mutableUserProfile.name,
    email: payload?.email || mutableUserProfile.email
  };

  return {
    token: "mock-session-token",
    user: { ...mutableUserProfile }
  };
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
  await wait(700);

  const value = payload?.value || "";
  const domain = getDomain(value);
  const looksUnsafe = /amaz0n|phishing|blocked|malware|free-iphone/i.test(value);

  if (looksUnsafe) {
    return {
      ...mockWarningResult,
      destinationUrl: value || mockWarningResult.destinationUrl,
      domain: domain || mockWarningResult.domain
    };
  }

  return {
    ...mockSafeResult,
    destinationUrl: value || mockSafeResult.destinationUrl,
    domain: domain || mockSafeResult.domain
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
  await wait(500);

  return {
    id: `report_${Date.now()}`,
    status: "submitted",
    receivedAt: new Date().toISOString(),
    report
  };
}

export async function getScanHistory() {
  await wait();

  return [...localScanHistory, ...mockScanHistory].filter(
    (record) => !deletedScanHistoryIds.has(record.id)
  );
}

export async function getUserProfile() {
  await wait();

  return { ...mutableUserProfile };
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
