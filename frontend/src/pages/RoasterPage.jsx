import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, RefreshCw, AlertCircle, CheckCircle, Lightbulb, Star } from 'lucide-react'
import useResumeStore from '../store/resumeStore'
import { FileDropzone, ProgressBar } from '../components/ui/index'

export default function RoasterPage() {
  const { roastResume, roastResult, roastLoading } = useResumeStore()
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [error, setError] = useState('')

  const handleRoast = async () => {
    if (!file && !resumeText.trim()) return setError('Please upload your resume or paste text.')
    setError('')
    const result = await roastResume(file, resumeText)
    if (!result.success) setError(result.message)
  }

  const handleReset = () => {
    setFile(null); setResumeText(''); setError('')
    useResumeStore.setState({ roastResult: null })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border"
          style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }}>
          <Flame size={12} /> Resume Roaster
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          Get Roasted. Get Better. 🔥
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Brutally honest (and funny) feedback on your resume — because tough love works.
        </p>
      </motion.div>

      {!roastResult ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 space-y-6">
          <div className="p-4 rounded-xl border" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p className="text-sm" style={{ color: '#fbbf24' }}>
              🔥 <strong>Warning:</strong> Our AI roaster is honest but never mean-spirited. Expect humor + real actionable feedback.
            </p>
          </div>

          <FileDropzone onDrop={(f) => { setFile(f); setResumeText('') }} file={file} onRemove={() => setFile(null)} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>OR paste text</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <textarea value={resumeText} onChange={(e) => { setResumeText(e.target.value); setFile(null) }}
            className="input resize-none text-xs font-mono" rows={8} placeholder="Paste resume text here..." />

          {error && (
            <p className="text-sm px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          {roastLoading ? (
            <div className="py-4">
              <ProgressBar value={60} stage="AI is preparing your roast... 🔥" />
            </div>
          ) : (
            <button onClick={handleRoast}
              className="w-full justify-center py-3 text-base rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#d97706,#dc2626)', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}>
              <Flame size={18} /> Roast My Resume
            </button>
          )}
        </motion.div>
      ) : (
        <RoastResult result={roastResult} onReset={handleReset} />
      )}
    </div>
  )
}

function RoastResult({ result, onReset }) {
  const { funnyRoast, seriousFeedback, mistakesBreakdown, improvementTips, overallRating, verdict } = result

  const ratingColor = overallRating?.includes('A') ? '#10b981' : overallRating?.includes('B') ? '#3b82f6'
    : overallRating?.includes('C') ? '#f59e0b' : '#ef4444'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Rating */}
      <div className="card p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Overall Rating</p>
        <div className="text-6xl font-black mb-2" style={{ color: ratingColor, fontFamily: 'DM Sans' }}>{overallRating}</div>
        {verdict && (
          <p className="text-base italic" style={{ color: 'var(--text-secondary)' }}>"{verdict}"</p>
        )}
      </div>

      {/* Funny Roast */}
      <div className="card p-6" style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} style={{ color: '#f59e0b' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>The Roast 🔥</h3>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{funnyRoast}</p>
      </div>

      {/* Serious Feedback */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} style={{ color: '#3b82f6' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Honest Assessment</h3>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{seriousFeedback}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Mistakes */}
        {mistakesBreakdown?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} style={{ color: '#ef4444' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Mistakes Found</h3>
            </div>
            <ul className="space-y-2">
              {mistakesBreakdown.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-red-400 shrink-0 mt-0.5 font-bold">{i + 1}.</span> {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {improvementTips?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} style={{ color: '#10b981' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>How to Improve</h3>
            </div>
            <ul className="space-y-2">
              {improvementTips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: '#10b981' }} /> {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={onReset} className="btn-secondary w-full justify-center py-3 rounded-xl">
        <RefreshCw size={15} /> Roast Another Resume
      </button>
    </motion.div>
  )
}
