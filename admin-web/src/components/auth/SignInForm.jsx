import { useState } from 'react'
import { Link } from 'react-router-dom'

const INITIAL_VALUES = {
  email: '',
  password: '',
}

export default function SignInForm({
  error,
  isSubmitting,
  onShowRegister,
  onSubmit,
  successMessage,
}) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [validationError, setValidationError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
    setValidationError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!values.email.trim() || !values.password) {
      setValidationError('Email address and password are required.')
      return
    }

    await onSubmit(values)
  }

  const message = validationError || error

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <p className="auth-form-intro">Sign in to your admin account</p>

      {successMessage ? (
        <p className="auth-message is-success">{successMessage}</p>
      ) : null}
      {message ? <p className="auth-message is-error">{message}</p> : null}

      <label className="form-field">
        <span>Email Address</span>
        <input
          autoComplete="email"
          name="email"
          onChange={handleChange}
          placeholder="admin@vafpqr.gov"
          type="email"
          value={values.email}
        />
      </label>

      <label className="form-field">
        <span>Password</span>
        <input
          autoComplete="current-password"
          name="password"
          onChange={handleChange}
          placeholder="********"
          type="password"
          value={values.password}
        />
      </label>

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>

      <Link className="auth-text-button" to="/forgot-password">
        Forgot Password?
      </Link>

      <div className="demo-credentials" aria-label="Demo credentials">
        Demo: <strong>admin@secureqr.com</strong> / <strong>Admin2026secure</strong>
      </div>

      <p className="auth-switch">
        No account?{' '}
        <button type="button" onClick={onShowRegister}>
          Register here
        </button>
      </p>
    </form>
  )
}
