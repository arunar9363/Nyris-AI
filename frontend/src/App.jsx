import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useUIStore from './store/uiStore'
import useAuthStore from './store/authStore'

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import OptimizerPage from './pages/OptimizerPage'
import BuilderPage from './pages/BuilderPage'
import HistoryPage from './pages/HistoryPage'
import ResumeLibraryPage from './pages/ResumeLibraryPage'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ATSPage = lazy(() => import('./pages/ATSPage'))
const RoasterPage = lazy(() => import('./pages/RoasterPage'))
const SavedResumePage = lazy(() => import('./pages/SavedResumePage'))
const pageLoading = <p className="p-6" role="status">Loading…</p>

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
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
          <Route path="resume-library" element={<ResumeLibraryPage />} />
          <Route path="about" element={<Suspense fallback={pageLoading}><AboutPage /></Suspense>} />
          <Route path="ats" element={
            <ProtectedRoute><Suspense fallback={pageLoading}><ATSPage /></Suspense></ProtectedRoute>
          } />
          <Route path="builder" element={
            <ProtectedRoute><BuilderPage /></ProtectedRoute>
          } />
          <Route path="roaster" element={
            <ProtectedRoute><Suspense fallback={pageLoading}><RoasterPage /></Suspense></ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />
          <Route path="history/:id" element={<ProtectedRoute><Suspense fallback={pageLoading}><SavedResumePage /></Suspense></ProtectedRoute>} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
