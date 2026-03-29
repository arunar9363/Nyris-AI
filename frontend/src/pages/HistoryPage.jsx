import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Star, Trash2, Search, Filter } from 'lucide-react'
import useResumeStore from '../store/resumeStore'
import { SkeletonCard } from '../components/ui/index'

const TYPE_LABELS = { optimized: 'Optimized', built: 'Built', ats_check: 'ATS Check', roasted: 'Roasted' }
const TYPE_COLORS = { optimized: '#3b82f6', built: '#8b5cf6', ats_check: '#06b6d4', roasted: '#f59e0b' }

export default function HistoryPage() {
  const { history, historyLoading, fetchHistory, toggleFavorite, deleteResume } = useResumeStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const filtered = history
    .filter((r) => filter === 'all' || (filter === 'favorites' ? r.isFavorite : r.type === filter))
    .filter((r) => !search || r.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          My Resumes
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{history.length} total resumes saved</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10"
            placeholder="Search resumes..." />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'favorites', 'optimized', 'built', 'ats_check', 'roasted'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all"
              style={{
                borderColor: filter === f ? 'var(--accent-blue)' : 'var(--border)',
                background: filter === f ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: filter === f ? 'var(--accent-blue)' : 'var(--text-muted)',
              }}>
              {f === 'all' ? 'All' : f === 'favorites' ? '⭐ Favorites' : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {historyLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <SkeletonCard key={i} lines={2} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No resumes found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Try a different search term' : 'Create a resume to see it here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((resume, i) => (
            <motion.div key={resume._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 flex items-center gap-4 hover:border-blue-500/20 transition-all">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${TYPE_COLORS[resume.type] || '#3b82f6'}15` }}>
                <FileText size={18} style={{ color: TYPE_COLORS[resume.type] || '#3b82f6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{resume.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${TYPE_COLORS[resume.type]}15`, color: TYPE_COLORS[resume.type] }}>
                    {TYPE_LABELS[resume.type]}
                  </span>
                  {resume.isFavorite && <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(resume.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {resume.atsScore && (
                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>ATS: {resume.atsScore}</span>
                  )}
                  {resume.templateId && (
                    <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{resume.templateId}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFavorite(resume._id)}
                  className="p-2 rounded-lg hover:bg-yellow-500/15 transition-colors"
                  title={resume.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <Star size={15} style={{ color: resume.isFavorite ? '#f59e0b' : 'var(--text-muted)', fill: resume.isFavorite ? '#f59e0b' : 'none' }} />
                </button>
                <button onClick={() => { if (window.confirm('Delete this resume?')) deleteResume(resume._id) }}
                  className="p-2 rounded-lg hover:bg-red-500/15 transition-colors text-red-400">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
