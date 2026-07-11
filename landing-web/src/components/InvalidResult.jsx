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
          <dt>QR ID</dt>
          <dd>{result.qrId || 'Unavailable'}</dd>
        </div>
        <div className="details-row">
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-badge--danger">
              {result.status || 'Unavailable'}
            </span>
          </dd>
        </div>
        <div className="details-row">
          <dt>Reason</dt>
          <dd className="details-danger-text">
            {result.reason || 'Unavailable'}
          </dd>
        </div>
      </dl>

      <button className="secondary-action" type="button">
        Report This QR Code
      </button>
    </section>
  )
}
