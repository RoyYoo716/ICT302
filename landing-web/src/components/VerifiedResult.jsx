function isSafeDestinationUrl(destinationUrl) {
  return (
    typeof destinationUrl === 'string' &&
    (destinationUrl.startsWith('http://') ||
      destinationUrl.startsWith('https://'))
  )
}

export default function VerifiedResult({ result }) {
  const canContinue = result.valid === true && isSafeDestinationUrl(result.destinationUrl)

  function handleContinue() {
    if (!canContinue) {
      return
    }

    window.location.assign(result.destinationUrl)
  }

  return (
    <section className="verification-card" aria-labelledby="verified-title">
      <div className="result-icon result-icon--verified" aria-hidden="true">
        <span className="checkmark" />
      </div>

      <h1 id="verified-title">QR Code Verified</h1>
      <p className="result-message">
        This QR code is authentic and safe to proceed.
      </p>

      <dl className="details-box details-box--verified">
        <div className="details-row">
          <dt>Destination</dt>
          <dd className="details-url">{result.destinationUrl || 'Unavailable'}</dd>
        </div>
        <div className="details-row">
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-badge--active">
              {result.status || 'Unavailable'}
            </span>
          </dd>
        </div>
        <div className="details-row">
          <dt>Expires</dt>
          <dd>{result.expiryDate || 'Unavailable'}</dd>
        </div>
      </dl>

      <button
        className="primary-action"
        type="button"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue to Destination <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}
