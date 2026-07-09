export default function QRStatusBadge({ status }) {
  const normalizedStatus = status.toLowerCase()

  return (
    <span className={`qr-status-badge qr-status-${normalizedStatus}`}>
      {status}
    </span>
  )
}
