import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileEdit, FileText, BarChart3, Flame, Star, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useResumeStore from '../store/resumeStore'
import { SkeletonCard } from '../components/ui/index'

const QUICK_ACTIONS = [
  { label: 'Optimize Resume', desc: 'Tailor to a job', icon: FileEdit, path: '/optimizer', color: '#3b82f6', free: true },
  { label: 'Build Resume', desc: 'Start from scratch', icon: FileText, path: '/builder', color: '#8b5cf6' },
  { label: 'Check ATS Score', desc: 'Analyze your resume', icon: BarChart3, path: '/ats', color: '#06b6d4' },
  { label: 'Roast Resume', desc: 'Honest feedback', icon: Flame, path: '/roaster', color: '#f59e0b' },
]

const TYPE_LABELS = { optimized: 'Optimized', built: 'Built', ats_check: 'ATS Check', roasted: 'Roasted' }
const TYPE_COLORS = { optimized: '#3b82f6', built: '#8b5cf6', ats_check: '#06b6d4', roasted: '#f59e0b' }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { history, historyLoading, historyError, fetchHistory, toggleFavorite } = useResumeStore()
  const [actionError, setActionError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const recent = history.slice(0, 5)
  const favoriteCount = history.filter((r) => r.isFavorite).length
  const scored = history.filter(item => typeof item.atsScore === 'number')
  const avgAts = scored.length ? Math.round(scored.reduce((sum, item) => sum + item.atsScore, 0) / scored.length) : null

  async function favorite(id) {
    setUpdating(true)
    setActionError('')
    try {
      const result = await toggleFavorite(id)
      if (!result.success) setActionError(result.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page-spacing mx-auto max-w-6xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-10">
        <h1 className="mb-1 break-words text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          Here's your Nyris dashboard
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="mb-5 grid grid-cols-2 gap-2 sm:mb-10 sm:gap-4 md:grid-cols-4">
        {[
          { label: 'Recent saved items', value: history.length, icon: FileText, color: '#3b82f6' },
          { label: 'Recent favorites', value: favoriteCount, icon: Star, color: '#f59e0b' },
          { label: 'Average readiness', value: avgAts === null ? '—' : avgAts + '/100', icon: TrendingUp, color: '#10b981' },
          { label: 'This Month', value: history.filter((r) => new Date(r.createdAt) > new Date(Date.now() - 30 * 86400000)).length, icon: Clock, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
            className="card min-w-0 p-3 sm:p-5">
            <div className="mb-1.5 flex items-center justify-between sm:mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl" style={{ background: `${color}15` }}>
                <Icon size={14} className="sm:h-4 sm:w-4" style={{ color }} />
              </div>
            </div>
            <div className="mb-0.5 text-lg font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-5 sm:mb-10">
        <h2 className="mb-2.5 text-base font-bold sm:mb-5 sm:text-lg" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, path, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}>
              <Link to={path} className="group card block p-3 transition-all duration-200 hover:-translate-y-1 hover:border-brand/30 sm:p-5">
                <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-110 sm:mb-3 sm:h-10 sm:w-10 sm:rounded-2xl"
                  style={{ background: `${color}15` }}>
                  <Icon size={15} className="sm:h-[18px] sm:w-[18px]" style={{ color }} />
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{label}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Resumes */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="mb-2.5 flex items-center justify-between sm:mb-5">
          <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>Recent Resumes</h2>
          <Link to="/history" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>
        </div>

        {actionError && <p className="resume-error mb-3" role="alert">{actionError}</p>}
        {historyError ? (
          <div className="card p-3.5 sm:p-5">
            <p className="resume-error" role="alert">{historyError}</p>
            <button type="button" className="btn-secondary mt-3" onClick={fetchHistory}>Retry</button>
          </div>
        ) : historyLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="card p-5 text-center sm:p-10">
            <FileText size={24} className="mx-auto mb-2 sm:mb-3 sm:h-8 sm:w-8" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No resumes yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Start with the JD Optimizer</p>
            <Link to="/optimizer" className="btn-primary inline-flex">Optimize Now <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((resume, i) => (
              <motion.div key={resume._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="card flex items-center gap-2 p-2.5 transition-all hover:border-brand/20 sm:gap-4 sm:p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl"
                  style={{ background: `${TYPE_COLORS[resume.type] || '#3b82f6'}15` }}>
                  <FileText size={16} style={{ color: TYPE_COLORS[resume.type] || '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 sm:flex-nowrap">
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{resume.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                      style={{ background: `${TYPE_COLORS[resume.type]}15`, color: TYPE_COLORS[resume.type] }}>
                      {TYPE_LABELS[resume.type]}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(resume.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {resume.atsScore ? ` · ATS: ${resume.atsScore}` : ''}
                  </p>
                </div>
                <button type="button" disabled={updating} aria-label="Toggle favorite" onClick={() => favorite(resume._id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-yellow-500/15 sm:h-auto sm:w-auto sm:p-1.5">
                  <Star size={14} style={{ color: resume.isFavorite ? '#f59e0b' : 'var(--text-muted)', fill: resume.isFavorite ? '#f59e0b' : 'none' }} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
