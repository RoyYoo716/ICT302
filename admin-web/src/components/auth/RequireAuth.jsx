import { Navigate } from 'react-router-dom'

// Route guard: renders children only when a session exists.
// This is UX, not security — real enforcement is the backend's
// requireAdmin middleware. This just avoids showing pages that
// would only produce 401s.
const SESSION_KEY = 'vafpqr.admin.session'

function hasSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY)
        if (!raw) return false
        const session = JSON.parse(raw)
        return Boolean(session?.token)
    } catch {
        return false
    }
}

export default function RequireAuth({ children }) {
    if (!hasSession()) {
        return <Navigate to="/login" replace />
    }
    return children
}