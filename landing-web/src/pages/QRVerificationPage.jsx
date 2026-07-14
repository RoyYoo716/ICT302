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
    if (!params.has('valid')) {
      return null
    }
    return {
      valid: params.get('valid') === 'true',
      reason: params.get('reason'),
      destinationUrl: null, // browser users never see the destination
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
      {result.valid ? (
        <VerifiedResult result={result} />
      ) : (
        <InvalidResult result={result} />
      )}
    </main>
  )
}