import { useMemo } from 'react'
import InvalidResult from '../components/InvalidResult.jsx'
import VerifiedResult from '../components/VerifiedResult.jsx'
import VerificationError from '../components/VerificationError.jsx'

// This page DISPLAYS a verify result passed via query params.
// Verification itself happens server-side at /api/qr/verify before
// the browser is redirected here. This page never calls the API.
export default function QRVerificationPage() {
  const result = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')?.toLowerCase()
    const allowedStatuses = ['valid', 'expired', 'invalid', 'suspicious', 'blacklisted']

    if (!allowedStatuses.includes(status)) {
      return null
    }

    return {
      status,
      reason: params.get('reason'),
      apkUrl: params.get('apk'),
    }
  }, [])

  if (!result) {
    return (
      <main className="landing-shell">
        <VerificationError title="Invalid verification link" />
      </main>
    )
  }

  return (
    <main className="landing-shell" aria-live="polite">
      {result.status === 'valid' ? (
        <VerifiedResult result={result} />
      ) : (
        <InvalidResult result={result} />
      )}
    </main>
  )
}
