import { useState } from 'react'
import DocumentIntake, { ResumeTextEditor } from './DocumentIntake'
import { WorkflowActions, WorkflowHeader, WorkflowSteps } from './ResumeWorkflow'
import { reviewResume } from '../store/resumeStore'

const steps = ['Add resume', 'Check reading order', 'Set review focus']
const options = {
  ats: {
    title: 'ATS Checker',
    description: 'Audit the extracted resume, find evidence for job requirements, and prioritize your next edits.',
    action: 'Run ATS checks',
    progress: 'Checking sections, contact details, and job terms…',
  },
  roaster: {
    title: 'Resume Roaster',
    description: 'Review your bullets for clear actions, scope, outcomes, and relevance to the job.',
    action: 'Review resume',
    progress: 'Reviewing the resume and prioritizing edits…',
  },
}
const toneOptions = [
  ['direct', 'Direct', 'Clear feedback on what to change first.'],
  ['coach', 'Coaching', 'Encouraging guidance for the next draft.'],
  ['playful', 'Playful', 'A light roast with the same practical checklist.'],
]

export default function ReviewWizard({ tool, Result }) {
  const configuration = options[tool]
  const isRoaster = tool === 'roaster'
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState({ text: '' })
  const [targetRole, setTargetRole] = useState('')
  const [job, setJob] = useState({ text: '' })
  const [tone, setTone] = useState('direct')
  const [enhance, setEnhance] = useState(false)
  const [importing, setImporting] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [run, setRun] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const busy = importing || running

  function goTo(position) {
    setStep(position)
    setError('')
  }

  async function advance(event) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (!draft.text.trim()) return setError('Add readable resume text to continue.')
    if (step < steps.length - 1) return goTo(step + 1)
    setRunning(true)
    try {
      const jobDescription = job.text.trim()
      const response = await reviewResume(tool, { resumeText: draft.text, targetRole, jobDescription, tone, enhance })
      if (!response.success) return setError(response.message)
      const context = targetRole.trim().toLowerCase() + '\0' + jobDescription
      setRun(last => ({ context, result: response.data, previous: last?.context === context ? last.result : null }))
      setShowReport(true)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="page-spacing mx-auto max-w-6xl sm:px-6">
      <WorkflowHeader title={configuration.title} description={configuration.description} />
      {showReport ? <Result result={run.result} previous={run.previous} onReset={() => { setShowReport(false); goTo(1) }} /> : (
        <>
          <WorkflowSteps steps={steps} step={step} onStepChange={goTo} busy={busy} />
          <form className="card p-3.5 sm:p-7" onSubmit={advance}>
            <fieldset disabled={running} className="min-w-0 space-y-3 sm:space-y-5">
              <h2 className="text-lg font-semibold sm:text-xl" style={{ color: 'var(--text-primary)' }}>{steps[step]}</h2>
              {step === 0 && <DocumentIntake id="review-resume" value={draft} onChange={setDraft} onBusyChange={setImporting} rows={5} />}
              {step === 1 && (
                <>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Confirm that the contact details, dates, and bullets read in the right sequence. Edit the text if a heading or line break was missed.</p>
                  <ResumeTextEditor id="reading-order" label="Text used for the review" text={draft.text} onChange={text => setDraft({ ...draft, text })} rows={12} />
                </>
              )}
              {step === 2 && (
                <>
                  <label className="block">
                    <span className="label">Target role (optional)</span>
                    <input className="input" maxLength={100} value={targetRole} onChange={event => setTargetRole(event.target.value)} placeholder="For example, Backend Software Engineer" />
                  </label>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Job description (optional)</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Include the required and preferred qualifications from the posting to get the most specific comparison.</p>
                    <DocumentIntake id="review-job" kind="job" value={job} onChange={setJob} onBusyChange={setImporting} rows={5} />
                  </div>
                  {isRoaster && (
                    <>
                      <fieldset>
                        <legend className="label">Feedback tone</legend>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {toneOptions.map(([value, label, description]) => (
                            <button type="button" key={value} className="resume-choice" aria-pressed={tone === value} onClick={() => setTone(value)}>
                              <span className="block text-sm font-medium">{label}</span>
                              <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</span>
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <input className="mt-1" type="checkbox" checked={enhance} onChange={event => setEnhance(event.target.checked)} />
                        <span>Request an AI coaching note with Groq. The text review is available either way.</span>
                      </label>
                    </>
                  )}
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Your report will be saved in History.</p>
                </>
              )}
            </fieldset>
            {error && <p className="resume-error mt-4" role="alert">{error}</p>}
            <WorkflowActions onBack={step ? () => goTo(step - 1) : undefined} busy={busy}
              busyLabel={running ? configuration.progress : 'Reading document…'} label={step === steps.length - 1 ? configuration.action : 'Continue'} />
          </form>
        </>
      )}
    </div>
  )
}
