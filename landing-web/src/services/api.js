const LOCAL_PREVIEW_DELAY_MS = 350

const waitForPreviewDelay = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, LOCAL_PREVIEW_DELAY_MS)
  })

/**
 * QR verification API contract.
 *
 * Provisional endpoint — to be confirmed with backend team.
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

  // Temporary local preview only.
  // Replace this function body when the Java backend endpoint is available.
  if (token === 'safe-demo') {
    return {
      valid: true,
      qrId: 'QR-001',
      destinationUrl: 'https://shop.com',
      status: 'Active',
      expiryDate: '2026-07-01',
      reason: null,
    }
  }

  // Temporary local preview only.
  // Replace this function body when the Java backend endpoint is available.
  if (token === 'invalid-demo') {
    return {
      valid: false,
      qrId: 'QR-002',
      destinationUrl: null,
      status: 'Blacklisted',
      expiryDate: null,
      reason: 'Phishing attempt detected',
    }
  }

  throw new Error('Unable to verify QR code with the local preview service.')
}
