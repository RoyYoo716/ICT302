export default function InvalidResult({ result }) {
  const contentByStatus = {
    expired: {
      title: 'QR Code Expired',
      badge: 'Expired',
      message: 'This QR code is authentic, but it is no longer valid.',
      reason: 'This QR code has expired.',
    },
    invalid: {
      title: 'QR Code Invalid',
      badge: 'Invalid',
      message: 'This QR code could not be verified and is not safe to use.',
      reason: 'This code failed verification.',
    },
    suspicious: {
      title: 'Suspicious QR Code',
      badge: 'Suspicious',
      message: 'This QR code has been reported and is currently under review.',
      reason: 'This QR code is flagged as suspicious.',
    },
    blacklisted: {
      title: 'QR Code Blacklisted',
      badge: 'Blacklisted',
      message: 'This QR code has been blocked and must not be used.',
      reason: 'This QR code has been blacklisted.',
    },
  }
  const content = contentByStatus[result.status] || contentByStatus.invalid

  return (
    <section className="verification-card" aria-labelledby="invalid-title">
      <div className="result-icon result-icon--invalid" aria-hidden="true">
        <span className="warning-mark" />
      </div>

      <h1 id="invalid-title">{content.title}</h1>
      <p className="result-message">{content.message}</p>

      <dl className="details-box details-box--invalid">
        <div className="details-row">
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-badge--danger">{content.badge}</span>
          </dd>
        </div>
        <div className="details-row">
          <dt>Reason</dt>
          <dd className="details-danger-text">
            {result.reason || content.reason}
          </dd>
        </div>
      </dl>
    </section>
  )
}
