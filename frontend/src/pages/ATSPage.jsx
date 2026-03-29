import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, CheckCircle, AlertTriangle, Lightbulb, RefreshCw, Shield } from 'lucide-react'
import useResumeStore from '../store/resumeStore'
import { FileDropzone, ATSCircle, ProgressBar } from '../components/ui/index'

export default function ATSPage() {
  const { checkATS, atsResult, atsLoading } = useResumeStore()
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jd, setJd] = useState('')
  const [error, setError] = useState('')

  const handleCheck = async () => {
    if (!file && !resumeText.trim()) return setError('Please upload your resume or paste its text.')
    setError('')
    const result = await checkATS(file, jd, resumeText)
    if (!result.success) setError(result.message)
  }

  const handleReset = () => {
    setFile(null); setResumeText(''); setJd(''); setError('')
    useResumeStore.setState({ atsResult: null })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border"
          style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.25)', color: '#22d3ee' }}>
          <BarChart3 size={12} /> ATS Score Checker
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          How ATS-Ready Is Your Resume?
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Instantly score your resume and get actionable improvements
        </p>
      </motion.div>

      {!atsResult ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 space-y-6">
          <FileDropzone onDrop={(f) => { setFile(f); setResumeText('') }} file={file} onRemove={() => setFile(null)} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>OR paste text</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <textarea value={resumeText} onChange={(e) => { setResumeText(e.target.value); setFile(null) }}
            className="input resize-none text-xs font-mono" rows={6} placeholder="Paste resume text here..." />

          <div>
            <label className="label">Job Description (Optional — improves accuracy)</label>
            <textarea value={jd} onChange={(e) => setJd(e.target.value)}
              className="input resize-none" rows={4} placeholder="Paste job description for better keyword matching..." />
          </div>

          {error && (
            <p className="text-sm px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          {atsLoading ? (
            <div className="py-4">
              <ProgressBar value={65} stage="Analyzing ATS compatibility..." />
            </div>
          ) : (
            <button onClick={handleCheck} className="btn-primary w-full justify-center py-3 text-base rounded-xl">
              <BarChart3 size={17} /> Check ATS Score
            </button>
          )}
        </motion.div>
      ) : (
        <ATSResult result={atsResult} onReset={handleReset} />
      )}
    </div>
  )
}

function ATSResult({ result, onReset }) {
  const { score, missingKeywords, formattingIssues, suggestions, strengths, scoreBreakdown } = result

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Score Header */}
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ATSCircle score={score} size={150} />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
              Score Breakdown
            </h2>
            {scoreBreakdown && Object.entries(scoreBreakdown).map(([key, val]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize font-medium" style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{val}/25</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 25) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Strengths */}
        {strengths?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} style={{ color: '#10b981' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Strengths</h3>
            </div>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#10b981' }} /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Keywords */}
        {missingKeywords?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Missing Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((k) => (
                <span key={k} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formatting Issues */}
        {formattingIssues?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} style={{ color: '#ef4444' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Formatting Issues</h3>
            </div>
            <ul className="space-y-2">
              {formattingIssues.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#ef4444' }} /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} style={{ color: '#8b5cf6' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Suggestions</h3>
            </div>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-purple-400 shrink-0 mt-0.5">→</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={onReset} className="btn-secondary w-full justify-center py-3 rounded-xl">
        <RefreshCw size={15} /> Check Another Resume
      </button>
    </motion.div>
  )
}
