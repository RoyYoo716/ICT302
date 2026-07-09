function MetricIcon({ name }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
  }

  if (name === 'qr') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...commonProps} d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" />
        <path {...commonProps} d="M14 14h2M19 14v2M15 19h4M19 19v-1" />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...commonProps} d="M20 6 9 17l-5-5" />
        <path {...commonProps} d="M21 12a9 9 0 1 1-3.1-6.8" />
      </svg>
    )
  }

  if (name === 'warning') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          {...commonProps}
          d="M10.3 4.7 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0Z"
        />
        <path {...commonProps} d="M12 9v4M12 17h.01" />
      </svg>
    )
  }

  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          {...commonProps}
          d="M12 3.5 5.5 6v5.1c0 4.2 2.7 8 6.5 9.4 3.8-1.4 6.5-5.2 6.5-9.4V6L12 3.5Z"
        />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          {...commonProps}
          d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7.5-2.5 7.5h17S18 16 18 9Z"
        />
        <path {...commonProps} d="M9.6 20a2.8 2.8 0 0 0 4.8 0" />
      </svg>
    )
  }

  if (name === 'eye') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...commonProps} d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
        <circle {...commonProps} cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return null
}

export default function MetricCard({ icon, label, tone, value }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon-${tone}`}>
        <MetricIcon name={icon} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}
