import { useEffect, useMemo, useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { responseMessage } from '../lib/api'
import { hasResumeContent, newResumeEntry, resumeDraftPayload, validProjectUrl } from '../lib/resumeDraft'
import { sectionLabels } from '../data/resumeGuide'
import { previewResume } from '../store/resumeStore'

const contacts = [
  ['name', 'Full name', 'name'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'],
  ['location', 'City and region', 'address-level2'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub profile URL'], ['portfolio', 'Portfolio URL'],
]
const entryFields = {
  education: [
    ['institution', 'Institution'], ['degree', 'Degree or qualification'], ['location', 'Location'], ['dates', 'Dates or expected completion'],
  ],
  experience: [['title', 'Job title'], ['company', 'Employer or organization'], ['location', 'Location'], ['dates', 'Dates']],
  projects: [['name', 'Project name'], ['tech', 'Technology or methods'], ['date', 'Dates']],
  certifications: [['name', 'Credential'], ['issuer', 'Issuer'], ['dates', 'Date issued'], ['link', 'Credential URL', 600]],
  additional: [['title', 'Section heading', 80]],
}
const entryLabel = { education: 'education entry', experience: 'role', projects: 'project', certifications: 'certification', additional: 'section' }

export function DraftField({ label, value = '', onChange, autoComplete, type = 'text', maxLength = 240, inputMode, invalid }) {
  return <label className="block min-w-0">
    <span className="label">{label}</span>
    <input className="input" type={type} value={value} onChange={event => onChange(event.target.value)}
      autoComplete={autoComplete} maxLength={maxLength} inputMode={inputMode} aria-invalid={invalid || undefined} />
  </label>
}

function DraftArea({ label, value = '', onChange, rows, maxLength, placeholder }) {
  return <label className="block">
    <span className="label">{label}</span>
    <textarea className="input leading-5 sm:leading-relaxed" value={value} onChange={event => onChange(event.target.value)} rows={rows}
      maxLength={maxLength} placeholder={placeholder} />
  </label>
}

function ProjectLinks({ entry, update }) {
  const settings = [
    ['live', 'Live demo URL'],
    ['github', 'Repository URL'],
  ]
  return (
    <fieldset className="space-y-3 rounded-lg border px-3 pb-3" style={{ borderColor: 'var(--border)' }}>
      <legend className="px-2 text-sm font-semibold">Project links (optional)</legend>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add a demo or repository you want to share. Blank links are omitted.</p>
      {settings.map(([key, label]) => {
        const suggested = entry.linkSuggestions?.[key]
        const invalid = !validProjectUrl(entry[key])
        return <div key={key} className="space-y-1.5">
          <DraftField label={label} value={entry[key]} onChange={value => update({ [key]: value })}
            maxLength={600} inputMode="url" invalid={invalid} />
          {invalid && <p className="text-xs text-rose-500">Enter a valid web address.</p>}
          {suggested && suggested !== entry[key] && <button type="button" className="btn-ghost h-auto max-w-full justify-start px-0 text-left text-xs"
            aria-label={'Use link from resume for ' + label} onClick={() => update({ [key]: suggested })}>
            <Link2 size={14} className="shrink-0" aria-hidden="true" /> <span className="break-all">Use link from resume · {suggested}</span>
          </button>}
        </div>
      })}
    </fieldset>
  )
}

function EntryEditor({ kind, entries, onChange }) {
  const label = entryLabel[kind]
  const update = (id, properties) => onChange(entries.map(entry => entry.id === id ? { ...entry, ...properties } : entry))
  return (
    <div className="space-y-3 sm:space-y-4">
      {entries.map((entry, index) => {
        const edit = properties => update(entry.id, properties)
        const heading = entry.title || entry.institution || entry.degree || entry.name || ('New ' + label)
        return (
          <section key={entry.id} className="space-y-3 rounded-lg border p-2.5 sm:space-y-4 sm:rounded-xl sm:p-3.5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 break-words text-sm font-semibold">{heading}</h3>
              <button type="button" className="btn-ghost max-h-7 shrink-0 p-1.5 text-red-400" aria-label={'Remove ' + label + ' ' + (index + 1)}
                onClick={() => onChange(entries.filter(item => item.id !== entry.id))}><Trash2 size={14} /></button>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {entryFields[kind].map(([key, field, maxLength]) => <DraftField key={key} label={field} value={entry[key]}
                onChange={value => edit({ [key]: value })} maxLength={maxLength} />)}
            </div>
            {kind === 'education' && <DraftArea label="Relevant coursework or details" value={entry.details}
              onChange={details => edit({ details })} rows={2} maxLength={600} />}
            {kind === 'additional' && <DraftArea label="Section text" value={entry.lines}
              onChange={lines => edit({ lines })} rows={4} maxLength={16000} />}
            {entry.bullets && (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Describe what you did and give a result or scope you can verify.</p>
                {entry.bullets.map((bullet, bulletIndex) => <div key={bulletIndex} className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <DraftArea label={'Bullet ' + (bulletIndex + 1)} value={bullet} rows={2} maxLength={480} onChange={value => edit({
                      bullets: entry.bullets.map((item, i) => i === bulletIndex ? value : item),
                    })} />
                  </div>
                  <button type="button" className="btn-ghost shrink-0 p-2 text-red-400" aria-label={'Remove bullet ' + (bulletIndex + 1)}
                    onClick={() => edit({ bullets: entry.bullets.filter((_, i) => i !== bulletIndex) })}><Trash2 size={14} /></button>
                </div>)}
                <button type="button" className="btn-ghost text-xs" disabled={entry.bullets.length >= 10}
                  onClick={() => edit({ bullets: [...entry.bullets, ''] })}><Plus size={14} /> Add bullet</button>
              </div>
            )}
            {kind === 'projects' && <ProjectLinks entry={entry} update={edit} />}
          </section>
        )
      })}
      <button type="button" className="btn-secondary text-sm" disabled={entries.length >= 25}
        onClick={() => onChange([...entries, newResumeEntry(kind)])}><Plus size={15} /> Add {label}</button>
    </div>
  )
}

export function LiveResumePreview({ form, settings, onEdit }) {
  const [mode, setMode] = useState('page')
  const [preview, setPreview] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const hasDetails = !!form.name.trim() || hasResumeContent(form)
  const payload = useMemo(() => ({ formData: resumeDraftPayload(form), ...settings }), [form, settings])

  useEffect(() => {
    if (!hasDetails) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      previewResume(payload, controller.signal).then(data => {
        if (!controller.signal.aborted) setPreview({ payload, data })
      }).catch(error => {
        if (!controller.signal.aborted) setPreview({ payload, error: responseMessage(error, 'Could not update the preview.') })
      })
    }, 450)
    return () => { clearTimeout(timer); controller.abort() }
  }, [payload, attempt, hasDetails])

  const stale = hasDetails && preview?.payload !== payload
  return (
    <section className="card min-w-0 overflow-hidden" aria-label="Resume draft preview">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2.5 sm:px-4 sm:py-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-sm font-semibold">Resume preview</h2>
          <p role="status" className="mt-0.5 min-h-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {stale ? 'Updating preview…' : settings.paperSize === 'A4' ? 'A4' : 'US Letter'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="resume-choice px-2 py-1 text-xs" aria-pressed={mode === 'page'} onClick={() => setMode('page')}>Page</button>
          <button type="button" className="resume-choice px-2 py-1 text-xs" aria-pressed={mode === 'text'} onClick={() => setMode('text')}>Text</button>
          {onEdit && <button type="button" className="btn-ghost px-2 text-xs" onClick={onEdit}>Edit details</button>}
        </div>
      </div>
      {!hasDetails ? <p className="p-3.5 text-sm sm:p-6" style={{ color: 'var(--text-secondary)' }}>Add your details to see the resume here.</p>
        : !stale && preview?.error ? <div className="space-y-3 p-4">
          <p className="resume-error" role="alert">{preview.error}</p>
          <button type="button" className="btn-secondary text-sm" onClick={() => { setPreview(null); setAttempt(value => value + 1) }}>Retry preview</button>
        </div>
          : preview?.data && (mode === 'page'
            ? <iframe sandbox="" srcDoc={preview.data.optimizedHtml} className="h-[55dvh] min-h-64 w-full border-0 bg-white sm:h-[68vh] sm:min-h-[470px]" title="Resume draft page" />
            : <pre className="h-[55dvh] min-h-64 overflow-auto whitespace-pre-wrap break-words p-3 text-xs leading-5 sm:h-[68vh] sm:min-h-[470px] sm:p-4 sm:leading-6">{preview.data.documentText}</pre>)}
    </section>
  )
}

export default function ResumeDraftReview({ form, onChange, settings, warnings = [] }) {
  const [active, setActive] = useState('identity')
  const update = (key, value) => onChange(previous => ({ ...previous, [key]: value }))
  const sections = ['identity', ...settings.sectionOrder.filter(key => key !== 'summary'), 'additional']
  const labels = { ...sectionLabels, identity: 'Contact and summary', additional: 'Additional sections' }
  return (
    <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="card min-w-0 space-y-3 p-3.5 sm:space-y-4 sm:p-5">
        <nav aria-label="Edit resume sections" className="flex flex-wrap gap-1.5">
          {sections.map(key => <button key={key} type="button" className="resume-choice px-2.5 py-1.5 text-xs"
            aria-pressed={active === key} onClick={() => setActive(key)}>{labels[key]}</button>)}
        </nav>
        {!!warnings.length && <ul className="space-y-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{warnings.map(item => <li key={item}>{item}</li>)}</ul>}
        {form.projects.length > 0 && active === 'identity' && <button type="button" className="btn-ghost px-0 text-sm" onClick={() => setActive('projects')}>
          <Link2 size={15} aria-hidden="true" /> Review optional project links
        </button>}
        <h2 className="text-base font-semibold">{labels[active]}</h2>
        {active === 'identity' ? <>
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {contacts.map(([key, label, autoComplete]) => <DraftField key={key} label={label} value={form[key]} autoComplete={autoComplete}
              type={key === 'email' ? 'email' : 'text'} maxLength={['linkedin', 'github', 'portfolio'].includes(key) ? 600 : 240}
              onChange={value => update(key, value)} />)}
          </div>
          <DraftArea label="Professional summary (optional)" value={form.summary} onChange={value => update('summary', value)}
            rows={4} maxLength={1200} placeholder="Summarize your experience and the work you can demonstrate." />
        </> : active === 'skills'
          ? <DraftArea label="Skills by category" value={form.skills} onChange={value => update('skills', value)}
            rows={7} maxLength={12000} placeholder={'Languages: Python, SQL\nTools: Excel, Power BI'} />
          : <EntryEditor key={active} kind={active} entries={form[active]} onChange={value => update(active, value)} />}
      </div>
      <div className="min-w-0 lg:sticky lg:top-24"><LiveResumePreview form={form} settings={settings} /></div>
    </div>
  )
}
