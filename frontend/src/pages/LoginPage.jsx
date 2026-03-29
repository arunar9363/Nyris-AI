import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import useAuthStore from '../store/authStore'
import logoDark from '../assets/logos/logo-dark.png'
import logoLight from '../assets/logos/logo-light.png'
import useUIStore from '../store/uiStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const { theme } = useUIStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    clearError()
    setLocalError('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setLocalError('Please fill all fields.')
    const result = await login(form.email, form.password)
    if (result.success) navigate('/dashboard')
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mesh">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.1), transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <img src={theme === 'dark' ? logoDark : logoLight} alt="Nyris" className="h-9 mx-auto" />
            </Link>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to access all Nyris features
            </p>
          </div>

          {/* Error */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="input pl-10" placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} className="input pl-10 pr-10" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 text-base rounded-xl">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                <><LogIn size={17} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--accent-blue)' }}>
                Create one free
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <Link to="/optimizer" className="text-xs flex items-center justify-center gap-1.5 hover:underline"
              style={{ color: 'var(--text-muted)' }}>
              <Sparkles size={11} /> Continue without account (Optimizer only)
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
