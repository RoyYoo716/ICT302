import { useEffect, useRef, useState } from 'react'
import AlertStatusBadge from './AlertStatusBadge.jsx'

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 20h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="13.5"
        fill="none"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

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
  onUploadEvidence,
}) {
  const fileInputRef = useRef(null)
  const [adminNotes, setAdminNotes] = useState(alert.adminNotes || '')
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setAdminNotes(alert.adminNotes || '')
    setError('')
  }, [alert])

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  async function handleEvidenceChange(event) {
    const [file] = Array.from(event.target.files || [])

    if (!file) {
      return
    }

    setIsUploading(true)

    try {
      await onUploadEvidence(file)
      event.target.value = ''
    } finally {
      setIsUploading(false)
    }
  }

  async function handleMarkReviewed() {
    setError('')
    await onStatusUpdate('Reviewed', adminNotes)
  }

  async function handleResolveAlert() {
    const trimmedNotes = adminNotes.trim()

    if (!trimmedNotes) {
      setError('Admin Notes are required to resolve an alert.')
      return
    }

    setError('')
    await onStatusUpdate('Resolved', trimmedNotes)
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
            {alert.evidencePhotos.length > 0 ? (
              <div className="alert-evidence-grid">
                {alert.evidencePhotos.map((photo) => (
                  <figure className="alert-evidence-preview" key={photo.id}>
                    {photo.url ? (
                      <img alt={photo.fileName} src={photo.url} />
                    ) : (
                      <span>{photo.fileName}</span>
                    )}
                  </figure>
                ))}
              </div>
            ) : (
              <div className="alert-evidence-empty">
                <EmptyImageIcon />
                <p>No evidence photos yet.</p>
                <span>Upload or take a photo below.</span>
              </div>
            )}

            <input
              accept="image/*"
              className="sr-only"
              onChange={handleEvidenceChange}
              ref={fileInputRef}
              type="file"
            />

            <div className="alert-evidence-actions">
              <button
                disabled={isUploading}
                onClick={openFilePicker}
                type="button"
              >
                <UploadIcon />
                Upload Photo
              </button>
              <button
                disabled={isUploading}
                onClick={openFilePicker}
                type="button"
              >
                <CameraIcon />
                Take Photo
              </button>
            </div>
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

        <label className="alert-notes-field">
          <span>Admin Notes</span>
          <textarea
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Add verification notes or findings..."
            value={adminNotes}
          />
        </label>

        {error ? <p className="alert-modal-error">{error}</p> : null}

        <footer className="alert-modal-footer">
          <button
            className="alert-modal-primary"
            disabled={isSaving}
            onClick={handleMarkReviewed}
            type="button"
          >
            Mark Reviewed
          </button>
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
