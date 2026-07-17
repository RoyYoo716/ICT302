import { useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import AccountProfileCard from '../components/settings/AccountProfileCard.jsx'
import PasswordSecurityCard from '../components/settings/PasswordSecurityCard.jsx'
import {
  getAdminSettings,
  logoutAdmin,
  updateAdminPassword,
  updateAdminProfile,
} from '../services/api.js'

export default function SettingsPage() {
  const profileTimerRef = useRef(null)
  const passwordTimerRef = useRef(null)
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  function clearMessageTimers() {
    globalThis.clearTimeout(profileTimerRef.current)
    globalThis.clearTimeout(passwordTimerRef.current)
  }

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      const response = await getAdminSettings()

      if (!isMounted) {
        return
      }

      setSettings(response.settings)
      setIsLoading(false)
    }

    loadSettings()

    return () => {
      isMounted = false
      clearMessageTimers()
    }
  }, [])

  function showTimedMessage(timerRef, setter, message) {
    setter(message)
    globalThis.clearTimeout(timerRef.current)
    timerRef.current = globalThis.setTimeout(() => {
      setter('')
    }, 3000)
  }

  async function handleProfileSave(payload) {
    const response = await updateAdminProfile(payload)

    setSettings((currentSettings) => ({
      ...currentSettings,
      profile: response.profile,
    }))
    showTimedMessage(profileTimerRef, setProfileMessage, 'Profile updated successfully.')
  }

  async function handlePasswordUpdate(payload) {
    await updateAdminPassword(payload)
    // Show the success message briefly, then force re-login with the
    // new password — standard practice after a password change.
    showTimedMessage(
      passwordTimerRef,
      setPasswordMessage,
      'Password updated. Please sign in again with your new password.',
    )
    passwordTimerRef.current = globalThis.setTimeout(async () => {
      await logoutAdmin()
      window.location.assign('/login')
    }, 1500)
  }

  return (
    <AdminLayout activeSection="settings" title="Settings">
      <main className="settings-page">
        {isLoading || !settings ? (
          <section className="settings-card settings-loading-card">Loading settings...</section>
        ) : (
          <div className="settings-stack">
            <AccountProfileCard
              message={profileMessage}
              onSave={handleProfileSave}
              profile={settings.profile}
            />
            <PasswordSecurityCard
              message={passwordMessage}
              onPasswordUpdate={handlePasswordUpdate}
            />
          </div>
        )}
      </main>
    </AdminLayout>
  )
}
