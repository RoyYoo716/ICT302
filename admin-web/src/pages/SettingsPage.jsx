import { useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import AccountProfileCard from '../components/settings/AccountProfileCard.jsx'
import AccountSummaryCard from '../components/settings/AccountSummaryCard.jsx'
import DangerZoneCard from '../components/settings/DangerZoneCard.jsx'
import LoginHistoryCard from '../components/settings/LoginHistoryCard.jsx'
import NotificationsCard from '../components/settings/NotificationsCard.jsx'
import PasswordSecurityCard from '../components/settings/PasswordSecurityCard.jsx'
import {
  getAdminSettings,
  updateAdminPassword,
  updateAdminProfile,
  updateNotificationSettings,
  updateTwoFactorAuth,
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
    const response = await updateAdminPassword(payload)

    setSettings((currentSettings) => ({
      ...currentSettings,
      security: response.security,
    }))
    showTimedMessage(passwordTimerRef, setPasswordMessage, 'Password updated successfully.')
  }

  async function handleTwoFactorChange(enabled) {
    const response = await updateTwoFactorAuth(enabled)

    setSettings((currentSettings) => ({
      ...currentSettings,
      security: response.security,
    }))
  }

  async function handleNotificationChange(patch) {
    const response = await updateNotificationSettings({
      ...settings.notifications,
      ...patch,
    })

    setSettings((currentSettings) => ({
      ...currentSettings,
      notifications: response.notifications,
    }))
  }

  return (
    <AdminLayout activeSection="settings" title="Settings">
      <main className="settings-page">
        {isLoading || !settings ? (
          <section className="settings-card settings-loading-card">Loading settings...</section>
        ) : (
          <div className="settings-layout-grid">
            <section className="settings-main-column">
              <AccountProfileCard
                message={profileMessage}
                onSave={handleProfileSave}
                profile={settings.profile}
              />
              <PasswordSecurityCard
                message={passwordMessage}
                onPasswordUpdate={handlePasswordUpdate}
                onTwoFactorChange={handleTwoFactorChange}
                security={settings.security}
              />
              <LoginHistoryCard history={settings.loginHistory} />
            </section>

            <aside className="settings-side-column">
              <NotificationsCard
                notifications={settings.notifications}
                onChange={handleNotificationChange}
              />
              <AccountSummaryCard summary={settings.accountSummary} />
              <DangerZoneCard />
            </aside>
          </div>
        )}
      </main>
    </AdminLayout>
  )
}
