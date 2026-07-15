import { useState } from 'react'
import { redirectToAppStore } from '../utils/appStoreRedirect.js'

function cancelVerification() {
  if (window.history.length > 1) {
    window.history.back()
    return ''
  }

  if (window.opener) {
    try {
      window.close()
    } catch {
      // Browsers commonly block closing tabs that were not opened by script.
    }
  }

  return 'You may now close this page.'
}

export default function ResultActions() {
  const [notice, setNotice] = useState('')

  function handleDownloadClick() {
    const result = redirectToAppStore()
    setNotice(result.message)
  }

  function handleCancelClick() {
    setNotice(cancelVerification())
  }

  return (
    <div className="result-actions">
      <button
        className="action-button action-button--download"
        type="button"
        onClick={handleDownloadClick}
        aria-label="Download VAFPQR App"
      >
        Download VAFPQR App
      </button>

      <button
        className="action-button action-button--cancel"
        type="button"
        onClick={handleCancelClick}
        aria-label="Cancel QR verification"
      >
        Cancel
      </button>

      {notice && (
        <p className="action-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  )
}
