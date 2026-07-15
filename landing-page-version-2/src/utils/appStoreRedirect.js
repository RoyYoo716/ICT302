const unsupportedDeviceMessage =
  'Please open this page on an Android or iOS device to download the VAFPQR App.'

function getConfiguredUrl(name) {
  const value = import.meta.env?.[name]
  return typeof value === 'string' ? value.trim() : ''
}

export function detectMobilePlatform(navigatorInfo = window.navigator) {
  const userAgent = navigatorInfo.userAgent || navigatorInfo.vendor || ''
  const platform = navigatorInfo.platform || ''

  if (/android/i.test(userAgent)) {
    return 'android'
  }

  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
  const isIPadOSDevice =
    platform === 'MacIntel' && navigatorInfo.maxTouchPoints > 1

  if (isIOSDevice || isIPadOSDevice) {
    return 'ios'
  }

  return 'unknown'
}

export function getAppStoreRedirectTarget() {
  const platform = detectMobilePlatform()
  const androidStoreUrl = getConfiguredUrl('VITE_ANDROID_STORE_URL')
  const iosStoreUrl = getConfiguredUrl('VITE_IOS_STORE_URL')
  const fallbackUrl = getConfiguredUrl('VITE_APP_DOWNLOAD_FALLBACK_URL')

  if (platform === 'android' && androidStoreUrl) {
    return { platform, url: androidStoreUrl, message: '' }
  }

  if (platform === 'ios' && iosStoreUrl) {
    return { platform, url: iosStoreUrl, message: '' }
  }

  if (fallbackUrl) {
    return { platform, url: fallbackUrl, message: '' }
  }

  return { platform, url: '', message: unsupportedDeviceMessage }
}

export function redirectToAppStore() {
  const target = getAppStoreRedirectTarget()

  if (target.url) {
    window.location.assign(target.url)
    return { didRedirect: true, message: '' }
  }

  return { didRedirect: false, message: target.message }
}
