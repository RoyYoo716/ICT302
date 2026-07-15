import ResultLayout from './ResultLayout.jsx'

const defaultReason = 'This QR code requires further verification.'

export default function SuspiciousResult({ result }) {
  return (
    <ResultLayout
      details={[
        { label: 'QR ID', value: result.qrId },
        { label: 'Status', value: result.status || 'Suspicious', badge: true },
        {
          label: 'Reason',
          value: result.reason || defaultReason,
          className: 'details-warning-text',
        },
      ]}
      icon="warning"
      message="This QR code may be unsafe. Please proceed with caution."
      title="Suspicious QR Code"
      titleId="suspicious-title"
      variant="suspicious"
    />
  )
}
