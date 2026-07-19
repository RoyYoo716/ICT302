import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, NavLink, useNavigate } from 'react-router-dom'
import { getAlerts, getCurrentAdmin, logoutAdmin } from '../../services/api.js'

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', to: '/dashboard' },
  { id: 'qr-codes', label: 'QR Codes', icon: 'qr', to: '/qr-codes' },
  { id: 'alerts', label: 'Alerts', icon: 'bell', to: '/alerts' },
  { id: 'users', label: 'Users', icon: 'users', to: '/users' },
  { id: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
]

const FALLBACK_ADMIN = {
  name: 'Admin User',
  email: 'admin@vafpqr.gov',
  initials: 'AD',
}

const SESSION_REVALIDATION_INTERVAL_MS = 10_000

let cachedNewAlertNotifications = null

function getNewAlertNotifications(alerts) {
  return alerts.filter((alert) => alert.status === 'New')
}

function updateNewAlertNotificationCache(notifications) {
  cachedNewAlertNotifications = notifications
}

function Icon({ name }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.9,
  }

  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          {...commonProps}
          d="M12 3.5 5.5 6v5.1c0 4.2 2.7 8 6.5 9.4 3.8-1.4 6.5-5.2 6.5-9.4V6L12 3.5Z"
        />
      </svg>
    )
  }

  if (name === 'grid') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect {...commonProps} x="4" y="4" width="6" height="6" rx="1.4" />
        <rect {...commonProps} x="14" y="4" width="6" height="6" rx="1.4" />
        <rect {...commonProps} x="4" y="14" width="6" height="6" rx="1.4" />
        <rect {...commonProps} x="14" y="14" width="6" height="6" rx="1.4" />
      </svg>
    )
  }

  if (name === 'qr') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...commonProps} d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" />
        <path {...commonProps} d="M14 14h2M19 14v2M15 19h4M19 19v-1" />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          {...commonProps}
          d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7.5-2.5 7.5h17S18 16 18 9Z"
        />
        <path {...commonProps} d="M9.6 20a2.8 2.8 0 0 0 4.8 0" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...commonProps} d="M16 20c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4" />
        <circle {...commonProps} cx="10" cy="8" r="4" />
        <path {...commonProps} d="M20 19c0-2-1.1-3.4-3-4M16 4.5a3.5 3.5 0 0 1 0 7" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          {...commonProps}
          d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        />
        <path
          {...commonProps}
          d="m19.4 15-.8 1.4 1 2.2-2.3 2-2.1-1.2-1.6.7-.7 2.4H9.8l-.7-2.4-1.6-.7-2.1 1.2-2.3-2 1-2.2L3.4 15 1 14.3v-3.1l2.4-.7.8-1.5-1-2.1 2.3-2 2.1 1.2 1.6-.7L9.9 3h3.2l.7 2.4 1.6.7 2.1-1.2 2.3 2-1 2.1.8 1.5 2.4.7v3.1l-2.6.7Z"
        />
      </svg>
    )
  }

  if (name === 'logout') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...commonProps} d="M15 17l5-5-5-5M20 12H8" />
        <path {...commonProps} d="M11 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
      </svg>
    )
  }

  return null
}

function formatDashboardDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getDisplayAdmin(admin) {
  if (admin.email === 'admin@vafpqr.gov') {
    return {
      name: 'Admin User',
      email: 'admin@vafpqr.gov',
      initials: 'AD',
    }
  }

  const initials = admin.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return {
    name: admin.fullName,
    email: admin.email,
    initials: initials || 'AD',
  }
}

