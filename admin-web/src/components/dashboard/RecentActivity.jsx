export default function RecentActivity({ activities }) {
  return (
    <section className="dashboard-card recent-card" aria-label="Recent activity">
      <h2>Recent Activity</h2>

      <ul className="activity-list">
        {activities.map((activity) => (
          <li key={activity.id}>
            <span className={`activity-dot activity-dot-${activity.tone}`} />
            <span className="activity-message">{activity.message}</span>
            <time>{activity.time}</time>
          </li>
        ))}
      </ul>
    </section>
  )
}
