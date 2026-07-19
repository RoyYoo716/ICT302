import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordAuthHeader from '../components/auth/PasswordAuthHeader.jsx'
import { resetPassword } from '../services/api.js'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [values, setValues] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (values.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    if (values.newPassword !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword: values.newPassword })
      navigate('/login?passwordReset=1', { replace: true })
    } catch (apiError) {
      setError(apiError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <section className="auth-card password-auth-card" aria-label="Reset password">
        <div className="auth-form password-auth-form">
          <PasswordAuthHeader
            icon="lock"
            title="Reset Password"
            subtitle="Choose a new password for your admin account."
          />

          {!token ? (
            <div className="password-alert-card">
              <strong>Reset link unavailable</strong>
              <span>This reset link is missing its token.</span>
            </div>
          ) : (
            <form className="password-auth-fields" noValidate onSubmit={handleSubmit}>
              {error ? <p className="auth-message is-error">{error}</p> : null}
              <label className="form-field">
                <span>New Password</span>
                <input
                  autoComplete="new-password"
                  name="newPassword"
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  type="password"
                  value={values.newPassword}
                />
              </label>
              <label className="form-field">
                <span>Confirm New Password</span>
                <input
                  autoComplete="new-password"
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="Enter the new password again"
                  type="password"
                  value={values.confirmPassword}
                />
              </label>
              <button className="primary-action" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="auth-switch password-auth-back">
            <Link to={token ? '/login' : '/forgot-password'}>
              {token ? 'Back to sign in' : 'Request a new link'}
            </Link>
          </p>
        </div>
      </section>
    </AuthLayout>
  )
}
