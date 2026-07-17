import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import QRCodeDetailPage from './pages/QRCodeDetailPage.jsx'
import QRCodeManagementPage from './pages/QRCodeManagementPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import './styles/alerts.css'
import './styles/auth.css'
import './styles/dashboard.css'
import './styles/qr-codes.css'
import './styles/settings.css'
import './styles/users.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/qr-codes" element={<RequireAuth><QRCodeManagementPage /></RequireAuth>} />
      <Route path="/qr-codes/:id" element={<RequireAuth><QRCodeDetailPage /></RequireAuth>} />
      <Route path="/alerts" element={<RequireAuth><AlertsPage /></RequireAuth>} />
      <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
