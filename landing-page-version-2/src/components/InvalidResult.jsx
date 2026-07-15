import ResultLayout from './ResultLayout.jsx'

export default function InvalidResult({ result }) {
  return (
    <ResultLayout
      details={[
        { label: 'QR ID', value: result.qrId },
        { label: 'Status', value: result.status || 'Blacklisted', badge: true },
        {
          label: 'Reason',
          value: result.reason,
          className: 'details-danger-text',
        },
      ]}
      icon="warning"
      message="This QR code has been flagged and is not safe to use."
      title="QR Code Invalid"
      titleId="invalid-title"
      variant="invalid"
    />
  )
}
