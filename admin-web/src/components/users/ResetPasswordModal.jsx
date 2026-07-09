import { useState } from 'react'

export default function ResetPasswordModal({ isSubmitting, onClose, onConfirm, user }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!password) {
      nextErrors.password = 'New Password is required.'
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    await onConfirm({ password })
  }

  return (
    <div className="user-modal-backdrop" role="presentation">
      <section
        aria-labelledby="reset-password-title"
        aria-modal="true"
        className="user-modal user-reset-modal"
        role="dialog"
      >
        <header className="user-modal-header">
          <h2 id="reset-password-title">Reset Password</h2>
          <button
            aria-label="Close reset password modal"
            className="user-modal-close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <form className="user-form" onSubmit={handleSubmit}>
          <p className="user-modal-intro">
            Reset password for <strong>{user.fullName}</strong>.
          </p>

          <label>
            <span>New Password</span>
            <input
              onChange={(event) => {
                setPassword(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, password: '' }))
              }}
              type="password"
              value={password}
            />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <label>
            <span>Confirm New Password</span>
            <input
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, confirmPassword: '' }))
              }}
              type="password"
              value={confirmPassword}
            />
            {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
          </label>

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
              Confirm
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
