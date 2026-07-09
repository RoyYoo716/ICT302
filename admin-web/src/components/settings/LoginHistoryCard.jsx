export default function LoginHistoryCard({ history }) {
  return (
    <section className="settings-card login-history-card">
      <header className="settings-card-header">
        <div>
          <h2>Login History</h2>
          <p>Recent sign-in activity for this account</p>
        </div>
      </header>

      <ul className="settings-login-list">
        {history.map((entry) => (
          <li key={entry.id}>
            <span
              className={
                entry.status === 'Success'
                  ? 'settings-login-dot is-success'
                  : 'settings-login-dot is-failed'
              }
            />
            <div>
              <strong>{entry.device}</strong>
              <span>
                {entry.location} - {entry.ip}
              </span>
            </div>
            <div className="settings-login-status">
              <strong
                className={
                  entry.status === 'Success'
                    ? 'settings-status-success'
                    : 'settings-status-failed'
                }
              >
                {entry.status}
              </strong>
              <time>{entry.dateTime}</time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
