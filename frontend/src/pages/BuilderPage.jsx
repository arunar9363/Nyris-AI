import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilePlus2, Upload } from 'lucide-react'
import DocumentIntake, { ResumeTextEditor } from '../components/DocumentIntake'
import ResumeDraftReview, { DraftField, LiveResumePreview } from '../components/ResumeDraftReview'
import { LayoutSelect, ProfileSelect } from '../components/ResumeOptions'
import ResumeResult from '../components/ResumeResult'
import { WorkflowActions, WorkflowHeader, WorkflowSteps } from '../components/ResumeWorkflow'
import { getResumeProfile, resumeLayouts, resumeSettings } from '../data/resumeGuide'
import { draftProblem, makeResumeDraft, resumeDraftPayload } from '../lib/resumeDraft'
import { buildResume, importResumeDraft } from '../store/resumeStore'

const steps = ['Add resume', 'Edit details', 'Layout and preview']

export default function BuilderPage() {
  const [params] = useSearchParams()
  const [profile, setProfile] = useState(getResumeProfile(params.get('profile')).id)
  const [layout, setLayout] = useState(resumeLayouts.find(item => item.id === params.get('layout'))?.id || 'minimal')
  const [paperSize, setPaperSize] = useState('LETTER')
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [start, setStart] = useState('import')
  const [source, setSource] = useState({ text: '' })
  const [imported, setImported] = useState(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => makeResumeDraft())
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
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
    if (step === 0) {
      if (start === 'import' && !source.text.trim()) return setError('Upload your resume or paste its text to auto-fill the details.')
      if (start === 'import' && source.text !== imported?.input) {
        setWorking(true)
        try {
          const response = await importResumeDraft(source)
          if (!response.success) return setError(response.message)
          setForm(makeResumeDraft(response.data.draft))
          setImported({ input: source.text, warnings: response.data.warnings })
        } finally {
          setWorking(false)
        }
      }
      return goTo(1)
    }
    const problem = draftProblem(form)
    if (problem) return setError(problem)
    if (step === 1) return goTo(2)

    setWorking(true)
    try {
      const response = await buildResume(resumeDraftPayload(form), { ...settings, targetRole, jobDescription })
      if (response.success) setResult(response.data)
      else setError(response.message)
    } finally {
      setWorking(false)
    }
  }

  if (result) return <ResumeResult result={result} onBack={() => { setResult(null); goTo(1) }} />

  return (
    <div className="page-spacing mx-auto max-w-7xl sm:px-6">
      <WorkflowHeader title="Resume Builder" description="Auto-fill a draft from your resume or start with your own details. Edit each section beside the preview, then save the layout you want to send." />
      <WorkflowSteps steps={steps} step={step} onStepChange={goTo} busy={busy} />
      <form onSubmit={advance}>
        <fieldset disabled={working} className="min-w-0">
          {step === 0 && <section className="card mx-auto max-w-4xl space-y-3 p-3.5 sm:space-y-5 sm:p-7">
            <h2 className="text-lg font-semibold sm:text-xl">How do you want to start?</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" aria-pressed={start === 'import'} disabled={uploading} className="resume-choice" onClick={() => setStart('import')}>
                <span className="flex items-center gap-2 font-semibold"><Upload size={16} aria-hidden="true" /> Upload or paste a resume</span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Auto-fill contact details and resume sections.</span>
              </button>
              <button type="button" aria-pressed={start === 'manual'} disabled={uploading} className="resume-choice" onClick={() => setStart('manual')}>
                <span className="flex items-center gap-2 font-semibold"><FilePlus2 size={16} aria-hidden="true" /> Enter details manually</span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Add only the sections you need.</span>
              </button>
            </div>
            {start === 'import' && <DocumentIntake id="builder-source" value={source} onChange={setSource} onBusyChange={setUploading} withDraft rows={7} />}
          </section>}
          {step === 1 && <ResumeDraftReview form={form} onChange={setForm} settings={settings} warnings={imported?.warnings} />}
          {step === 2 && <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <section className="card min-w-0 space-y-3 p-3.5 sm:space-y-5 sm:p-5">
              <h2 className="text-base font-semibold sm:text-lg">Layout and role fit</h2>
              <ProfileSelect value={profile} onChange={setProfile} />
              <LayoutSelect layout={layout} onLayoutChange={setLayout} paperSize={paperSize} onPaperChange={setPaperSize} />
              <DraftField label="Target job title (optional)" value={targetRole} onChange={setTargetRole} maxLength={100} />
              <ResumeTextEditor id="builder-job-description" label="Job description for readiness checks (optional)" text={jobDescription}
                onChange={setJobDescription} placeholder="Paste the posting to check which job terms your resume covers." rows={4} />
            </section>
            <LiveResumePreview form={form} settings={settings} onEdit={() => goTo(1)} />
          </div>}
        </fieldset>
        {error && <p className="resume-error mt-4" role="alert">{error}</p>}
        <WorkflowActions onBack={step ? () => goTo(step - 1) : undefined} busy={busy}
          busyLabel={step === 2 ? 'Saving resume…' : 'Reading resume…'}
          label={step === 2 ? 'Save resume' : step === 0 && start === 'import' ? 'Auto-fill resume' : 'Continue'} />
      </form>
    </div>
  )
}
