import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WorkflowSteps({ steps, step, onStepChange, busy }) {
  return (
    <nav className="mb-3 sm:mb-5" aria-label="Workflow steps">
      <ol className="flex flex-wrap gap-1 sm:gap-2">
        {steps.map((label, index) => {
          const active = index === step
          const complete = index < step
          return (
            <li key={label}>
              <button type="button" className="resume-choice inline-flex min-h-8 min-w-8 items-center justify-center gap-1.5 text-xs sm:min-h-0 sm:min-w-0 sm:gap-2 sm:text-sm"
                aria-label={'Step ' + (index + 1) + '. ' + label}
                disabled={!complete || busy} aria-current={active ? 'step' : undefined} aria-pressed={active}
                style={{ opacity: active || complete ? 1 : .65 }} onClick={() => onStepChange(index)}>
                <span className="sm:hidden" aria-hidden="true">{index + 1}</span>
                <span className="hidden sm:inline" aria-hidden="true">{complete ? <Check size={14} /> : index + 1}</span>
                <span className={active ? undefined : 'hidden sm:inline'}>{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function WorkflowHeader({ title, description }) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:mb-6 sm:gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed sm:mt-2 sm:text-sm sm:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      <Link className="btn-secondary" to="/resume-library">Resume examples</Link>
    </header>
  )
}

export function WorkflowActions({ onBack, busy, label = 'Continue', busyLabel = 'Working…' }) {
  return (
    <div className="mt-4 flex flex-wrap justify-between gap-2 sm:mt-6 sm:gap-3">
      {onBack ? <button type="button" className="btn-secondary" disabled={busy} onClick={onBack}><ArrowLeft size={15} /> Back</button> : <span />}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? <><Loader2 size={16} className="animate-spin" /> {busyLabel}</> : <>{label} <ArrowRight size={15} /></>}
      </button>
    </div>
  )
}
