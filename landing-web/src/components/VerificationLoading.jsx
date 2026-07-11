export default function VerificationLoading() {
  return (
    <section className="verification-card" aria-labelledby="loading-title">
      <div className="result-icon result-icon--loading" aria-hidden="true">
        <span className="loading-ring" />
      </div>

      <h1 id="loading-title">Verifying QR Code</h1>
      <p className="result-message">Checking this QR code before you continue.</p>

      <div className="loading-panel" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  )
}
