function SummaryIcon({ tone }) {
  if (tone === 'lock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 20c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx="10"
        cy="8"
        fill="none"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      {tone === 'success' ? (
        <path
          d="m17 10 1.6 1.6L22 8.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ) : null}
      {tone === 'danger' ? (
        <>
          <path
            d="m18 8 4 4M22 8l-4 4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      ) : null}
    </svg>
  )
}

export default function UserSummaryCard({ label, tone = 'blue', value }) {
  return (
    <article className="user-summary-card">
      <span className={`user-summary-icon user-summary-icon-${tone}`}>
        <SummaryIcon tone={tone} />
      </span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}
