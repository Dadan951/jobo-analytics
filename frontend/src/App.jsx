import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LegalPage from './pages/LegalPage'
import PricingPage from './pages/PricingPage'
import PricingSuccessPage from './pages/PricingSuccessPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ContenuPage from './pages/ContenuPage'
import ProfilePage from './pages/ProfilePage'
import TicketsPage from './pages/TicketsPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminTicketsPage from './pages/admin/AdminTicketsPage'
import AppLayout from './components/layout/AppLayout'

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Legal pages */}
          <Route path="/mentions-legales" element={<LegalPage />} />
          <Route path="/rgpd" element={<LegalPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/pricing/success" element={<PricingSuccessPage />} />

          {/* Onboarding — privé, hors AppLayout (nouvel inscrit sans abonnement) */}
          <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

          {/* Authenticated user app */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contenus" element={<ContenuPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin section */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
