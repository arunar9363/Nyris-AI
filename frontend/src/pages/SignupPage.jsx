import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, UserPlus, ChevronDown } from 'lucide-react'
import useAuthStore from '../store/authStore'
import logoDark from '../assets/logos/logo-dark.png'
import logoLight from '../assets/logos/logo-light.png'
import useUIStore from '../store/uiStore'

const DEGREES = ['N/A','BTech','BE','BCA','BSc','MTech','ME','MCA','MSc','MBA','BBA','BCom','BA','other']
const BRANCHES = [
  'Computer Science & Engineering','Information Technology','Electronics & Communication',
  'Electrical Engineering','Mechanical Engineering','Civil Engineering',
  'Data Science','Artificial Intelligence','Cybersecurity',
  'Chemical Engineering','Biotechnology','Physics','Mathematics','Commerce','Arts','other'
]
const EDU_LEVELS = [
  { value: 'school', label: 'School (10th/12th)' },
  { value: 'ug', label: 'Undergraduate (UG)' },
  { value: 'pg', label: 'Postgraduate (PG)' },
  { value: 'other', label: 'Other' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup, isLoading, error, clearError } = useAuthStore()
  const { theme } = useUIStore()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    educationLevel: '', degree: 'N/A', branch: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    clearError(); setLocalError('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.educationLevel)
      return setLocalError('Please fill all required fields.')
    if (form.password !== form.confirmPassword)
      return setLocalError('Passwords do not match.')
    if (form.password.length < 6)
      return setLocalError('Password must be at least 6 characters.')
    const { confirmPassword, ...payload } = form
    const result = await signup(payload)
    if (result.success) navigate(location.state?.from || '/dashboard', { replace: true })
  }

  const displayError = localError || error

  return (
    <div className="bg-mesh relative flex min-h-screen items-center justify-center px-3 py-5 sm:px-4 sm:py-12">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgb(var(--accent-purple-rgb) / .06), transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
        <div className="card p-4 sm:p-8">
          <div className="mb-4 text-center sm:mb-8">
            <Link to="/" className="mb-2 inline-block sm:mb-4">
              <img src={theme === 'dark' ? logoDark : logoLight} alt="Nyris" className="mx-auto h-6 w-auto sm:h-9" />
            </Link>
            <h1 className="mb-1 text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Unlock all Nyris AI features for free
            </p>
          </div>

          {displayError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="name" value={form.name} onChange={handleChange} className="input pl-10" placeholder="Arun Pratap Singh" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>

            {/* Education Level */}
            <div>
              <label className="label">Education Level *</label>
              <div className="relative">
                <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <select name="educationLevel" value={form.educationLevel} onChange={handleChange}
                  className="input pl-10 pr-10 appearance-none cursor-pointer">
                  <option value="">Select education level</option>
                  {EDU_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
            </div>

            {/* Degree + Branch */}
            {(form.educationLevel === 'ug' || form.educationLevel === 'pg') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="grid gap-2.5 min-[420px]:grid-cols-2 sm:gap-3">
                <div>
                  <label className="label">Degree</label>
                  <div className="relative">
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <select name="degree" value={form.degree} onChange={handleChange}
                      className="input pr-10 appearance-none cursor-pointer">
                      {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Branch</label>
                  <div className="relative">
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <select name="branch" value={form.branch} onChange={handleChange}
                      className="input pr-10 appearance-none cursor-pointer">
                      <option value="">Select branch</option>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password */}
            <div className="grid gap-2.5 min-[420px]:grid-cols-2 sm:gap-3">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} className="input pl-10 pr-10" placeholder="Min 6 chars" />
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    aria-label={showPass ? 'Hide passwords' : 'Show passwords'}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input name="confirmPassword" type={showPass ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={handleChange} className="input pl-10" placeholder="Repeat" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary mt-1 w-full justify-center py-2 sm:mt-2 sm:py-3 sm:text-base">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account...
                </span>
              ) : (
                <><UserPlus size={17} /> Create Account</>
              )}
            </button>
          </form>

          <p className="mt-3 text-center text-sm sm:mt-5" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" state={location.state} className="font-semibold hover:underline" style={{ color: 'var(--accent-blue)' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
