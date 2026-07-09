import { downloadQRCodeImage, printCurrentPage } from '../../utils/qrCodeActions.js'

export default function QRCodeGeneratedModal({ onClose, qrCode }) {
  return (
    <div className="qr-modal-overlay" role="presentation">
      <section className="qr-modal generated-modal" role="dialog" aria-modal="true">
        <header className="qr-modal-header">
          <h2>QR Code Generated</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>

        <div className="qr-generated-body">
          <div className="qr-image-frame">
            <img src={qrCode.qrImageUrl} alt={`${qrCode.id} QR code`} />
          </div>

          <dl className="qr-detail-list qr-generated-list">
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
              <dt>Expires</dt>
              <dd>{qrCode.expiresAt}</dd>
            </div>
          </dl>

          <div className="qr-modal-actions">
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
            <button className="qr-primary-button" onClick={onClose} type="button">
              Done
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
