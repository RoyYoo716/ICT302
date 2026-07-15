import ResultActions from './ResultActions.jsx'

function ResultIcon({ icon, variant }) {
  if (icon === 'check') {
    return (
      <div className={`result-icon result-icon--${variant}`} aria-hidden="true">
        <svg
          className="result-symbol result-symbol--check"
          viewBox="0 0 48 48"
          focusable="false"
        >
          <circle cx="24" cy="24" r="18" />
          <path d="M15.75 24.25 21.25 29.75 32.25 18.75" />
        </svg>
      </div>
    )
  }

  if (icon === 'clock') {
    return (
      <div className={`result-icon result-icon--${variant}`} aria-hidden="true">
        <svg
          className="result-symbol result-symbol--clock"
          viewBox="0 0 48 48"
          focusable="false"
        >
          <circle cx="24" cy="24" r="18" />
          <path d="M24 14.5 V24 L30.25 28.25" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`result-icon result-icon--${variant}`} aria-hidden="true">
      <span className={`${icon}-mark`} />
    </div>
  )
}

function DetailValue({ row, variant }) {
  if (row.badge) {
    return (
      <span className={`status-badge status-badge--${variant}`}>
        {row.value || 'Unavailable'}
      </span>
    )
  }

  return row.value || 'Unavailable'
}

export default function ResultLayout({
  details,
  icon,
  message,
  title,
  titleId,
  variant,
}) {
  return (
    <section className="verification-card" aria-labelledby={titleId}>
      <ResultIcon icon={icon} variant={variant} />

      <h1 id={titleId}>{title}</h1>
      <p className="result-message">{message}</p>

      <dl className={`details-box details-box--${variant}`}>
        {details.map((row) => (
          <div className="details-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd className={row.className}>
              <DetailValue row={row} variant={variant} />
            </dd>
          </div>
        ))}
      </dl>

      <ResultActions />
    </section>
  )
}
