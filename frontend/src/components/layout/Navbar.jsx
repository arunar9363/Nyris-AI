import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Menu, X, LogOut, LayoutDashboard,
  ChevronDown, Sparkles, FileText, BarChart3, Flame, Info
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useUIStore from '../../store/uiStore'
import logoDark from '../../assets/logos/logo-dark.png'
import logoLight from '../../assets/logos/logo-light.png'

const navLinks = [
  { label: 'Optimizer', path: '/optimizer', icon: Sparkles, free: true },
  { label: 'Builder', path: '/builder', icon: FileText, free: false },
  { label: 'ATS Checker', path: '/ats', icon: BarChart3, free: false },
  { label: 'Roaster', path: '/roaster', icon: Flame, free: false },
  { label: 'About', path: '/about', icon: Info, free: true },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const authed = isAuthenticated()

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const isDark = theme === 'dark'
  const navBg = isDark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.95)'
  const navBorder = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.1)'

  return (
    <nav className="sticky top-0 z-50 border-b" style={{
      background: navBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderColor: navBorder,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={isDark ? logoDark : logoLight}
              alt="Nyris"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path, icon: Icon, free }) => {
              const active = location.pathname === path
              const locked = !free && !authed
              return (
                <Link
                  key={path}
                  to={locked ? '/login' : path}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ color: active ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
                >
                  <Icon size={14} />
                  {label}
                  {locked && (
                    <span className="ml-1 text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--accent-purple)' }}>
                      PRO
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ background: 'rgba(59,130,246,0.1)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-lg"
              title="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Auth */}
            {authed ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 hover:border-blue-500/40"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border overflow-hidden z-50"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                      <div className="p-1">
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-500/10"
                          style={{ color: 'var(--text-primary)' }}>
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link to="/history" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-500/10"
                          style={{ color: 'var(--text-primary)' }}>
                          <FileText size={14} /> My Resumes
                        </Link>
                        <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10 text-red-400">
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t overflow-hidden"
            style={{ borderColor: navBorder, background: isDark ? 'var(--bg-card)' : '#ffffff' }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ label, path, icon: Icon, free }) => {
                const locked = !free && !authed
                return (
                  <Link
                    key={path}
                    to={locked ? '/login' : path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      color: location.pathname === path ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      background: location.pathname === path ? 'rgba(59,130,246,0.1)' : 'transparent',
                    }}
                  >
                    <Icon size={15} />
                    {label}
                    {locked && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                        style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>
                        PRO
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
