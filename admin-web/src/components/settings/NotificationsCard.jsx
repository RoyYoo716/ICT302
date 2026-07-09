import ToggleSwitch from './ToggleSwitch.jsx'

export default function NotificationsCard({ notifications, onChange }) {
  return (
    <section className="settings-card settings-side-card">
      <header className="settings-card-header">
        <div>
          <h2>Notifications</h2>
          <p>Manage alert preferences</p>
        </div>
      </header>

      <div className="settings-toggle-list">
        <div className="settings-toggle-row">
          <div>
            <strong>Email Alerts</strong>
            <span>Receive new tamper alerts via email</span>
          </div>
          <ToggleSwitch
            checked={notifications.emailAlerts}
            label="Email Alerts"
            onChange={(enabled) => onChange({ emailAlerts: enabled })}
          />
        </div>

        <div className="settings-toggle-row">
          <div>
            <strong>New Alert Reports</strong>
            <span>Notify when reporters submit alerts</span>
          </div>
          <ToggleSwitch
            checked={notifications.newAlertReports}
            label="New Alert Reports"
            onChange={(enabled) => onChange({ newAlertReports: enabled })}
          />
        </div>
      </div>
    </section>
  )
}
