import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import GenerateQRCodeModal from '../components/qr/GenerateQRCodeModal.jsx'
import QRCodeGeneratedModal from '../components/qr/QRCodeGeneratedModal.jsx'
import QRCodeTable from '../components/qr/QRCodeTable.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import {
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
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQRCode, setGeneratedQRCode] = useState(null)

  const searchTerm = searchParams.get('search') || ''
  const selectedStatus = searchParams.get('status') || 'All'
  const currentPage = normalizePage(searchParams.get('page'))

  useEffect(() => {
    let isMounted = true

    async function loadQRCodes() {
      const response = await getQRCodes()

      if (!isMounted) {
        return
      }

      setQRCodes(response.qrCodes)
      setIsLoading(false)
    }

    loadQRCodes()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredQRCodes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return qrCodes.filter((qrCode) => {
      const matchesStatus =
        selectedStatus === 'All' || qrCode.status === selectedStatus
      const matchesSearch =
        !normalizedSearch ||
        qrCode.id.toLowerCase().includes(normalizedSearch) ||
        qrCode.destinationUrl.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [qrCodes, searchTerm, selectedStatus])

  const totalPages = Math.max(Math.ceil(filteredQRCodes.length / PAGE_SIZE), 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const pagedQRCodes = filteredQRCodes.slice(startIndex, startIndex + PAGE_SIZE)
  const startItem = filteredQRCodes.length === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + PAGE_SIZE, filteredQRCodes.length)

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

          <button
            className="generate-qr-button"
            onClick={() => setIsGenerateOpen(true)}
            type="button"
          >
            <span aria-hidden="true">+</span>
            Generate QR Code
          </button>
        </div>

        {isLoading ? (
          <section className="qr-table-card qr-loading-card">Loading QR codes...</section>
        ) : (
          <QRCodeTable
            currentPage={safeCurrentPage}
            endItem={endItem}
            onPageChange={(page) => updateQuery({ page: String(page) })}
            onStatusChange={handleStatusUpdate}
            onViewDetails={handleViewDetails}
            qrCodes={pagedQRCodes}
            startItem={startItem}
            totalCount={filteredQRCodes.length}
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
