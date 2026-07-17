import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AlertDetailModal from '../components/alerts/AlertDetailModal.jsx'
import AlertsTable from '../components/alerts/AlertsTable.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import { getAlerts, updateAlertStatus } from '../services/api.js'

const PAGE_SIZE = 7
const STATUS_OPTIONS = ['All', 'New', 'Resolved']

function normalizePage(value) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export default function AlertsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [alerts, setAlerts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [isSavingAlert, setIsSavingAlert] = useState(false)

  const selectedStatus = searchParams.get('status') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true
    async function loadAlerts() {
      setIsLoading(true)
      const response = await getAlerts({
        status: selectedStatus,
        page: currentPage,
        limit: PAGE_SIZE,
      })
      if (!isMounted) return
      setAlerts(response.alerts)
      setPagination(response.pagination)
      setIsLoading(false)
    }
    loadAlerts()
    return () => {
      isMounted = false
    }
  }, [selectedStatus, currentPage])

  const currentNewAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === 'New'),
    [alerts],
  )
  const newAlertCount = isLoading ? null : currentNewAlerts.length

  const filteredAlerts = useMemo(() => {
    if (selectedStatus === 'All') {
      return alerts
    }

    return alerts.filter((alert) => alert.status === selectedStatus)
  }, [alerts, selectedStatus])

  const totalPages = pagination.totalPages || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedAlerts = alerts // the server already returns just this page
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total)

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

  function handleViewDetails(id) {
    const found = alerts.find((alert) => alert.id === id)
    if (found) setSelectedAlert(found)
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

  return (
    <AdminLayout
      activeSection="alerts"
      alertNotifications={isLoading ? null : currentNewAlerts}
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

          <p>{newAlertCount ?? 0} new alerts requiring review</p>
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
            totalCount={pagination.total}
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
          />
        ) : null}
      </main>
    </AdminLayout>
  )
}
