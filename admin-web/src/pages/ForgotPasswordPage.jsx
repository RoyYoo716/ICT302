import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordAuthHeader from '../components/auth/PasswordAuthHeader.jsx'
import { requestPasswordReset } from '../services/api.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      setResult(await requestPasswordReset(email))
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <section className="auth-card password-auth-card" aria-label="Forgot password">
        <div className="auth-form password-auth-form">
          <PasswordAuthHeader
            icon="mail"
            title="Forgot Password"
            subtitle="Create a reset link for your admin account."
          />

          {result ? (
            <div className="password-result-card">
              <div className="password-result-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>
              <h3>Reset request completed</h3>
              <p>{result.message}</p>
              {result.resetLink ? (
                <Link className="primary-action" to={result.resetLink}>
                  Open Reset Form
                </Link>
              ) : null}
              <button
                className="auth-text-button"
                onClick={() => {
                  setResult(null)
                  setError('')
                }}
                type="button"
              >
                Use another email
              </button>
            </div>
          ) : (
            <form className="password-auth-fields" noValidate onSubmit={handleSubmit}>
              {error ? <p className="auth-message is-error">{error}</p> : null}
              <label className="form-field">
                <span>Email Address</span>
                <input
                  autoComplete="email"
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  placeholder="Enter your admin email"
                  type="email"
                  value={email}
                />
              </label>
              <button className="primary-action" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Creating...' : 'Create Reset Link'}
              </button>
            </form>
          )}

          <p className="auth-switch password-auth-back">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </section>
    </AuthLayout>
  )
}