export default function AdminLayout({
  activeSection = 'dashboard',
  alertNotifications,
  children,
  title = 'Dashboard',
}) {
  const navigate = useNavigate()
  const notificationRef = useRef(null)
  const [admin, setAdmin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [loadedAlertNotifications, setLoadedAlertNotifications] = useState(
    cachedNewAlertNotifications,
  )
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    let requestInFlight = false

    async function validateAdminSession({ initial = false } = {}) {
      if (requestInFlight) return
      requestInFlight = true

      try {
        const currentAdmin = await getCurrentAdmin()
        if (!isMounted) return

        setAdmin(currentAdmin)
        if (initial) setIsLoading(false)
      } catch {
        // The API helper handles invalid sessions and redirects to login.
        // A temporary network failure should not erase a valid rendered session.
        if (isMounted && initial) setIsLoading(false)
      } finally {
        requestInFlight = false
      }
    }

    function revalidateVisibleSession() {
      if (document.visibilityState === 'visible') {
        validateAdminSession()
      }
    }

    validateAdminSession({ initial: true })
    const intervalId = window.setInterval(
      revalidateVisibleSession,
      SESSION_REVALIDATION_INTERVAL_MS,
    )
    window.addEventListener('focus', revalidateVisibleSession)
    document.addEventListener('visibilitychange', revalidateVisibleSession)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', revalidateVisibleSession)
      document.removeEventListener('visibilitychange', revalidateVisibleSession)
    }
  }, [])

  useEffect(() => {
    if (Array.isArray(alertNotifications)) {
      updateNewAlertNotificationCache(alertNotifications)
      setLoadedAlertNotifications(alertNotifications)
      return undefined
    }

    let isMounted = true

    async function loadAlertNotifications() {
      const response = await getAlerts()
      const newAlerts = getNewAlertNotifications(response.alerts)

      if (isMounted) {
        updateNewAlertNotificationCache(newAlerts)
        setLoadedAlertNotifications(newAlerts)
      }
    }

    loadAlertNotifications()

    return () => {
      isMounted = false
    }
  }, [alertNotifications])

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined
    }

    function handleDocumentPointerDown(event) {
      if (!notificationRef.current?.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }

    function handleDocumentKeyDown(event) {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [isNotificationOpen])

  async function handleLogout() {
    setIsSigningOut(true)
    await logoutAdmin()
    navigate('/login', { replace: true })
  }

  function handleNotificationClick(alertId) {
    setIsNotificationOpen(false)
    navigate('/alerts', { state: { openAlertId: alertId } })
  }

  const displayAdmin = useMemo(() => {
    if (!admin) {
      return null
    }

    return getDisplayAdmin(admin)
  }, [admin])

  const currentDate = formatDashboardDate(new Date())
  const currentAlertNotifications = Array.isArray(alertNotifications)
    ? alertNotifications
    : loadedAlertNotifications || []
  const currentAlertCount =
    Array.isArray(alertNotifications) || Array.isArray(loadedAlertNotifications)
      ? currentAlertNotifications.length
      : null
  const alertsBadge = currentAlertCount > 0 ? String(currentAlertCount) : ''

  if (!isLoading && !admin) {
    return <Navigate to="/login" replace />
  }

  const account = displayAdmin ?? FALLBACK_ADMIN

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Icon name="shield" />
          </div>
          <div>
            <strong>VAFPQR</strong>
            <span>Secure QR System</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {MENU_ITEMS.map((item) => {
            const className =
              item.id === activeSection ? 'sidebar-link is-active' : 'sidebar-link'
            const badge = item.id === 'alerts' ? alertsBadge : item.badge

            if (item.to) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={className}
                  aria-current={item.id === activeSection ? 'page' : undefined}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {badge ? <strong className="sidebar-badge">{badge}</strong> : null}
                </NavLink>
              )
            }

            return (
              <button key={item.label} type="button" className={className}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {badge ? <strong className="sidebar-badge">{badge}</strong> : null}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-account">
          <div className="admin-avatar">{account.initials}</div>
          <div className="admin-identity">
            <strong>{account.name}</strong>
            <span>{account.email}</span>
          </div>
          <button
            className="logout-icon-button"
            disabled={isSigningOut || isLoading}
            onClick={handleLogout}
            title="Sign out"
            type="button"
            aria-label="Sign out"
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1>{title}</h1>
          <div className="topbar-actions">
            <span>{currentDate}</span>
            <div className="notification-menu" ref={notificationRef}>
              <button
                aria-expanded={isNotificationOpen}
                aria-label="Notifications"
                className="bell-button"
                onClick={() => setIsNotificationOpen((isOpen) => !isOpen)}
                type="button"
              >
                <Icon name="bell" />
                {currentAlertCount > 0 ? (
                  <strong className="bell-count">{currentAlertCount}</strong>
                ) : null}
              </button>

              {isNotificationOpen ? (
                <section className="notification-dropdown" aria-label="New alert notifications">
                  <header>
                    <strong>Notifications</strong>
                    <span>{currentAlertCount ?? 0} new</span>
                  </header>

                  {currentAlertNotifications.length > 0 ? (
                    <div className="notification-list">
                      {currentAlertNotifications.map((alert) => (
                        <button
                          key={alert.id}
                          className="notification-item"
                          onClick={() => handleNotificationClick(alert.id)}
                          type="button"
                        >
                          <span>
                            <strong>{alert.id}</strong>
                            <em>{alert.qrCodeId}</em>
                          </span>
                          <p>{alert.description}</p>
                          <time>{alert.submittedAt}</time>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="notification-empty">No new alerts</p>
                  )}
                </section>
              ) : null}
            </div>
          </div>
        </header>

        {isLoading ? (
          <main className="dashboard-content" aria-busy="true" aria-label="Loading page content">
            <section className="dashboard-card dashboard-shell-skeleton" />
          </main>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
