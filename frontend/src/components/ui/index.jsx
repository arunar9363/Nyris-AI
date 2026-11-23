import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, Circle } from 'lucide-react'

/* ─── ATS Animated Circle ─── */
export function ATSCircle({ score = 0, size = 140, label = 'Readiness' }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div className="relative h-[var(--mobile-score-size)] w-[var(--mobile-score-size)] sm:h-[var(--score-size)] sm:w-[var(--score-size)]"
        style={{ '--score-size': size + 'px', '--mobile-score-size': Math.round(size * .72) + 'px' }}>
        <svg width={size} height={size} viewBox="0 0 120 120" className="ats-circle h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-xl font-bold sm:text-3xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-[11px] font-semibold sm:text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold sm:text-sm" style={{ color }}>{label}</span>
    </div>
  )
}

/* ─── Skeleton Card ─── */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <div className="shimmer h-4 w-2/3 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="shimmer h-3 rounded-lg" style={{ width: `${Math.random() * 40 + 50}%` }} />
      ))}
    </div>
  )
}

/* ─── Step Indicator ─── */
export function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const idx = i + 1
        const done = idx < currentStep
        const active = idx === currentStep
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                animate={{
                  borderColor: done ? '#10b981' : active ? '#3b82f6' : 'rgba(148,163,184,0.2)',
                  background: done ? '#10b981' : active ? 'rgba(59,130,246,0.2)' : 'transparent',
                  color: done ? '#fff' : active ? '#3b82f6' : 'rgba(148,163,184,0.5)',
                }}
              >
                {done ? <CheckCircle size={16} /> : idx}
              </motion.div>
              <span className="text-[10px] font-medium hidden sm:block whitespace-nowrap"
                style={{ color: active ? 'var(--accent-blue)' : done ? '#10b981' : 'var(--text-muted)' }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 sm:w-16 h-px mx-1 mb-4 transition-all duration-500"
                style={{ background: done ? '#10b981' : 'rgba(148,163,184,0.15)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── File Dropzone ─── */
export function FileDropzone({ onDrop, file, onRemove, name = 'resume', formats = 'PDF or TXT', accept = { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] } }) {
  const [rejection, setRejection] = useState('')
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: files => { setRejection(''); onDrop(files[0]) },
    onDropRejected: files => {
      setRejection(files[0]?.errors.some(error => error.code === 'file-too-large')
        ? 'Choose a file that is 5 MB or smaller.'
        : 'Choose one supported file. Accepted formats are ' + formats + '.')
    },
    accept,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  })

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3"
        style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.08)' }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8"
          style={{ background: 'rgba(16,185,129,0.2)' }}>
          <FileText size={16} style={{ color: '#10b981' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button type="button" aria-label={'Remove ' + name + ' file'} onClick={onRemove}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-500/20 sm:h-auto sm:w-auto sm:p-1">
          <X size={14} className="text-red-400" />
        </button>
      </motion.div>
    )
  }

  return (
    <div>
    <div
      {...getRootProps()}
      className={`relative flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-dashed px-3 py-3 transition-all duration-200 sm:flex-col sm:justify-center sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-10 ${isDragActive ? 'scale-[1.01]' : ''}`}
      style={{
        borderColor: isDragActive ? 'var(--accent-blue)' : 'var(--border)',
        background: isDragActive ? 'rgb(var(--accent-blue-rgb) / .06)' : 'var(--bg-secondary)',
      }}
    >
      <input {...getInputProps()} />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-2xl"
        style={{ background: 'rgb(var(--accent-blue-rgb) / .1)' }}>
        <Upload size={16} className="sm:h-[22px] sm:w-[22px]" style={{ color: 'var(--accent-blue)' }} />
      </div>
      <div className="min-w-0 sm:text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isDragActive ? 'Drop it here' : 'Choose or drop your ' + name}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {formats} · up to 5 MB
        </p>
      </div>
    </div>
    {rejection && <p className="resume-error mt-2" role="alert">{rejection}</p>}
    </div>
  )
}

/* ─── Progress Bar ─── */
export function ProgressBar({ value = 0, label = '', stage = '' }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stage}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--accent-blue)' }}>{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--brand-fill)' }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* ─── Badge ─── */
export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'rgba(59,130,246,0.15)',
    green: 'rgba(16,185,129,0.15)',
    orange: 'rgba(245,158,11,0.15)',
    red: 'rgba(239,68,68,0.15)',
    purple: 'rgba(139,92,246,0.15)',
  }
  const textColors = {
    blue: '#60a5fa', green: '#34d399', orange: '#fbbf24', red: '#f87171', purple: '#a78bfa',
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: colors[color], color: textColors[color] }}>
      {children}
    </span>
  )
}

/* ─── Tag ─── */
export function Tag({ children, added, removed, improved }) {
  const style = added
    ? { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)' }
    : removed
    ? { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' }
    : improved
    ? { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' }
    : { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border)' }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"
      style={{ background: style.bg, color: style.color, borderColor: style.border }}>
      {children}
    </span>
  )
}

/* ─── Divider ─── */
export function GradientDivider() {
  return <div className="h-px my-6" style={{ background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
}
