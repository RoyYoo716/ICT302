export default function DangerZoneCard() {
  return (
    <section className="settings-card danger-zone-card">
      <header className="settings-card-header">
        <h2>Danger Zone</h2>
      </header>

      <div className="danger-zone-actions">
        <button type="button">Revoke All Sessions</button>
        <button type="button">Export Account Data</button>
      </div>
    </section>
  )
}
