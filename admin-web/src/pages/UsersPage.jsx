import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import ResetPasswordModal from '../components/users/ResetPasswordModal.jsx'
import UserFormModal from '../components/users/UserFormModal.jsx'
import UserProfileDrawer from '../components/users/UserProfileDrawer.jsx'
import UserSummaryCard from '../components/users/UserSummaryCard.jsx'
import UsersTable from '../components/users/UsersTable.jsx'
import {
  createUser,
  getUserById,
  getUsers,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from '../services/api.js'

const PAGE_SIZE = 6
const ROLE_OPTIONS = ['All', 'Super Admin', 'Admin', 'Reviewer']
const STATUS_OPTIONS = ['All', 'Active', 'Suspended', 'Inactive']

function normalizePage(value) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function confirmStatusChange(user, status) {
  const action = status === 'Suspended' ? 'suspend' : 'restore'
  const message = `Are you sure you want to ${action} ${user.fullName}?`

  if (typeof globalThis.confirm !== 'function') {
    return true
  }

  return globalThis.confirm(message)
}

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const searchTerm = searchParams.get('search') || ''
  const selectedRole = searchParams.get('role') || 'All'
  const selectedStatus = searchParams.get('status') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      const response = await getUsers()

      if (!isMounted) {
        return
      }

      setUsers(response.users)
      setIsLoading(false)
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.status === 'Active').length,
      suspended: users.filter((user) => user.status === 'Suspended').length,
      twoFactor: users.filter((user) => user.twoFactorEnabled).length,
    }),
    [users],
  )

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
      const matchesRole = selectedRole === 'All' || user.role === selectedRole
      const matchesStatus =
        selectedStatus === 'All' || user.status === selectedStatus

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, selectedRole, selectedStatus])

  const totalPages = Math.max(Math.ceil(filteredUsers.length / PAGE_SIZE), 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const pagedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE)
  const startItem = filteredUsers.length === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + PAGE_SIZE, filteredUsers.length)

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
    setEditingUser((currentUser) =>
      currentUser?.id === updatedUser.id ? updatedUser : currentUser,
    )
    setResetPasswordUser((currentUser) =>
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

  function handleStatusFilterChange(event) {
    updateQuery({ status: event.target.value, page: '1' })
  }

  async function handleViewUser(id) {
    const response = await getUserById(id)
    setSelectedUser(response.user)
  }

  async function handleStatusUpdate(id, status) {
    const user = users.find((item) => item.id === id)

    if (!user || !confirmStatusChange(user, status)) {
      return
    }

    const response = await updateUserStatus(id, status)
    syncUser(response.user)
    showSuccess(`${response.user.fullName} is now ${response.user.status}.`)
  }

  async function handleCreateUser(payload) {
    setIsSubmitting(true)

    try {
      const response = await createUser(payload)
      setUsers((currentUsers) => [response.user, ...currentUsers])
      setIsAddUserOpen(false)
      updateQuery({ search: '', role: 'All', status: 'All', page: '1' })
      showSuccess(`${response.user.fullName} has been created.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateUser(payload) {
    setIsSubmitting(true)

    try {
      const response = await updateUser(editingUser.id, payload)
      syncUser(response.user)
      setEditingUser(null)
      showSuccess(`${response.user.fullName} has been updated.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(payload) {
    setIsSubmitting(true)

    try {
      await resetUserPassword(resetPasswordUser.id, payload)
      showSuccess(`Password reset for ${resetPasswordUser.fullName}.`)
      setResetPasswordUser(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout activeSection="users" title="User Management">
      <main className="users-page">
        <section className="users-summary-grid" aria-label="User summary">
          <UserSummaryCard label="Total Users" value={summary.total} />
          <UserSummaryCard label="Active" tone="success" value={summary.active} />
          <UserSummaryCard label="Suspended" tone="danger" value={summary.suspended} />
          <UserSummaryCard label="2FA Enabled" tone="lock" value={summary.twoFactor} />
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

          <label className="users-filter">
            <span className="sr-only">Status filter</span>
            <select onChange={handleStatusFilterChange} value={selectedStatus}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <button
            className="users-add-button"
            onClick={() => setIsAddUserOpen(true)}
            type="button"
          >
            <span aria-hidden="true">+</span>
            Add User
          </button>
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
            onStatusChange={handleStatusUpdate}
            onViewUser={handleViewUser}
            startItem={startItem}
            totalCount={filteredUsers.length}
            totalPages={totalPages}
            users={pagedUsers}
          />
        )}

        {selectedUser ? (
          <UserProfileDrawer
            onClose={() => setSelectedUser(null)}
            onEdit={setEditingUser}
            onResetPassword={setResetPasswordUser}
            onStatusChange={handleStatusUpdate}
            user={selectedUser}
          />
        ) : null}

        {isAddUserOpen ? (
          <UserFormModal
            isSubmitting={isSubmitting}
            mode="create"
            onClose={() => setIsAddUserOpen(false)}
            onSubmit={handleCreateUser}
          />
        ) : null}

        {editingUser ? (
          <UserFormModal
            isSubmitting={isSubmitting}
            mode="edit"
            onClose={() => setEditingUser(null)}
            onSubmit={handleUpdateUser}
            user={editingUser}
          />
        ) : null}

        {resetPasswordUser ? (
          <ResetPasswordModal
            isSubmitting={isSubmitting}
            onClose={() => setResetPasswordUser(null)}
            onConfirm={handleResetPassword}
            user={resetPasswordUser}
          />
        ) : null}
      </main>
    </AdminLayout>
  )
}
