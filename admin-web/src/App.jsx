import { Navigate, Route, Routes } from 'react-router-dom'
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
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/qr-codes" element={<QRCodeManagementPage />} />
      <Route path="/qr-codes/:id" element={<QRCodeDetailPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
