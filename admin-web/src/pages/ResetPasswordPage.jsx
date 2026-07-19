import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
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
        setValues((prev) => ({ ...prev, [name]: value }))
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
            navigate('/login', { replace: true })
        } catch (apiError) {
            // e.g. 'Invalid or expired reset token'
            setError(apiError.message)
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout>
            <section className="auth-card" aria-label="Reset password">
                {!token ? (
                    <div className="auth-form">
                        <p className="auth-message is-error">This reset link is missing its token.</p>
                        <p className="auth-switch">
                            <Link to="/forgot-password">Request a new link</Link>
                        </p>
                    </div>
                ) : (
                    <form className="auth-form" noValidate onSubmit={handleSubmit}>
                        <p className="auth-form-intro">Choose a new password</p>
                        {error ? <p className="auth-message is-error">{error}</p> : null}
                        <label className="form-field">
                            <span>New Password</span>
                            <input
                                autoComplete="new-password"
                                name="newPassword"
                                onChange={handleChange}
                                placeholder="********"
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
                                placeholder="********"
                                type="password"
                                value={values.confirmPassword}
                            />
                        </label>
                        <button className="primary-action" disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Resetting...' : 'Reset password'}
                        </button>
                    </form>
                )}
            </section>
        </AuthLayout>
    )
}