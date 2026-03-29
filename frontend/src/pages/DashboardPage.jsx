import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, FileText, BarChart3, Flame, Star, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useResumeStore from '../store/resumeStore'
import { SkeletonCard } from '../components/ui/index'

const QUICK_ACTIONS = [
  { label: 'Optimize Resume', desc: 'Tailor to a job', icon: Sparkles, path: '/optimizer', color: '#3b82f6', free: true },
  { label: 'Build Resume', desc: 'Start from scratch', icon: FileText, path: '/builder', color: '#8b5cf6' },
  { label: 'Check ATS Score', desc: 'Analyze your resume', icon: BarChart3, path: '/ats', color: '#06b6d4' },
  { label: 'Roast Resume', desc: 'Honest feedback', icon: Flame, path: '/roaster', color: '#f59e0b' },
]

const TYPE_LABELS = { optimized: 'Optimized', built: 'Built', ats_check: 'ATS Check', roasted: 'Roasted' }
const TYPE_COLORS = { optimized: '#3b82f6', built: '#8b5cf6', ats_check: '#06b6d4', roasted: '#f59e0b' }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { history, historyLoading, fetchHistory, toggleFavorite } = useResumeStore()

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const recent = history.slice(0, 5)
  const favoriteCount = history.filter((r) => r.isFavorite).length
  const avgAts = history.filter((r) => r.atsScore).length
    ? Math.round(history.filter((r) => r.atsScore).reduce((s, r) => s + r.atsScore, 0) / history.filter((r) => r.atsScore).length)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Here's your Nyris dashboard
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Resumes', value: history.length, icon: FileText, color: '#3b82f6' },
          { label: 'Favorites', value: favoriteCount, icon: Star, color: '#f59e0b' },
          { label: 'Avg ATS Score', value: avgAts ? `${avgAts}%` : '—', icon: TrendingUp, color: '#10b981' },
          { label: 'This Month', value: history.filter((r) => new Date(r.createdAt) > new Date(Date.now() - 30 * 86400000)).length, icon: Clock, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
            className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, path, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}>
              <Link to={path} className="group card p-5 block hover:-translate-y-1 transition-all duration-200 hover:border-blue-500/30">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>Recent Resumes</h2>
          <Link to="/history" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="card p-10 text-center">
            <FileText size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No resumes yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Start with the JD Optimizer</p>
            <Link to="/optimizer" className="btn-primary inline-flex"><Sparkles size={14} /> Optimize Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((resume, i) => (
              <motion.div key={resume._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="card p-4 flex items-center gap-4 hover:border-blue-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${TYPE_COLORS[resume.type] || '#3b82f6'}15` }}>
                  <FileText size={16} style={{ color: TYPE_COLORS[resume.type] || '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
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
                <button onClick={() => toggleFavorite(resume._id)} className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/15">
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
