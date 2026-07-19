import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import AuthTabs from '../components/auth/AuthTabs.jsx'
import RegisterForm from '../components/auth/RegisterForm.jsx'
import SignInForm from '../components/auth/SignInForm.jsx'
import { loginAdmin, registerAdmin } from '../services/api.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('signin')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(
    searchParams.get('passwordReset') === '1'
      ? 'Password reset successfully. Please sign in.'
      : '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  function changeTab(nextTab) {
    setActiveTab(nextTab)
    setError('')
    setSuccessMessage('')
  }

  async function handleSignIn(values) {
    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      await loginAdmin(values)
      navigate('/dashboard', { replace: true })
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(values) {
    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      await registerAdmin(values)
      setActiveTab('signin')
      setSuccessMessage('Account created successfully. Please sign in.')
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <section
        className={activeTab === 'register' ? 'auth-card is-register' : 'auth-card'}
        aria-label="Admin account access"
      >
        <AuthTabs activeTab={activeTab} onChange={changeTab} />

        {activeTab === 'signin' ? (
          <SignInForm
            error={error}
            isSubmitting={isSubmitting}
            onShowRegister={() => changeTab('register')}
            onSubmit={handleSignIn}
            successMessage={successMessage}
          />
        ) : (
          <RegisterForm
            error={error}
            isSubmitting={isSubmitting}
            onShowSignIn={() => changeTab('signin')}
            onSubmit={handleRegister}
          />
        )}
      </section>
    </AuthLayout>
  )
}
