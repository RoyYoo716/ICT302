import { useState } from 'react'
import ToggleSwitch from './ToggleSwitch.jsx'

function validatePasswordForm(form) {
  const errors = {}

  if (!form.currentPassword) {
    errors.currentPassword = 'Current Password is required.'
  }

  if (!form.newPassword) {
    errors.newPassword = 'New Password is required.'
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'New Password must be at least 6 characters.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm New Password is required.'
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function PasswordSecurityCard({
  message,
  onPasswordUpdate,
  onTwoFactorChange,
  security,
}) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  function resetPasswordForm() {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setErrors({})
  }

  function handleCancel() {
    resetPasswordForm()
    setIsChangingPassword(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validatePasswordForm(form)

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    try {
      await onPasswordUpdate({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      resetPasswordForm()
      setIsChangingPassword(false)
    } catch (error) {
      setErrors({ currentPassword: error.message })
    }
  }

  return (
    <section className="settings-card password-security-card">
      <header className="settings-card-header">
        <div>
          <h2>Password &amp; Security</h2>
          <p>Last changed {security.lastChangedRelative}</p>
        </div>
        <button
          className="settings-outline-button"
          onClick={isChangingPassword ? handleCancel : () => setIsChangingPassword(true)}
          type="button"
        >
          {isChangingPassword ? 'Cancel' : 'Change Password'}
        </button>
      </header>

      <div className="settings-card-body">
        {isChangingPassword ? (
          <form className="settings-password-form" onSubmit={handleSubmit}>
            <label>
              <span>Current Password</span>
              <input
                onChange={(event) => updateField('currentPassword', event.target.value)}
                type="password"
                value={form.currentPassword}
              />
              {errors.currentPassword ? <small>{errors.currentPassword}</small> : null}
            </label>

            <label>
              <span>New Password</span>
              <input
                onChange={(event) => updateField('newPassword', event.target.value)}
                type="password"
                value={form.newPassword}
              />
              {errors.newPassword ? <small>{errors.newPassword}</small> : null}
            </label>

            <label>
              <span>Confirm New Password</span>
              <input
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                type="password"
                value={form.confirmPassword}
              />
              {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
            </label>

            <button className="settings-primary-button" type="submit">
              Update Password
            </button>
          </form>
        ) : (
          <div className="settings-password-summary">
            <strong>Password set</strong>
            <span>Last changed: {security.lastChangedDate}</span>
          </div>
        )}

        {message ? <p className="settings-success-message">{message}</p> : null}

        <div className="settings-two-factor-row">
          <div>
            <strong>Two-Factor Authentication</strong>
            <span>Adds an extra layer of security on login</span>
          </div>
          <ToggleSwitch
            checked={security.twoFactorEnabled}
            label="Two-Factor Authentication"
            onChange={onTwoFactorChange}
          />
        </div>
      </div>
    </section>
  )
}
