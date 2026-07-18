import { UserRoleBadge } from './UserBadges.jsx'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function UsersTable({
  currentAdminId,
  currentPage,
  endItem,
  onPageChange,
  onRoleChange,
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
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                const isAdmin = user.role === 'Admin'
                const actionLabel = isAdmin ? 'Make User' : 'Make Admin'
                const nextRole = isAdmin ? 'User' : 'Admin'

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
                    <td className="users-muted-cell">{user.lastLogin}</td>
                    <td>
                      <div className="users-action-group">
                        <button
                          className="users-view-button"
                          onClick={() => onViewUser(user.id)}
                          type="button"
                        >
                          View
                        </button>

                        {user.id !== currentAdminId && (
                          <button
                            className="users-status-action users-status-restore"
                            //disabled={user.id === currentAdminId}
                            onClick={() => onRoleChange(user.id, nextRole)}
                            type="button"
                          >
                            {actionLabel}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td className="users-empty-cell" colSpan="4">
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
