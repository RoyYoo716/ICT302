import { useEffect, useState } from 'react'

const ROLE_OPTIONS = ['Super Admin', 'Admin', 'Reviewer']
const STATUS_OPTIONS = ['Active', 'Suspended', 'Inactive']

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getInitialForm(user) {
  return {
    fullName: user?.fullName || '',
    email: user?.email || '',
    role: user?.role || 'Reviewer',
    status: user?.status || 'Active',
    twoFactorEnabled: Boolean(user?.twoFactorEnabled),
    password: '',
    confirmPassword: '',
  }
}

export default function UserFormModal({
  isSubmitting,
  mode = 'create',
  onClose,
  onSubmit,
  user,
}) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(() => getInitialForm(user))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(getInitialForm(user))
    setErrors({})
  }, [user, mode])

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  function validateForm() {
    const nextErrors = {}
    const fullName = form.fullName.trim()
    const email = form.email.trim()

    if (!fullName) {
      nextErrors.fullName = 'Full Name is required.'
    }

    if (!email) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.role) {
      nextErrors.role = 'Role is required.'
    }

    if (!form.status) {
      nextErrors.status = 'Status is required.'
    }

    if (!isEdit) {
      if (!form.password || form.password.length < 6) {
        nextErrors.password = 'Password must be at least 6 characters.'
      }

      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.'
      }
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateForm()

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    await onSubmit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
      twoFactorEnabled: form.twoFactorEnabled,
      password: form.password,
    })
  }

  return (
    <div className="user-modal-backdrop" role="presentation">
      <section
        aria-labelledby="user-form-title"
        aria-modal="true"
        className="user-modal"
        role="dialog"
      >
        <header className="user-modal-header">
          <h2 id="user-form-title">{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button
            aria-label={isEdit ? 'Close edit user modal' : 'Close add user modal'}
            className="user-modal-close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <form className="user-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input
              onChange={(event) => updateField('fullName', event.target.value)}
              type="text"
              value={form.fullName}
            />
            {errors.fullName ? <small>{errors.fullName}</small> : null}
          </label>

          <label>
            <span>Email</span>
            <input
              onChange={(event) => updateField('email', event.target.value)}
              type="email"
              value={form.email}
            />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <div className="user-form-grid">
            <label>
              <span>Role</span>
              <select
                onChange={(event) => updateField('role', event.target.value)}
                value={form.role}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role ? <small>{errors.role}</small> : null}
            </label>

            <label>
              <span>Status</span>
              <select
                onChange={(event) => updateField('status', event.target.value)}
                value={form.status}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status ? <small>{errors.status}</small> : null}
            </label>
          </div>

          <label className="user-checkbox-field">
            <input
              checked={form.twoFactorEnabled}
              onChange={(event) => updateField('twoFactorEnabled', event.target.checked)}
              type="checkbox"
            />
            <span>2FA Enabled</span>
          </label>

          {!isEdit ? (
            <div className="user-form-grid">
              <label>
                <span>Password</span>
                <input
                  onChange={(event) => updateField('password', event.target.value)}
                  type="password"
                  value={form.password}
                />
                {errors.password ? <small>{errors.password}</small> : null}
              </label>

              <label>
                <span>Confirm Password</span>
                <input
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                  type="password"
                  value={form.confirmPassword}
                />
                {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
              </label>
            </div>
          ) : null}

          {isEdit && user ? (
            <dl className="user-form-readonly">
              <div>
                <dt>User ID</dt>
                <dd>{user.id}</dd>
              </div>
              <div>
                <dt>Joined</dt>
                <dd>{user.joined}</dd>
              </div>
              <div>
                <dt>Last Login</dt>
                <dd>{user.lastLogin}</dd>
              </div>
              <div>
                <dt>Last IP</dt>
                <dd>{user.lastIp}</dd>
              </div>
              <div>
                <dt>QR Codes Managed</dt>
                <dd>{user.qrManaged}</dd>
              </div>
              <div>
                <dt>Alerts Reviewed</dt>
                <dd>{user.alertsReviewed}</dd>
              </div>
            </dl>
          ) : null}

          <footer className="user-modal-footer">
            <button
              className="user-modal-secondary"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button className="user-modal-primary" disabled={isSubmitting} type="submit">
              {isEdit ? 'Save' : 'Create User'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
