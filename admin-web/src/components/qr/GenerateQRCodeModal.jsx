import { useState } from 'react'

const EXPIRY_OPTIONS = [
  { label: '24 Hours', value: '24' },
  { label: '48 Hours', value: '48' },
  { label: '72 Hours', value: '72' },
  { label: '168 Hours (7 Days)', value: '168' },
]

export default function GenerateQRCodeModal({ isSubmitting, onClose, onGenerate }) {
  const [destinationUrl, setDestinationUrl] = useState('')
  const [expiryDuration, setExpiryDuration] = useState('24')
  const [fieldErrors, setFieldErrors] = useState({})

  function validateForm() {
    const nextErrors = {}
    const trimmedUrl = destinationUrl.trim()

    if (!trimmedUrl) {
      nextErrors.destinationUrl = 'Destination URL is required.'
    } else {
      try {
        const parsedUrl = new URL(trimmedUrl)

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          nextErrors.destinationUrl = 'URL must start with http:// or https://.'
        }
      } catch {
        nextErrors.destinationUrl = 'Enter a valid URL.'
      }
    }

    if (!expiryDuration) {
      nextErrors.expiryDuration = 'Expiry Duration is required.'
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    await onGenerate({ destinationUrl: destinationUrl.trim(), expiryDuration })
  }

  return (
    <div className="qr-modal-overlay" role="presentation">
      <section className="qr-modal generate-modal" role="dialog" aria-modal="true">
        <header className="qr-modal-header">
          <h2>Generate QR Code</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>

        <form className="qr-modal-body" onSubmit={handleSubmit} noValidate>
          <label className="qr-form-field">
            <span>Destination URL</span>
            <input
              autoFocus
              onChange={(event) => {
                setDestinationUrl(event.target.value)
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  destinationUrl: '',
                }))
              }}
              placeholder="https://example.com/page"
              type="url"
              value={destinationUrl}
            />
            {fieldErrors.destinationUrl ? (
              <small className="qr-form-error">{fieldErrors.destinationUrl}</small>
            ) : null}
          </label>

          <label className="qr-form-field">
            <span>Expiry Duration</span>
            <select
              onChange={(event) => {
                setExpiryDuration(event.target.value)
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  expiryDuration: '',
                }))
              }}
              value={expiryDuration}
            >
              {EXPIRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.expiryDuration ? (
              <small className="qr-form-error">{fieldErrors.expiryDuration}</small>
            ) : null}
          </label>

          <div className="qr-modal-actions">
            <button className="qr-secondary-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="qr-primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
