import { useMemo, useState } from 'react'

const RADIUS = 68
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 4

function buildSegments(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  let offset = 0

  return items.map((item) => {
    const rawLength = (item.value / total) * CIRCUMFERENCE
    const length = Math.max(rawLength - GAP, 1)
    const segment = {
      ...item,
      dashArray: `${length} ${CIRCUMFERENCE - length}`,
      dashOffset: -offset,
    }

    offset += rawLength
    return segment
  })
}

export default function StatusDonutChart({ items }) {
  const [hoveredLabel, setHoveredLabel] = useState(null)
  const segments = useMemo(() => buildSegments(items), [items])
  const hoveredSegment = segments.find((segment) => segment.label === hoveredLabel)

  return (
    <section className="dashboard-card status-card" aria-label="QR status distribution">
      <div>
        <h2>QR Status Distribution</h2>
        <p>By current status</p>
      </div>

      <div className="donut-wrap">
        <svg viewBox="0 0 200 200" className="donut-chart" role="img">
          <title>QR status distribution</title>
          <circle
            className="donut-track"
            cx="100"
            cy="100"
            fill="none"
            r={RADIUS}
            strokeWidth="36"
          />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              className={
                hoveredLabel === segment.label ? 'donut-segment is-hovered' : 'donut-segment'
              }
              cx="100"
              cy="100"
              fill="none"
              onFocus={() => setHoveredLabel(segment.label)}
              onMouseEnter={() => setHoveredLabel(segment.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onBlur={() => setHoveredLabel(null)}
              r={RADIUS}
              stroke={segment.color}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="butt"
              strokeWidth="36"
              tabIndex="0"
              transform="rotate(-90 100 100)"
            />
          ))}
        </svg>

        {hoveredSegment ? (
          <div className="donut-tooltip">
            {hoveredSegment.label} : {hoveredSegment.value}
          </div>
        ) : null}
      </div>

      <div className="status-legend">
        {items.map((item) => (
          <span key={item.label}>
            <i style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}
