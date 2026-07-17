import { useEffect, useState } from 'react'
import AlertStatusBadge from './AlertStatusBadge.jsx'

function EmptyImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3.5h9l3 3v14H6z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M15 3.5V7h3M8.5 16l2.5-3 2 2 1.5-1.5 2 2.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="10" cy="10" fill="currentColor" r="1.1" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5h5v5M19 5l-8 8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function AlertDetailModal({
  alert,
  isSaving,
  onClose,
  onOpenQRCode,
  onStatusUpdate,
}) {
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [alert])

  async function handleResolveAlert() {
    setError('')
    try {
      await onStatusUpdate('Resolved', '')
    } catch (err) {
      setError(err.message || 'Failed to resolve the alert.')
    }
  }

  return (
    <div className="alert-modal-backdrop" role="presentation">
      <section
        aria-labelledby="alert-detail-title"
        aria-modal="true"
        className="alert-detail-modal"
        role="dialog"
      >
        <header className="alert-modal-header">
          <div>
            <h2 id="alert-detail-title">Alert Detail</h2>
            <span className="alert-modal-id">{alert.id}</span>
            <AlertStatusBadge status={alert.status} />
          </div>
          <button
            aria-label="Close alert detail"
            className="alert-modal-close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <div className="alert-modal-body">
          <section className="alert-evidence-panel" aria-label="Evidence Photos">
            <h3>Evidence Photos</h3>
            {alert.evidencePhotoUrl ? (
              <div className="alert-evidence-frame">
                <img
                  alt={alert.evidencePhotoFileName || `${alert.id} evidence photo`}
                  src={alert.evidencePhotoUrl}
                />
              </div>
            ) : (
              <div className="alert-evidence-empty">
                <EmptyImageIcon />
                <p>No evidence photo available.</p>
              </div>
            )}
          </section>

          <section className="alert-info-panel" aria-label="Alert information">
            <dl>
              <div>
                <dt>QR Code ID</dt>
                <dd>
                  <button
                    className="alert-qr-link"
                    onClick={() => onOpenQRCode(alert.qrCodeId)}
                    type="button"
                  >
                    {alert.qrCodeId}
                    <ExternalLinkIcon />
                  </button>
                </dd>
              </div>
              <div>
                <dt>User</dt>
                <dd>{alert.userName}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{alert.contact}</dd>
              </div>
              <div>
                <dt>GPS Location</dt>
                <dd>{alert.gpsLocation}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{alert.submittedAt}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="alert-description-panel">
          <h3>Reporter Description</h3>
          <p>{alert.description}</p>
        </section>

        {error ? <p className="alert-modal-error">{error}</p> : null}

        <footer className="alert-modal-footer">
          <button
            className="alert-modal-resolve"
            disabled={isSaving}
            onClick={handleResolveAlert}
            type="button"
          >
            Resolve Alert
          </button>
          <button
            className="alert-modal-secondary"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  )
}
