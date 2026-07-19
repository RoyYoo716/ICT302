import { File, Paths } from "expo-file-system";
import { loadSession } from "./storage";

const HISTORY_FILE_PREFIX = "vafpqr.scanHistory";

export async function saveScanHistoryRecord(scan) {
  const historyFile = await getHistoryFile();
  const history = await readHistory(historyFile);
  const requestedId = scan?.scanId || scan?.id || "";

  if (requestedId) {
    const existingRecord = history.find((record) => record.id === requestedId);
    if (existingRecord) {
      return { ...existingRecord };
    }
  }

  const verificationStatus = normalizeVerificationStatus(scan?.status);
  const url = scan?.destinationUrl || scan?.scannedValue || "";
  const record = {
    id: requestedId || createScanId(),
    domain: scan?.domain || getDomain(url) || "Unknown destination",
    url,
    status: verificationStatus === "valid" ? "safe" : "blocked",
    verificationStatus,
    scannedAt: new Date().toISOString(),
    source: scan?.source || "camera"
  };

  historyFile.write(JSON.stringify([record, ...history]));
  return { ...record };
}

export async function getScanHistory() {
  const historyFile = await getHistoryFile();
  return readHistory(historyFile);
}

export async function deleteScanHistoryRecord(id) {
  if (!id) {
    return { success: false, id };
  }

  const historyFile = await getHistoryFile();
  const history = await readHistory(historyFile);
  const nextHistory = history.filter((record) => record.id !== id);

  if (nextHistory.length !== history.length) {
    historyFile.write(JSON.stringify(nextHistory));
  }

  return { success: true, id };
}

async function getHistoryFile() {
  const session = await loadSession();
  const userId = (session?.user?.id || "anonymous").replace(/[^a-zA-Z0-9_-]/g, "_");
  return new File(Paths.document, `${HISTORY_FILE_PREFIX}.${userId}.json`);
}

async function readHistory(historyFile) {
  if (!historyFile.exists) return [];

  try {
    const value = await historyFile.text();
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isScanHistoryRecord)
      .sort((left, right) => Date.parse(right.scannedAt) - Date.parse(left.scannedAt));
  } catch {
    return [];
  }
}

function isScanHistoryRecord(record) {
  return (
    record &&
    typeof record.id === "string" &&
    typeof record.domain === "string" &&
    typeof record.url === "string" &&
    (record.status === "safe" || record.status === "blocked") &&
    typeof record.scannedAt === "string"
  );
}

function normalizeVerificationStatus(status) {
  if (status === "safe") return "valid";
  if (["valid", "expired", "invalid", "blacklisted", "suspicious"].includes(status)) {
    return status;
  }
  return "invalid";
}

function createScanId() {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getDomain(value) {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
