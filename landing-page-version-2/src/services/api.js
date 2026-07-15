const LOCAL_PREVIEW_DELAY_MS = 350

const localPreviewResults = {
  'safe-demo': {
    valid: true,
    qrId: 'QR-001',
    destinationUrl: 'https://shop.com',
    status: 'Active',
    expiryDate: '2026-07-01',
    reason: null,
  },
  'valid-demo': {
    valid: true,
    qrId: 'QR-001',
    destinationUrl: 'https://shop.com',
    status: 'Active',
    expiryDate: '2026-07-01',
    reason: null,
  },
  'invalid-demo': {
    valid: false,
    qrId: 'QR-002',
    destinationUrl: null,
    status: 'Blacklisted',
    expiryDate: null,
    reason: 'Phishing attempt detected',
  },
  'suspicious-demo': {
    valid: false,
    qrId: 'QR-003',
    destinationUrl: null,
    status: 'Suspicious',
    expiryDate: null,
    reason: 'Unusual redirect behaviour detected',
  },
  'expired-demo': {
    valid: false,
    qrId: 'QR-004',
    destinationUrl: null,
    status: 'Expired',
    expiryDate: '2026-07-01',
    reason: null,
  },
}

const waitForPreviewDelay = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, LOCAL_PREVIEW_DELAY_MS)
  })

/**
 * QR verification API contract.
 *
 * Provisional endpoint - to be confirmed with backend team.
 *
 * Method: GET
 * Endpoint: /api/qr/verify?token={token}
 * Request parameter: token, read from the public /verify URL query string.
 * Purpose: verify the QR token and return whether the scanned code may proceed.
 * Expected response:
 * {
 *   valid: boolean,
 *   qrId: string | null,
 *   destinationUrl: string | null,
 *   status: "Active" | "Blacklisted" | "Expired" | "Invalid" | "Suspicious",
 *   expiryDate: string | null,
 *   reason: string | null
 * }
 */
export async function verifyQRCode(token) {
  await waitForPreviewDelay()

  if (import.meta.env.DEV && localPreviewResults[token]) {
    return localPreviewResults[token]
  }

  throw new Error('Unable to verify QR code with the local preview service.')
}
