function ShieldMark() {
  return (
    <div className="auth-logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M12 3.5 5.5 6v5.1c0 4.2 2.7 8 6.5 9.4 3.8-1.4 6.5-5.2 6.5-9.4V6L12 3.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

export default function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="VAFPQR admin authentication">
        <header className="auth-brand">
          <ShieldMark />
          <h1>VAFPQR</h1>
          <p>Secure QR Code System</p>
        </header>

        {children}

        <p className="auth-footer">© 2026 VAFPQR. All rights reserved.</p>
      </section>
    </main>
  )
}
