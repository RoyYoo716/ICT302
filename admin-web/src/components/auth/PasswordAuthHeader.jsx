function PasswordIcon({ name }) {
  if (name === 'mail') {
    return (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" role="presentation" focusable="false">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export default function PasswordAuthHeader({ icon, title, subtitle }) {
  return (
    <header className="password-auth-header">
      <div className="password-auth-icon" aria-hidden="true">
        <PasswordIcon name={icon} />
      </div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </header>
  )
}
