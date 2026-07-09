import {
  mockSafeResult,
  mockScanHistory,
  mockUser,
  mockWarningResult
} from "../data/mockData";

const MOCK_DELAY_MS = 350;
const localScanHistory = [];

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function login(credentials) {
  await wait();

  return {
    token: "mock-session-token",
    user: {
      ...mockUser,
      email: credentials?.email || mockUser.email
    }
  };
}

export async function register(payload) {
  await wait();

  return {
    token: "mock-session-token",
    user: {
      ...mockUser,
      name: payload?.name || mockUser.name,
      email: payload?.email || mockUser.email
    }
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
  const record = {
    id: `scan_local_${Date.now()}`,
    domain,
    url,
    status,
    scannedAt: new Date().toISOString()
  };

  localScanHistory.unshift(record);
  return record;
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

  return [...localScanHistory, ...mockScanHistory];
}

export async function getUserProfile() {
  await wait();

  return mockUser;
}

function getDomain(value) {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
