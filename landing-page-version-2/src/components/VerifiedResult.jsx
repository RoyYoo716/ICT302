import ResultLayout from './ResultLayout.jsx'

function getDestination(result) {
  return result.destinationUrl || result.destination || ''
}

export default function VerifiedResult({ result }) {
  return (
    <ResultLayout
      details={[
        {
          label: 'Destination',
          value: getDestination(result),
          className: 'details-url',
        },
        { label: 'Status', value: result.status || 'Active', badge: true },
        { label: 'Expires', value: result.expiryDate || result.expiresAt },
      ]}
      icon="check"
      message="This QR code is authentic and safe to proceed."
      title="QR Code Verified"
      titleId="verified-title"
      variant="verified"
    />
  )
}
