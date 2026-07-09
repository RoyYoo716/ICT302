import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import QRStatusBadge from '../components/qr/QRStatusBadge.jsx'
import { getQRCodeById } from '../services/api.js'
import { downloadQRCodeImage, printCurrentPage } from '../utils/qrCodeActions.js'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function QRCodeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [qrCode, setQRCode] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadQRCode() {
      try {
        const response = await getQRCodeById(id)

        if (!isMounted) {
          return
        }

        setQRCode(response.qrCode)
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQRCode()

    return () => {
      isMounted = false
    }
  }, [id])

  function handleBack() {
    navigate(location.state?.returnTo || '/qr-codes')
  }

  return (
    <AdminLayout title="QR Code Detail" activeSection="qr-codes">
      <main className="qr-detail-page">
        {isLoading ? (
          <section className="qr-detail-card">Loading QR code...</section>
        ) : null}

        {!isLoading && error ? (
          <section className="qr-detail-card">
            <p className="qr-detail-error">{error}</p>
            <button className="qr-primary-button" onClick={handleBack} type="button">
              Back
            </button>
          </section>
        ) : null}

        {!isLoading && qrCode ? (
          <section className="qr-detail-card" aria-label="QR code details">
            <div className="qr-image-frame qr-detail-image-frame">
              <img src={qrCode.qrImageUrl} alt={`${qrCode.id} QR code`} />
            </div>

            <dl className="qr-detail-list">
              <div>
                <dt>QR Code ID</dt>
                <dd>{qrCode.id}</dd>
              </div>
              <div>
                <dt>Destination URL</dt>
                <dd>
                  <a href={qrCode.destinationUrl} target="_blank" rel="noreferrer">
                    {qrCode.destinationUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <QRStatusBadge status={qrCode.status} />
                </dd>
              </div>
              <div>
                <dt>Expiry Date</dt>
                <dd>{qrCode.expiryDate}</dd>
              </div>
              <div>
                <dt>Total Scans</dt>
                <dd>{formatNumber(qrCode.scans)}</dd>
              </div>
            </dl>

            <div className="qr-detail-actions">
              <button
                className="qr-secondary-button"
                onClick={() => downloadQRCodeImage(qrCode)}
                type="button"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Download PNG
              </button>
              <button className="qr-secondary-button" onClick={printCurrentPage} type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M7 14h10v6H7z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Print
              </button>
              <button className="qr-primary-button" onClick={handleBack} type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="m12 19-7-7 7-7M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Back
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </AdminLayout>
  )
}
