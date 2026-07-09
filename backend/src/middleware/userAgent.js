// userAgent.js — Detect whether the request came from our mobile app.
// The app sets a custom User-Agent: SecureQRApp/1.0

function isMobileApp(req) {
  const ua = req.headers['user-agent'] || '';
  return ua.includes('SecureQRApp');
}

module.exports = { isMobileApp };
