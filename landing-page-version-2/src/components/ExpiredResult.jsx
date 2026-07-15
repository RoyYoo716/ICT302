import ResultLayout from './ResultLayout.jsx'

function getExpiredDate(result) {
  return result.expiredAt || result.expiresAt || result.expiryDate || ''
}

export default function ExpiredResult({ result }) {
  const expiredDate = getExpiredDate(result)
  const details = [
    { label: 'QR ID', value: result.qrId },
    { label: 'Status', value: result.status || 'Expired', badge: true },
  ]

  if (expiredDate) {
    details.push({
      label: 'Expired On',
      value: expiredDate,
      className: 'details-muted-text',
    })
  }

  return (
    <ResultLayout
      details={details}
      icon="clock"
      message="This QR code is no longer valid because it has expired."
      title="QR Code Expired"
      titleId="expired-title"
      variant="expired"
    />
  )
}
