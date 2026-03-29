import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useUIStore from './store/uiStore'
import useAuthStore from './store/authStore'

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import OptimizerPage from './pages/OptimizerPage'
import BuilderPage from './pages/BuilderPage'
import ATSPage from './pages/ATSPage'
import RoasterPage from './pages/RoasterPage'
import AboutPage from './pages/AboutPage'
import HistoryPage from './pages/HistoryPage'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const initTheme = useUIStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="optimizer" element={<OptimizerPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="ats" element={
            <ProtectedRoute><ATSPage /></ProtectedRoute>
          } />
          <Route path="builder" element={
            <ProtectedRoute><BuilderPage /></ProtectedRoute>
          } />
          <Route path="roaster" element={
            <ProtectedRoute><RoasterPage /></ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
