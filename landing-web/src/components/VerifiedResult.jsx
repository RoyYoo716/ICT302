import { useState } from 'react'

// Browser users can never reach the destination URL (app-required model).
// This card shows the verify result and prompts the user to install the app.
export default function VerifiedResult({ result }) {
  const [popup, setPopup] = useState(null)

  const hasApkLink =
    typeof result.apkUrl === 'string' && result.apkUrl.startsWith('http')

  function handleDownload() {
    if (hasApkLink) {
      window.location.assign(result.apkUrl)
    } else {
      // APK not published yet — fall back to the explanation pop-up.
      setPopup('coming-soon')
    }
  }

  return (
    <section className="verification-card" aria-labelledby="verified-title">
      <div className="result-icon result-icon--verified" aria-hidden="true">
        <span className="checkmark" />
      </div>

      <h1 id="verified-title">QR Code Verified</h1>
      <p className="result-message">
        This QR code is authentic. To continue to its destination, please use
        the Secure QR mobile app.
      </p>

      <dl className="details-box details-box--verified">
        <div className="details-row">
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-badge--active">Verified</span>
          </dd>
        </div>
      </dl>

      <button className="primary-action" type="button" onClick={handleDownload}>
        Download the Secure QR App <span aria-hidden="true">→</span>
      </button>

      <button
        className="secondary-action"
        type="button"
        onClick={() => setPopup('app-required')}
      >
        No thanks
      </button>

      {popup && (
        <div
          className="app-required-overlay"
          role="presentation"
          onClick={() => setPopup(null)}
        >
          <div
            role="alertdialog"
            aria-labelledby="popup-title"
            className="app-required-popup"
            onClick={(e) => e.stopPropagation()}
          >
            {popup === 'coming-soon' ? (
              <>
                <h2 id="popup-title">App coming soon</h2>
                <p>
                  The Secure QR app isn't available to download just yet.
                  Please check back shortly to continue to this QR code's
                  destination.
                </p>
              </>
            ) : (
              <>
                <h2 id="popup-title">App required</h2>
                <p>
                  For your security, this QR code can only be used through the
                  Secure QR mobile app. The destination cannot be opened in a
                  browser.
                </p>
              </>
            )}
            <button type="button" onClick={() => setPopup(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  )
}