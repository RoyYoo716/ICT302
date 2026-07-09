import AlertStatusBadge from './AlertStatusBadge.jsx'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        fill="none"
        r="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function AlertsTable({
  alerts,
  currentPage,
  endItem,
  onPageChange,
  onViewDetails,
  startItem,
  totalCount,
  totalPages,
}) {
  return (
    <section className="alerts-table-card" aria-label="Tamper alert list">
      <div className="alerts-table-scroll">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>QR Code</th>
              <th>User</th>
              <th>GPS Location</th>
              <th>Description</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="alerts-id-cell">{alert.id}</td>
                  <td>
                    <span className="alerts-qr-code">{alert.qrCodeId}</span>
                  </td>
                  <td>{alert.userName}</td>
                  <td className="alerts-location-cell">{alert.gpsLocation}</td>
                  <td className="alerts-description-cell">"{alert.description}"</td>
                  <td>
                    <AlertStatusBadge status={alert.status} />
                  </td>
                  <td className="alerts-submitted-cell">{alert.submittedAt}</td>
                  <td>
                    <button
                      className="alerts-details-button"
                      onClick={() => onViewDetails(alert.id)}
                      type="button"
                    >
                      <EyeIcon />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="alerts-empty-cell" colSpan="8">
                  No alerts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="alerts-table-footer">
        <span>
          Showing {totalCount === 0 ? 0 : startItem}-{endItem} of {totalCount}
        </span>

        <div className="alerts-pagination" aria-label="Pagination">
          <button
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              className={page === currentPage ? 'is-active' : ''}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            {'>'}
          </button>
        </div>
      </footer>
    </section>
  )
}
