import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
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
            <section className="auth-card" aria-label="Forgot password">
                {result ? (
                    <div className="auth-form">
                        <p className="auth-form-intro">Check your reset link</p>
                        <p className="auth-message is-success">{result.message}</p>
                        {result.resetLink ? (
                            // DEMO mode: backend returns the link directly (no email service).
                            <Link className="primary-action" to={result.resetLink}>
                                Open reset link
                            </Link>
                        ) : null}
                        <p className="auth-switch">
                            <Link to="/login">Back to sign in</Link>
                        </p>
                    </div>
                ) : (
                    <form className="auth-form" noValidate onSubmit={handleSubmit}>
                        <p className="auth-form-intro">
                            Enter your email and we will create a password reset link
                        </p>
                        {error ? <p className="auth-message is-error">{error}</p> : null}
                        <label className="form-field">
                            <span>Email Address</span>
                            <input
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@vafpqr.gov"
                                type="email"
                                value={email}
                            />
                        </label>
                        <button className="primary-action" disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Creating...' : 'Create reset link'}
                        </button>
                        <p className="auth-switch">
                            <Link to="/login">Back to sign in</Link>
                        </p>
                    </form>
                )}
            </section>
        </AuthLayout>
    )
}