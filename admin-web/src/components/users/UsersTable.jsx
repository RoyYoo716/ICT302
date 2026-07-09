import { UserRoleBadge, UserStatusBadge } from './UserBadges.jsx'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function TwoFactorMark({ enabled }) {
  return (
    <span className={enabled ? 'user-2fa-mark is-enabled' : 'user-2fa-mark'}>
      {enabled ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m5 12 4 4 10-10"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m7 7 10 10M17 7 7 17"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
        </svg>
      )}
    </span>
  )
}

export default function UsersTable({
  currentPage,
  endItem,
  onPageChange,
  onStatusChange,
  onViewUser,
  startItem,
  totalCount,
  totalPages,
  users,
}) {
  return (
    <section className="users-table-card" aria-label="User list">
      <div className="users-table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>QR Managed</th>
              <th>Alerts Reviewed</th>
              <th>2FA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                const isSuspended = user.status === 'Suspended'
                const actionLabel = isSuspended ? 'Restore' : 'Suspend'
                const nextStatus = isSuspended ? 'Active' : 'Suspended'

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="users-user-cell">
                        <span className="users-avatar">{getInitials(user.fullName)}</span>
                        <span>
                          <strong>{user.fullName}</strong>
                          <em>{user.email}</em>
                        </span>
                      </div>
                    </td>
                    <td>
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td>
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="users-muted-cell">{user.lastLogin}</td>
                    <td className="users-number-cell">{user.qrManaged}</td>
                    <td className="users-number-cell">{user.alertsReviewed}</td>
                    <td>
                      <TwoFactorMark enabled={user.twoFactorEnabled} />
                    </td>
                    <td>
                      <div className="users-action-group">
                        <button
                          className="users-view-button"
                          onClick={() => onViewUser(user.id)}
                          type="button"
                        >
                          View
                        </button>
                        <button
                          className={
                            isSuspended
                              ? 'users-status-action users-status-restore'
                              : 'users-status-action users-status-suspend'
                          }
                          onClick={() => onStatusChange(user.id, nextStatus)}
                          type="button"
                        >
                          {actionLabel}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td className="users-empty-cell" colSpan="8">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="users-table-footer">
        <span>
          Showing {totalCount === 0 ? 0 : startItem}-{endItem} of {totalCount} users
        </span>

        <div className="users-pagination" aria-label="Pagination">
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
