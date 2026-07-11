import { useEffect, useMemo, useState } from 'react'
import InvalidResult from '../components/InvalidResult.jsx'
import VerifiedResult from '../components/VerifiedResult.jsx'
import VerificationError from '../components/VerificationError.jsx'
import VerificationLoading from '../components/VerificationLoading.jsx'
import { verifyQRCode } from '../services/api.js'

const requestState = {
  loading: 'loading',
  verified: 'verified',
  invalid: 'invalid',
  missingToken: 'missingToken',
  error: 'error',
}

export default function QRVerificationPage() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('token')?.trim() || ''
  }, [])

  const [state, setState] = useState({
    status: token ? requestState.loading : requestState.missingToken,
    data: null,
  })

  useEffect(() => {
    if (!token) {
      return
    }

    let isActive = true

    async function verifyToken() {
      setState({ status: requestState.loading, data: null })

      try {
        const result = await verifyQRCode(token)

        if (!isActive) {
          return
        }

        setState({
          status: result.valid ? requestState.verified : requestState.invalid,
          data: result,
        })
      } catch {
        if (!isActive) {
          return
        }

        setState({ status: requestState.error, data: null })
      }
    }

    verifyToken()

    return () => {
      isActive = false
    }
  }, [token])

  return (
    <main className="landing-shell" aria-live="polite">
      {state.status === requestState.loading && <VerificationLoading />}

      {state.status === requestState.verified && state.data && (
        <VerifiedResult result={state.data} />
      )}

      {state.status === requestState.invalid && state.data && (
        <InvalidResult result={state.data} />
      )}

      {state.status === requestState.missingToken && (
        <VerificationError title="Invalid verification link" />
      )}

      {state.status === requestState.error && (
        <VerificationError
          title="Unable to verify this QR code."
          message="Please try again later."
        />
      )}
    </main>
  )
}
