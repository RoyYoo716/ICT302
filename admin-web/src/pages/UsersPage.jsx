import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout.jsx'
// import ResetPasswordModal from '../components/users/ResetPasswordModal.jsx'
// import UserFormModal from '../components/users/UserFormModal.jsx'
import UserProfileDrawer from '../components/users/UserProfileDrawer.jsx'
import UserSummaryCard from '../components/users/UserSummaryCard.jsx'
import UsersTable from '../components/users/UsersTable.jsx'
import { getUsers, updateUser } from '../services/api.js'

const PAGE_SIZE = 6
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
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE })

  const searchTerm = searchParams.get('search') || ''
  const selectedRole = searchParams.get('role') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true
    async function loadUsers() {
      setIsLoading(true)
      const response = await getUsers({
        search: searchTerm,
        role: selectedRole,
        page: currentPage,
        limit: PAGE_SIZE,
      })
      if (!isMounted) return
      setUsers(response.users)
      setPagination(response.pagination)
      setIsLoading(false)
    }
    loadUsers()
    return () => {
      isMounted = false
    }
  }, [searchTerm, selectedRole, currentPage])

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
      showSuccess(`${response.user.fullName} is now ${response.user.role}.`)
    } catch (err) {
      // Surfaces the backend's last-admin guard message.
      showSuccess(err.message)
    }
  }

  // async function handleStatusUpdate(id, status) {
  //   const user = users.find((item) => item.id === id)

  //   if (!user || !confirmStatusChange(user, status)) {
  //     return
  //   }

  //   const response = await updateUserStatus(id, status)
  //   syncUser(response.user)
  //   showSuccess(`${response.user.fullName} is now ${response.user.status}.`)
  // }

  // async function handleCreateUser(payload) {
  //   setIsSubmitting(true)

  //   try {
  //     const response = await createUser(payload)
  //     setUsers((currentUsers) => [response.user, ...currentUsers])
  //     setIsAddUserOpen(false)
  //     updateQuery({ search: '', role: 'All', status: 'All', page: '1' })
  //     showSuccess(`${response.user.fullName} has been created.`)
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // async function handleUpdateUser(payload) {
  //   setIsSubmitting(true)

  //   try {
  //     const response = await updateUser(editingUser.id, payload)
  //     syncUser(response.user)
  //     setEditingUser(null)
  //     showSuccess(`${response.user.fullName} has been updated.`)
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // async function handleResetPassword(payload) {
  //   setIsSubmitting(true)

  //   try {
  //     await resetUserPassword(resetPasswordUser.id, payload)
  //     showSuccess(`Password reset for ${resetPasswordUser.fullName}.`)
  //     setResetPasswordUser(null)
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

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
        </div>

        {successMessage ? (
          <p className="users-success-message">{successMessage}</p>
        ) : null}

        {isLoading ? (
          <section className="users-table-card users-loading-card">Loading users...</section>
        ) : (
          <UsersTable
            currentPage={safeCurrentPage}
            endItem={endItem}
            onPageChange={(page) => updateQuery({ page: String(page) })}
            onRoleChange={handleRoleUpdate}
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
      </main>
    </AdminLayout>
  )
}
