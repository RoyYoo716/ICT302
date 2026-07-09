export default function AlertStatusBadge({ status }) {
  return (
    <span className={`alert-status-badge alert-status-${status.toLowerCase()}`}>
      {status}
    </span>
  )
}
