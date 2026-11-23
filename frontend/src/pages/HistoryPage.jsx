import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Star, Trash2 } from 'lucide-react'
import useResumeStore from '../store/resumeStore'
import { SkeletonCard } from '../components/ui'

const types = { optimized: 'Optimized', built: 'Built', ats_check: 'ATS check', roasted: 'Roast' }

export default function HistoryPage() {
  const { history, historyLoading, historyError, fetchHistory, toggleFavorite, deleteResume } = useResumeStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState('')
  useEffect(() => { fetchHistory() }, [fetchHistory])

  const visible = history.filter(item =>
    (filter === 'all' || (filter === 'favorites' ? item.isFavorite : item.type === filter)) &&
    (item.title || '').toLowerCase().includes(query.trim().toLowerCase()),
  )

  async function update(id, action) {
    setPending(true)
    setActionError('')
    try {
      const result = await action(id)
      if (!result.success) setActionError(result.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="page-spacing mx-auto max-w-4xl sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>Saved results</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Open or download any of your 50 most recent saved items.</p>

      <div className="my-3 flex flex-col gap-2 min-[380px]:flex-row sm:my-6 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="search" aria-label="Search saved results" value={query} onChange={event => setQuery(event.target.value)}
            className="input pl-9" placeholder="Search by title" />
        </div>
        <select className="input min-[380px]:max-w-32 sm:max-w-[190px]" aria-label="Filter saved results" value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="all">All results</option>
          <option value="favorites">Favorites</option>
          {Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>

      {actionError && <p className="resume-error mb-4" role="alert">{actionError}</p>}
      {historyError ? <div className="card p-3.5 sm:p-5">
        <p className="resume-error" role="alert">{historyError}</p>
        <button type="button" className="btn-secondary mt-3" onClick={fetchHistory}>Retry</button>
      </div> : historyLoading ? (
        <div className="space-y-3">{['first', 'second', 'third'].map(key => <SkeletonCard key={key} lines={2} />)}</div>
      ) : visible.length ? (
        <ul className="space-y-2 sm:space-y-3">
          {visible.map(item => <li key={item._id} className="card flex items-center gap-1.5 p-2.5 sm:gap-3 sm:p-4">
            <FileText size={16} className="shrink-0 text-blue-500 sm:h-[19px] sm:w-[19px]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <Link className="block truncate font-medium hover:underline" to={'/history/' + item._id} style={{ color: 'var(--text-primary)' }}>{item.title}</Link>
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{types[item.type]}</span>
                <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time>
                {typeof item.atsScore === 'number' && <span>Readiness {item.atsScore}/100</span>}
              </div>
            </div>
            <button type="button" aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={item.isFavorite} disabled={pending}
              className="btn-ghost h-9 w-9 shrink-0 justify-center p-0 sm:h-auto sm:w-auto sm:p-2" onClick={() => update(item._id, toggleFavorite)}>
              <Star size={17} fill={item.isFavorite ? 'currentColor' : 'none'} className={item.isFavorite ? 'text-amber-500' : ''} />
            </button>
            <button type="button" aria-label="Delete saved result" className="btn-ghost h-9 w-9 shrink-0 justify-center p-0 text-red-400 sm:h-auto sm:w-auto sm:p-2" disabled={pending}
              onClick={() => { if (window.confirm('Delete this saved result?')) update(item._id, deleteResume) }}>
              <Trash2 size={17} />
            </button>
          </li>)}
        </ul>
      ) : (
        <div className="card p-4 text-center sm:p-8" style={{ color: 'var(--text-secondary)' }}>
          {query || filter !== 'all' ? 'No results match this search.' : 'Your saved resumes and reports will appear here.'}
        </div>
      )}
    </div>
  )
}
