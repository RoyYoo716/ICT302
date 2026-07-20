import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import GenerateQRCodeModal from '../components/qr/GenerateQRCodeModal.jsx'
import QRCodeGeneratedModal from '../components/qr/QRCodeGeneratedModal.jsx'
import QRCodeTable from '../components/qr/QRCodeTable.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import {
  exportQRCodesCsv,
  generateQRCode,
  getQRCodes,
  updateQRCodeStatus,
} from '../services/api.js'

const PAGE_SIZE = 7
const STATUS_OPTIONS = ['All', 'Active', 'Blacklisted', 'Suspicious', 'Expired']

function normalizePage(value) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export default function QRCodeManagementPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [qrCodes, setQRCodes] = useState([])
   const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [generatedQRCode, setGeneratedQRCode] = useState(null)

  const searchTerm = searchParams.get('search') || ''
  const selectedStatus = searchParams.get('status') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true
    async function loadQRCodes() {
      setIsLoading(true)
      setLoadError('')
      try {
        // Server-side: the backend filters, searches, and pages for us.
        const response = await getQRCodes({
          search: searchTerm,
          status: selectedStatus,
          page: currentPage,
          limit: PAGE_SIZE,
        })
        if (!isMounted) return
        setQRCodes(response.qrCodes)
        setPagination(response.pagination)
      } catch (apiError) {
        if (isMounted) {
          setLoadError(apiError.message || 'Unable to load QR codes.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadQRCodes()
    return () => {
      isMounted = false
    }
  }, [searchTerm, selectedStatus, currentPage, retryKey])

  const totalPages = pagination.totalPages || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedQRCodes = qrCodes // the server already returns just this page
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total)

  useEffect(() => {
    if (currentPage > totalPages) {
      updateQuery({ page: String(totalPages) })
    }
  })

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

  function handleSearchChange(event) {
    updateQuery({ search: event.target.value, page: '1' })
  }

  function handleStatusChange(event) {
    updateQuery({ status: event.target.value, page: '1' })
  }

  async function handleStatusUpdate(id, status) {
    const response = await updateQRCodeStatus(id, status)
    setQRCodes((currentQRCodes) =>
      currentQRCodes.map((qrCode) =>
        qrCode.id === id ? response.qrCode : qrCode,
      ),
    )
  }

  function handleViewDetails(id) {
    const returnTo = `${location.pathname}${location.search}`
    navigate(`/qr-codes/${id}`, { state: { returnTo } })
  }

  async function handleGenerate(payload) {
    setIsGenerating(true)

    try {
      const response = await generateQRCode(payload)
      setQRCodes((currentQRCodes) => [response.qrCode, ...currentQRCodes])
      setGeneratedQRCode(response.qrCode)
      setIsGenerateOpen(false)
      updateQuery({ search: '', status: 'All', page: '1' })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleExportCsv() {
    setExportError('')
    setIsExporting(true)

    try {
      const response = await exportQRCodesCsv()
      const objectUrl = URL.createObjectURL(response.blob)
      const link = document.createElement('a')

      link.href = objectUrl
      link.download = response.fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      setExportError(error.message || 'Unable to export QR codes.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout title="QR Code Management" activeSection="qr-codes">
      <main className="qr-page">
        <div className="qr-toolbar">
          <label className="qr-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                fill="none"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m16 16 4 4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <input
              onChange={handleSearchChange}
              placeholder="Search QR codes..."
              type="search"
              value={searchTerm}
            />
          </label>

          <label className="qr-status-filter">
            <span className="sr-only">Status filter</span>
            <select onChange={handleStatusChange} value={selectedStatus}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <div className="qr-toolbar-actions">
            <button
              className="qr-export-button"
              disabled={isExporting}
              onClick={handleExportCsv}
              type="button"
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              className="generate-qr-button"
              onClick={() => setIsGenerateOpen(true)}
              type="button"
            >
              <span aria-hidden="true">+</span>
              Generate QR Code
            </button>
          </div>
        </div>

        {exportError ? <p className="qr-export-error">{exportError}</p> : null}

        {isLoading ? (
          <section className="qr-table-card qr-loading-card">Loading QR codes...</section>
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={() => setRetryKey((key) => key + 1)} />
        ) : (
          <QRCodeTable
            currentPage={safeCurrentPage}
            endItem={endItem}
            onPageChange={(page) => updateQuery({ page: String(page) })}
            onStatusChange={handleStatusUpdate}
            onViewDetails={handleViewDetails}
            qrCodes={pagedQRCodes}
            startItem={startItem}
            totalCount={pagination.total}
            totalPages={totalPages}
          />
        )}

        {isGenerateOpen ? (
          <GenerateQRCodeModal
            isSubmitting={isGenerating}
            onClose={() => setIsGenerateOpen(false)}
            onGenerate={handleGenerate}
          />
        ) : null}

        {generatedQRCode ? (
          <QRCodeGeneratedModal
            onClose={() => setGeneratedQRCode(null)}
            qrCode={generatedQRCode}
          />
        ) : null}
      </main>
    </AdminLayout>
  )
}
