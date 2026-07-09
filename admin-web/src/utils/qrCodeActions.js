export function downloadQRCodeImage(qrCode) {
  const link = document.createElement('a')
  link.href = qrCode.qrImageUrl
  link.download = `${qrCode.id}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function printCurrentPage() {
  window.print()
}
