import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AlertDetailModal from '../components/alerts/AlertDetailModal.jsx'
import AlertsTable from '../components/alerts/AlertsTable.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import {
  getAlertById,
  getAlerts,
  updateAlertEvidence,
  updateAlertStatus,
} from '../services/api.js'

const PAGE_SIZE = 7
const STATUS_OPTIONS = ['All', 'New', 'Reviewed', 'Resolved']
const DEFAULT_NEW_ALERT_COUNT = 5

function normalizePage(value) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export default function AlertsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [isSavingAlert, setIsSavingAlert] = useState(false)

  const selectedStatus = searchParams.get('status') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true

    async function loadAlerts() {
      const response = await getAlerts()

      if (!isMounted) {
        return
      }

      setAlerts(response.alerts)
      setIsLoading(false)
    }

    loadAlerts()

    return () => {
      isMounted = false
    }
  }, [])

  const currentNewAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === 'New'),
    [alerts],
  )
  const newAlertCount = isLoading
    ? DEFAULT_NEW_ALERT_COUNT
    : currentNewAlerts.length

  const filteredAlerts = useMemo(() => {
    if (selectedStatus === 'All') {
      return alerts
    }

    return alerts.filter((alert) => alert.status === selectedStatus)
  }, [alerts, selectedStatus])

  const totalPages = Math.max(Math.ceil(filteredAlerts.length / PAGE_SIZE), 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const pagedAlerts = filteredAlerts.slice(startIndex, startIndex + PAGE_SIZE)
  const startItem = filteredAlerts.length === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + PAGE_SIZE, filteredAlerts.length)

  useEffect(() => {
    if (currentPage > totalPages) {
      updateQuery({ page: String(totalPages) })
    }
  })

  useEffect(() => {
    const alertId = location.state?.openAlertId

    if (!alertId || isLoading) {
      return
    }

    handleViewDetails(alertId)
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    })
  }, [isLoading, location, navigate])

  function updateQuery(updates) {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'All') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })

    setSearchParams(nextParams)
  }

  function handleStatusChange(event) {
    updateQuery({ status: event.target.value, page: '1' })
  }

  async function handleViewDetails(id) {
    const response = await getAlertById(id)
    setSelectedAlert(response.alert)
  }

  function handleCloseModal() {
    setSelectedAlert(null)
  }

  function handleOpenQRCode(qrCodeId) {
    setSelectedAlert(null)
    navigate(`/qr-codes/${qrCodeId}`)
  }

  async function handleAlertStatusUpdate(status, adminNotes) {
    setIsSavingAlert(true)

    try {
      const response = await updateAlertStatus(selectedAlert.id, {
        status,
        adminNotes,
      })

      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === selectedAlert.id ? response.alert : alert,
        ),
      )
      setSelectedAlert(null)
    } finally {
      setIsSavingAlert(false)
    }
  }

  async function handleEvidenceUpload(file) {
    const response = await updateAlertEvidence(selectedAlert.id, file)

    setSelectedAlert(response.alert)
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === selectedAlert.id ? response.alert : alert,
      ),
    )
  }

  return (
    <AdminLayout
      activeSection="alerts"
      alertBadgeCount={newAlertCount}
      alertNotifications={isLoading ? undefined : currentNewAlerts}
      title="Tamper Alerts"
    >
      <main className="alerts-page">
        <div className="alerts-toolbar">
          <label className="alerts-status-filter">
            <span className="sr-only">Status filter</span>
            <select onChange={handleStatusChange} value={selectedStatus}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <p>{newAlertCount} new alerts requiring review</p>
        </div>

        {isLoading ? (
          <section className="alerts-table-card alerts-loading-card">
            Loading alerts...
          </section>
        ) : (
          <AlertsTable
            alerts={pagedAlerts}
            currentPage={safeCurrentPage}
            endItem={endItem}
            onPageChange={(page) => updateQuery({ page: String(page) })}
            onViewDetails={handleViewDetails}
            startItem={startItem}
            totalCount={filteredAlerts.length}
            totalPages={totalPages}
          />
        )}

        {selectedAlert ? (
          <AlertDetailModal
            alert={selectedAlert}
            isSaving={isSavingAlert}
            onClose={handleCloseModal}
            onOpenQRCode={handleOpenQRCode}
            onStatusUpdate={handleAlertStatusUpdate}
            onUploadEvidence={handleEvidenceUpload}
          />
        ) : null}
      </main>
    </AdminLayout>
  )
}
