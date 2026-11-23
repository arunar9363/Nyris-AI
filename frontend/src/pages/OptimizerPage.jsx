import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DocumentIntake from '../components/DocumentIntake'
import ResumeDraftReview, { DraftField, LiveResumePreview } from '../components/ResumeDraftReview'
import { LayoutSelect, ProfileSelect } from '../components/ResumeOptions'
import ResumeResult from '../components/ResumeResult'
import { WorkflowActions, WorkflowHeader, WorkflowSteps } from '../components/ResumeWorkflow'
import { getResumeProfile, resumeLayouts, resumeSettings } from '../data/resumeGuide'
import { applySuggestedWording, draftProblem, makeResumeDraft, resumeDraftPayload } from '../lib/resumeDraft'
import { importResumeDraft, optimizeResume } from '../store/resumeStore'

const steps = ['Job description', 'Add resume', 'Tailoring focus', 'Edit details', 'Layout and preview']

export default function OptimizerPage() {
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [job, setJob] = useState({ text: '' })
  const [source, setSource] = useState({ text: '' })
  const [imported, setImported] = useState(null)
  const [form, setForm] = useState(() => makeResumeDraft())
  const [targetRole, setTargetRole] = useState('')
  const [customSuggestions, setCustomSuggestions] = useState('')
  const [profile, setProfile] = useState(getResumeProfile(params.get('profile')).id)
  const [layout, setLayout] = useState(resumeLayouts.find(item => item.id === params.get('layout'))?.id || 'minimal')
  const [paperSize, setPaperSize] = useState('LETTER')
  const [useAi, setUseAi] = useState(false)
  const [suggested, setSuggested] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const settings = useMemo(() => resumeSettings(profile, layout, paperSize), [profile, layout, paperSize])
  const busy = uploading || working

  function goTo(position) {
    setStep(position)
    setError('')
  }

  async function advance(event) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (!job.text.trim()) return setError('Add readable job description text to continue.')
    if (step === 0) return goTo(1)
    if (!source.text.trim()) return setError('Add a resume to auto-fill the details.')

    if (step === 1) {
      if (source.text !== imported?.input) {
        setWorking(true)
        try {
          const response = await importResumeDraft(source)
          if (!response.success) return setError(response.message)
          const { text, draft, warnings } = response.data
          setForm(makeResumeDraft(draft))
          setImported({ input: source.text, text, warnings })
          setSuggested(null)
        } finally {
          setWorking(false)
        }
      }
      return goTo(2)
    }

    const input = { jobDescription: job.text, resumeText: imported.text, targetRole, settings }
    if (step === 2) {
      const context = JSON.stringify([job.text, targetRole, customSuggestions, profile])
      if (useAi && suggested?.context !== context) {
        setWorking(true)
        try {
          const response = await optimizeResume({ ...input, useAi: true, customSuggestions, draftOnly: true })
          if (response.success) {
            setForm(previous => applySuggestedWording(previous, response.data.suggestions))
            setSuggested({ context, warnings: response.data.warnings })
          } else {
            setSuggested({ context, warnings: ['AI wording suggestions could not be added. Your imported draft is ready to edit.'] })
          }
        } finally {
          setWorking(false)
        }
      }
      return goTo(3)
    }

    const problem = draftProblem(form)
    if (problem) return setError(problem)
    if (step === 3) return goTo(4)
    setWorking(true)
    try {
      const response = await optimizeResume({ ...input, formData: resumeDraftPayload(form) })
      if (response.success) setResult(response.data)
      else setError(response.message)
    } finally {
      setWorking(false)
    }
  }

  if (result) return <ResumeResult result={result} onBack={() => { setResult(null); goTo(3) }} />

  return (
    <div className="page-spacing mx-auto max-w-7xl sm:px-6">
      <WorkflowHeader title="Resume Optimizer" description="Add the job posting and your resume. Review the auto-filled details, tailor your evidence, and edit the draft before exporting." />
      <WorkflowSteps steps={steps} step={step} onStepChange={goTo} busy={busy} />
      <form onSubmit={advance}>
        <fieldset disabled={working} className="min-w-0">
          {step <= 2 && <section className="card mx-auto max-w-4xl space-y-3 p-3.5 sm:space-y-5 sm:p-7">
            <h2 className="text-lg font-semibold sm:text-xl">{steps[step]}</h2>
            {step === 0 && <DocumentIntake id="optimizer-job" kind="job" allowImages value={job} onChange={setJob} onBusyChange={setUploading} />}
            {step === 1 && <DocumentIntake id="optimizer-resume" value={source} onChange={setSource} onBusyChange={setUploading} withDraft />}
            {step === 2 && <>
              <ProfileSelect value={profile} onChange={setProfile} />
              <DraftField label="Target job title (optional)" value={targetRole} onChange={setTargetRole} maxLength={100} />
              <fieldset>
                <legend className="label">Tailoring method</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button type="button" className="resume-choice" aria-pressed={!useAi} onClick={() => setUseAi(false)}>
                    <span className="block font-medium">Keep current wording</span>
                    <span className="mt-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>Edit the imported sections yourself and see how they match the job.</span>
                  </button>
                  <button type="button" className="resume-choice" aria-pressed={useAi} onClick={() => setUseAi(true)}>
                    <span className="block font-medium">AI-assisted wording</span>
                    <span className="mt-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>Groq suggests wording for your summary and bullets. Review each change in the draft.</span>
                  </button>
                </div>
              </fieldset>
              {useAi && <label className="block">
                <span className="label">What should the editor emphasize? (optional)</span>
                <textarea className="input" rows={3} maxLength={1000} value={customSuggestions} onChange={event => setCustomSuggestions(event.target.value)}
                  placeholder="For example, prioritize my internships and API work." />
              </label>}
            </>}
          </section>}
          {step === 3 && <ResumeDraftReview form={form} onChange={setForm} settings={settings}
            warnings={[...new Set([...(imported.warnings || []), ...(useAi ? suggested?.warnings || [] : [])])]} />}
          {step === 4 && <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <section className="card min-w-0 space-y-3 p-3.5 sm:space-y-5 sm:p-5">
              <h2 className="text-base font-semibold sm:text-lg">Layout for this application</h2>
              <LayoutSelect layout={layout} onLayoutChange={setLayout} paperSize={paperSize} onPaperChange={setPaperSize} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Switch to Text preview to check the order a reader sees when copying your resume.</p>
            </section>
            <LiveResumePreview form={form} settings={settings} onEdit={() => goTo(3)} />
          </div>}
        </fieldset>
        {error && <p className="resume-error mt-4" role="alert">{error}</p>}
        <WorkflowActions onBack={step ? () => goTo(step - 1) : undefined} busy={busy}
          busyLabel={step === 4 ? 'Saving resume…' : step === 2 ? 'Preparing wording suggestions…' : 'Reading document…'}
          label={step === 4 ? 'Save resume' : step === 1 ? 'Auto-fill resume' : 'Continue'} />
      </form>
    </div>
  )
}
