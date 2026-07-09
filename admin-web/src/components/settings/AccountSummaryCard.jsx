export default function AccountSummaryCard({ summary }) {
  const rows = [
    ['User ID', summary.userId],
    ['Account Type', summary.accountType],
    ['Member Since', summary.memberSince],
    ['Department', summary.department],
    ['Access Level', summary.accessLevel],
  ]

  return (
    <section className="settings-card settings-side-card">
      <header className="settings-card-header">
        <h2>Account Summary</h2>
      </header>

      <dl className="settings-summary-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
