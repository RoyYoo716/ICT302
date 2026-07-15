export const verificationStatuses = {
  verified: 'verified',
  invalid: 'invalid',
  suspicious: 'suspicious',
  expired: 'expired',
}

const statusAliases = {
  valid: verificationStatuses.verified,
  verified: verificationStatuses.verified,
  active: verificationStatuses.verified,
  safe: verificationStatuses.verified,
  invalid: verificationStatuses.invalid,
  blacklisted: verificationStatuses.invalid,
  blocked: verificationStatuses.invalid,
  malicious: verificationStatuses.invalid,
  suspicious: verificationStatuses.suspicious,
  warning: verificationStatuses.suspicious,
  flagged: verificationStatuses.suspicious,
  pending_review: verificationStatuses.suspicious,
  expired: verificationStatuses.expired,
}

function normalizeStatusValue(value) {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function getStatusFromValue(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return statusAliases[normalizeStatusValue(value)] || null
}

export function resolveVerificationStatus(result) {
  const statusFields = [
    result?.status,
    result?.result,
    result?.verificationStatus,
    result?.verdict,
    result?.state,
  ]
  const hasStatusField = statusFields.some(
    (value) => value !== null && value !== undefined && value !== '',
  )

  for (const value of statusFields) {
    const status = getStatusFromValue(value)

    if (status) {
      return status
    }
  }

  if (hasStatusField) {
    if (import.meta.env.DEV) {
      console.warn('Unknown QR verification status. Falling back to invalid.', {
        status: result?.status,
        result: result?.result,
        verificationStatus: result?.verificationStatus,
      })
    }

    return verificationStatuses.invalid
  }

  if (typeof result?.valid === 'boolean') {
    return result.valid
      ? verificationStatuses.verified
      : verificationStatuses.invalid
  }

  if (import.meta.env.DEV) {
    console.warn('Unknown QR verification status. Falling back to invalid.', {
      status: result?.status,
      result: result?.result,
      verificationStatus: result?.verificationStatus,
    })
  }

  return verificationStatuses.invalid
}
