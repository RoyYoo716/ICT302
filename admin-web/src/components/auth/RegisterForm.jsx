import { useState } from 'react'

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  role: 'Reviewer',
  password: '',
  confirmPassword: '',
}

export default function RegisterForm({
  error,
  isSubmitting,
  onShowSignIn,
  onSubmit,
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

  function validateForm() {
    if (
      !values.fullName.trim() ||
      !values.email.trim() ||
      !values.role ||
      !values.password ||
      !values.confirmPassword
    ) {
      return 'Please complete all required fields.'
    }

    if (values.password !== values.confirmPassword) {
      return 'Passwords do not match.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextValidationError = validateForm()
    if (nextValidationError) {
      setValidationError(nextValidationError)
      return
    }

    await onSubmit({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      role: values.role,
      password: values.password,
    })
  }

  const message = validationError || error

  return (
    <form className="auth-form register-form" noValidate onSubmit={handleSubmit}>
      <p className="auth-form-intro">Create a new staff account</p>

      {message ? <p className="auth-message is-error">{message}</p> : null}

      <label className="form-field">
        <span>
          Full Name <em>*</em>
        </span>
        <input
          autoComplete="name"
          name="fullName"
          onChange={handleChange}
          placeholder="Jane Smith"
          type="text"
          value={values.fullName}
        />
      </label>

      <label className="form-field">
        <span>
          Email Address <em>*</em>
        </span>
        <input
          autoComplete="email"
          name="email"
          onChange={handleChange}
          placeholder="jane@vafpqr.gov"
          type="email"
          value={values.email}
        />
      </label>

      <label className="form-field">
        <span>Phone Number</span>
        <input
          autoComplete="tel"
          name="phone"
          onChange={handleChange}
          placeholder="+65 9000 0000"
          type="tel"
          value={values.phone}
        />
      </label>

      <label className="form-field">
        <span>
          Role <em>*</em>
        </span>
        <select name="role" onChange={handleChange} value={values.role}>
          <option value="Reviewer">Reviewer</option>
          <option value="Admin">Admin</option>
        </select>
      </label>

      <label className="form-field">
        <span>
          Password <em>*</em>
        </span>
        <input
          autoComplete="new-password"
          name="password"
          onChange={handleChange}
          placeholder="Min. 6 characters"
          type="password"
          value={values.password}
        />
      </label>

      <label className="form-field">
        <span>
          Confirm Password <em>*</em>
        </span>
        <input
          autoComplete="new-password"
          name="confirmPassword"
          onChange={handleChange}
          placeholder="********"
          type="password"
          value={values.confirmPassword}
        />
      </label>

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={onShowSignIn}>
          Sign in
        </button>
      </p>
    </form>
  )
}
