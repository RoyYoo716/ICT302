export default function VerificationError({ title, message }) {
  return (
    <section className="verification-card" aria-labelledby="error-title">
      <div className="result-icon result-icon--invalid" aria-hidden="true">
        <span className="warning-mark" />
      </div>

      <h1 id="error-title">{title}</h1>
      {message && <p className="result-message">{message}</p>}
    </section>
  )
}
