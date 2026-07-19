import QRStatusBadge from './QRStatusBadge.jsx'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

function getStatusActions(status) {
  if (status === 'Active') {
    return ['Blacklisted']
  }

  if (status === 'Blacklisted') {
    return ['Active']
  }

  if (status === 'Expired') {
    // Terminal state: the expiry is baked into the printed JWT itself,
    // so no status change can ever make this code scannable again.
    return []
  }

  // Suspicious: admin can clear the flag or confirm the threat.
  return ['Active', 'Blacklisted']
}

function getActionLabel(status) {
  if (status === 'Active') {
    return 'Activate'
  }

  if (status === 'Blacklisted') {
    return 'Blacklist'
  }

  return status
}

export default function QRCodeTable({
  currentPage,
  endItem,
  onPageChange,
  onStatusChange,
  onViewDetails,
  qrCodes,
  startItem,
  totalCount,
  totalPages,
}) {
  return (
    <section className="qr-table-card" aria-label="QR code list">
      <div className="qr-table-scroll">
        <table className="qr-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Destination URL</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Scans</th>
              <th>Alerts</th>
              <th>Actions</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {qrCodes.length > 0 ? (
              qrCodes.map((qrCode) => (
                <tr key={qrCode.id}>
                  <td className="qr-id-cell">{qrCode.label || qrCode.id}</td>
                  <td className="qr-url-cell">{qrCode.destinationUrl}</td>
                  <td>
                    <QRStatusBadge status={qrCode.status} />
                  </td>
                  <td>{qrCode.expiryDate}</td>
                  <td className="qr-number-cell">{formatNumber(qrCode.scans)}</td>
                  <td
                    className={
                      qrCode.alerts >= 10
                        ? 'qr-number-cell qr-alert-count is-high'
                        : 'qr-number-cell qr-alert-count'
                    }
                  >
                    {formatNumber(qrCode.alerts)}
                  </td>
                  <td>
                    <div className="qr-action-group">
                      {getStatusActions(qrCode.status).map((nextStatus) => (
                        <button
                          key={nextStatus}
                          className={
                            nextStatus === 'Active'
                              ? 'qr-action-button qr-action-activate'
                              : 'qr-action-button qr-action-blacklist'
                          }
                          onClick={() => onStatusChange(qrCode.id, nextStatus)}
                          type="button"
                        >
                          {getActionLabel(nextStatus)}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className="qr-details-button"
                      onClick={() => onViewDetails(qrCode.id)}
                      type="button"
                    >
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
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="qr-empty-cell" colSpan="8">
                  No QR codes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="qr-table-footer">
        <span>
          Showing {totalCount === 0 ? 0 : startItem}-{endItem} of {totalCount}
        </span>

        <div className="qr-pagination" aria-label="Pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
            aria-label="Previous page"
          >
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              className={page === currentPage ? 'is-active' : ''}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
            aria-label="Next page"
          >
            {'>'}
          </button>
        </div>
      </footer>
    </section>
  )
}
