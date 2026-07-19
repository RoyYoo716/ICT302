import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout.jsx'
// import ResetPasswordModal from '../components/users/ResetPasswordModal.jsx'
import UserFormModal from '../components/users/UserFormModal.jsx'
import UserProfileDrawer from '../components/users/UserProfileDrawer.jsx'
import UserSummaryCard from '../components/users/UserSummaryCard.jsx'
import UsersTable from '../components/users/UsersTable.jsx'
import { getCurrentAdmin, getUsers, updateUser, createUser, deleteUser } from '../services/api.js'


const PAGE_SIZE = 6
const USERS_REFRESH_INTERVAL_MS = 10_000
const ROLE_OPTIONS = ['All', 'Admin', 'User']
//const STATUS_OPTIONS = ['All', 'Active', 'Suspended', 'Inactive']

function normalizePage(value) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

// function confirmStatusChange(user, status) {
//   const action = status === 'Suspended' ? 'suspend' : 'restore'
//   const message = `Are you sure you want to ${action} ${user.fullName}?`

//   if (typeof globalThis.confirm !== 'function') {
//     return true
//   }

//   return globalThis.confirm(message)
// }

function confirmRoleChange(user, role) {
  const message = `Change ${user.fullName}'s role to ${role}?`
  if (typeof globalThis.confirm !== 'function') return true
  return globalThis.confirm(message)
}

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE })
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [currentAdminId, setCurrentAdminId] = useState(null)

  const searchTerm = searchParams.get('search') || ''
  const selectedRole = searchParams.get('role') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true
    let requestInFlight = false

    async function loadUsers({ initial = false } = {}) {
      if (requestInFlight) return
      requestInFlight = true
      if (initial) setIsLoading(true)

      try {
        const response = await getUsers({
          search: searchTerm,
          role: selectedRole,
          page: currentPage,
          limit: PAGE_SIZE,
        })
        if (!isMounted) return

        setUsers(response.users)
        setPagination(response.pagination)
      } catch (err) {
        if (isMounted) setErrorMessage(err.message)
      } finally {
        requestInFlight = false
        if (isMounted && initial) setIsLoading(false)
      }
    }

    function refreshVisibleUsers() {
      if (document.visibilityState === 'visible') {
        loadUsers()
      }
    }

    loadUsers({ initial: true })
    const intervalId = window.setInterval(refreshVisibleUsers, USERS_REFRESH_INTERVAL_MS)
    window.addEventListener('focus', refreshVisibleUsers)
    document.addEventListener('visibilitychange', refreshVisibleUsers)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshVisibleUsers)
      document.removeEventListener('visibilitychange', refreshVisibleUsers)
    }
  }, [searchTerm, selectedRole, currentPage])

  useEffect(() => {
    getCurrentAdmin()
      .then((admin) => setCurrentAdminId(admin?.id ?? null))
      .catch(() => {
        // AdminLayout owns session-error handling and redirects.
      })
  }, [])

  const totalPages = pagination.totalPages || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedUsers = users // the server already returns just this page
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total)

  useEffect(() => {
    if (currentPage > totalPages) {
      updateQuery({ page: String(totalPages) })
    }
  })

  function updateQuery(updates) {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'All') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })

    setSearchParams(nextParams)
  }

  function syncUser(updatedUser) {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    )

    setSelectedUser((currentUser) =>
      currentUser?.id === updatedUser.id ? updatedUser : currentUser,
    )
  }

  function showSuccess(message) {
    setSuccessMessage(message)
  }

  function handleSearchChange(event) {
    updateQuery({ search: event.target.value, page: '1' })
  }

  function handleRoleChange(event) {
    updateQuery({ role: event.target.value, page: '1' })
  }

  function handleViewUser(id) {
    const found = users.find((u) => u.id === id);
    if (found) setSelectedUser(found)
  }

  async function handleRoleUpdate(id, role) {
    const user = users.find((item) => item.id === id)
    if (!user || !confirmRoleChange(user, role)) return
    try {
      const response = await updateUser(id, role)
      syncUser(response.user)
      setErrorMessage('') // a success clears any stale error
      showSuccess(`${response.user.fullName} is now ${response.user.role}.`)
    } catch (err) {
      setSuccessMessage('') // and an error clears any stale success
      // Surfaces backend guard messages (last-admin, self-role).
      setErrorMessage(err.message)
    }
  }

  async function handleDeleteUser(id) {
    const user = users.find((item) => item.id === id)
    if (!user) return
    if (
      typeof globalThis.confirm === 'function' &&
      !globalThis.confirm(`Delete ${user.fullName}? This cannot be undone.`)
    ) {
      return
    }
    try {
      await deleteUser(id)
      setErrorMessage('')
      showSuccess(`${user.fullName} has been deleted.`)
      setUsers((prev) => prev.filter((item) => item.id !== id))
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
    } catch (err) {
      setSuccessMessage('')
      setErrorMessage(err.message)
    }
  }

  async function handleCreateUser(payload) {
    try {
      const response = await createUser(payload)
      setIsAddUserOpen(false)
      setErrorMessage('')
      showSuccess(`${response.user.fullName} has been created.`)
      setUsers((prev) => [response.user, ...prev])
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
    } catch (err) {
      setSuccessMessage('')
      setErrorMessage(err.message)
      setIsAddUserOpen(false)
    }
  }

  return (
    <AdminLayout activeSection="users" title="User Management">
      <main className="users-page">
        <section className="users-summary-grid" aria-label="User summary">
          <UserSummaryCard label="Total Users" value={pagination.total} />
        </section>

        <div className="users-toolbar">
          <label className="users-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                fill="none"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m16 16 4 4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <input
              onChange={handleSearchChange}
              placeholder="Search users..."
              type="search"
              value={searchTerm}
            />
          </label>

          <label className="users-filter">
            <span className="sr-only">Role filter</span>
            <select onChange={handleRoleChange} value={selectedRole}>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <button
            className="primary-action"
            onClick={() => setIsAddUserOpen(true)}
            type="button"
          >
            Add User
          </button>
        </div>

        {successMessage ? (
          <p className="users-success-message">{successMessage}</p>
        ) : null}
        {errorMessage ? (
          <p className="users-error-message">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <section className="users-table-card users-loading-card">Loading users...</section>
        ) : (
          <UsersTable
            currentAdminId={currentAdminId}
            currentPage={safeCurrentPage}
            endItem={endItem}
            onPageChange={(page) => updateQuery({ page: String(page) })}
            onRoleChange={handleRoleUpdate}
            onDelete={handleDeleteUser}
            onViewUser={handleViewUser}
            startItem={startItem}
            totalCount={pagination.total}
            totalPages={totalPages}
            users={pagedUsers}
          />
        )}

        {selectedUser ? (
          <UserProfileDrawer
            onClose={() => setSelectedUser(null)}
            user={selectedUser}
          />
        ) : null}

        {isAddUserOpen ? (
          <UserFormModal
            mode="create"
            onClose={() => setIsAddUserOpen(false)}
            onSubmit={handleCreateUser}
          />
        ) : null}
      </main>
    </AdminLayout>
  )
}
