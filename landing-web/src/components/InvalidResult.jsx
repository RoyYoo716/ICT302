export default function InvalidResult({ result }) {
  return (
    <section className="verification-card" aria-labelledby="invalid-title">
      <div className="result-icon result-icon--invalid" aria-hidden="true">
        <span className="warning-mark" />
      </div>

      <h1 id="invalid-title">QR Code Invalid</h1>
      <p className="result-message">
        This QR code has been flagged and is not safe to use.
      </p>

      <dl className="details-box details-box--invalid">
        <div className="details-row">
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-badge--danger">Flagged</span>
          </dd>
        </div>
        <div className="details-row">
          <dt>Reason</dt>
          <dd className="details-danger-text">
            {result.reason || 'This code failed verification.'}
          </dd>
        </div>
      </dl>
    </section>
  )
}