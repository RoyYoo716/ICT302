import { useState } from 'react'

const RANGE_OPTIONS = ['1h', '24h', '1w', '1M']

function formatScans(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function ScanVolumeChart({ ranges }) {
  const [activeRange, setActiveRange] = useState('1M')
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const activeChart = ranges[activeRange]

  return (
    <section className="dashboard-card scan-card" aria-label="Scan volume chart">
      <div className="card-heading-row">
        <div>
          <h2>{activeChart.title}</h2>
          <p>{activeChart.subtitle}</p>
        </div>

        <div className="range-toggle" aria-label="Scan volume range">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range}
              className={activeRange === range ? 'is-active' : ''}
              onClick={() => {
                setActiveRange(range)
                setHoveredIndex(null)
              }}
              type="button"
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="bar-chart" key={activeRange}>
        <div className="y-axis" aria-hidden="true">
          {activeChart.ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className="bar-stage">
          {activeChart.data.map((item, index) => {
            const height = Math.max((item.scans / activeChart.maxValue) * 100, 2)
            const isHovered = hoveredIndex === index

            return (
              <div
                className={isHovered ? 'bar-slot is-hovered' : 'bar-slot'}
                key={item.label}
                onBlur={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                role="button"
                tabIndex="0"
                aria-label={`${item.label}: ${item.scans} scans`}
              >
                <div className="bar-track">
                  {isHovered ? (
                    <div className="bar-tooltip">
                      <span>{item.label}</span>
                      <strong>scans : {formatScans(item.scans)}</strong>
                    </div>
                  ) : null}
                  <div className="bar-fill" style={{ height: `${height}%` }} />
                </div>
                <span className="x-label">{item.displayLabel || ''}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
