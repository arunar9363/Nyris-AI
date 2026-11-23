import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import ReviewWizard from '../components/ReviewWizard'
import { ATSCircle } from '../components/ui'
import { ReportActions, ReportMetrics, ReportNavigation, ReportPanel } from '../components/ReportWorkspace'

const priorityLabel = { required: 'Required', preferred: 'Preferred', mentioned: 'Other job terms' }
const statusLabel = { 'in-context': 'Evidence in a contribution', mentioned: 'Mentioned', missing: 'No matching text', alternative: 'Alternative qualification' }
const statusColor = { 'in-context': 'text-emerald-600 dark:text-emerald-400', mentioned: 'text-blue-600 dark:text-blue-400', missing: 'text-amber-700 dark:text-amber-400' }
const recommendationLabel = { high: 'Fix first', medium: 'Improve', low: 'Review' }

export default function ATSPage() {
  return <ReviewWizard tool="ats" Result={ATSResult} />
}

function legacyChecks(result) {
  return result.documentChecks?.length ? result.documentChecks : [
    ...(result.strengths || []).map(detail => ({ label: 'Passed check', passed: true, detail })),
    ...[...(result.formattingIssues || []), ...(result.suggestions || [])].map(detail => ({ label: 'Review', passed: false, detail })),
  ]
}

function legacyTerms(result) {
  return (result.termEvidence?.length ? result.termEvidence : [
    ...(result.matchedKeywords || []).map(term => ({ term, status: 'mentioned' })),
    ...(result.missingKeywords || []).map(term => ({ term, status: 'missing' })),
  ]).map(term => ({ ...term, priority: 'mentioned' }))
}

function evidenceStatus(item) {
  return item.alternative ? 'alternative' : item.status
}

function JobEvidence({ terms, manualChecks }) {
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const hasPriorities = terms.some(term => term.priority !== 'mentioned')
  const visible = terms.filter(term => (priority === 'all' || term.priority === priority) && (status === 'all' || evidenceStatus(term) === status))

  return (
    <ReportPanel title="Job requirements and evidence" description="Review where each job term appears. Confirm gaps against the posting and add only qualifications you can support.">
      {terms.length > 0 ? (
        <div className="mt-4">
          <div className="mb-3 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            {hasPriorities && <label><span className="label">Priority</span>
              <select className="input" value={priority} onChange={event => setPriority(event.target.value)}>
                <option value="all">All priorities</option>
                {Object.entries(priorityLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>}
            <label><span className="label">Evidence</span>
              <select className="input" value={status} onChange={event => setStatus(event.target.value)}>
                <option value="all">All evidence</option>
                {Object.entries(statusLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <p role="status" className="pb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{visible.length} of {terms.length} terms shown</p>
          </div>
          {visible.length ? <ul className="space-y-2">
            {visible.map(item => (
              <li key={item.term} className="rounded-lg border p-3 sm:p-4" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="break-words font-semibold">{item.term}</h3>
                  <p className={'text-xs font-semibold ' + (statusColor[evidenceStatus(item)] || '')}>
                    {statusLabel[evidenceStatus(item)] || item.status}
                  </p>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{priorityLabel[item.priority] || priorityLabel.mentioned}</p>
                {item.excerpt && <blockquote className="mt-3 break-words border-l-2 border-brand/40 pl-3 text-sm leading-relaxed">
                  {item.section && <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.section}</span>}
                  {item.excerpt}
                </blockquote>}
                {typeof item.source === 'string' && item.source && <details className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <summary className="cursor-pointer font-medium">Wording in the job description</summary>
                  <p className="mt-2 break-words leading-relaxed">{item.source}</p>
                </details>}
              </li>
            ))}
          </ul> : <p className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>No terms match these filters.</p>}
        </div>
      ) : !manualChecks.length && <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Add a job description with specific skills and qualifications to compare it with your resume.</p>}
      {!!manualChecks.length && <div className="mt-5">
        <h3 className="font-semibold">Qualifications to verify</h3>
        <ul className="mt-2 space-y-2">
          {manualChecks.map((check, index) => (
            <li key={check.source + index} className="rounded-lg border p-3 text-sm" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{priorityLabel[check.priority]}</p>
              <blockquote className="mt-1 break-words font-medium">{check.source}</blockquote>
              <p className="mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{check.detail}</p>
            </li>
          ))}
        </ul>
      </div>}
    </ReportPanel>
  )
}

function ParsingReport({ parsing, checks }) {
  const findings = [...checks, ...(parsing?.signals || []).filter(signal => !checks.some(check => check.label === signal.label))]
  return (
    <div className="space-y-4">
      {!!parsing?.sections?.length && <ReportPanel title="Detected resume sections">
        <div className="mt-4"><ReportMetrics items={[
          { label: 'Readable words', value: parsing.words },
          { label: 'Nonempty lines', value: parsing.lines },
          { label: 'Contributions detected', value: parsing.contributions },
          { label: 'Contributions with outcomes', value: parsing.withOutcome },
        ]} /></div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {parsing.sections.map(section => (
            <li key={section.name} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }}>
              <strong className="block font-medium">{section.name}</strong>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{section.present ? 'Detected · ' + section.items + ' text lines' : 'No heading detected'}</span>
            </li>
          ))}
        </ul>
      </ReportPanel>}
      <ReportPanel title="Parsing and document checks" description="These checks use the extracted text. Review reading order in the preview, especially with columns, tables, and text boxes.">
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {findings.map(({ label, passed, detail }) => (
            <li key={label + detail} className="flex gap-2 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              {passed ? <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" /> : <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />}
              <div>
                <p className="text-sm font-medium">{label} <span className="sr-only">{passed ? 'passed' : 'needs review'}</span></p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm"><a href="https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse" target="_blank" rel="noreferrer" className="underline underline-offset-2">Greenhouse resume parsing guidance</a></p>
      </ReportPanel>
    </div>
  )
}

export function ATSResult({ result, previous, onReset }) {
  const [active, setActive] = useState('overview')
  const checks = legacyChecks(result)
  const { job, parsing, scoring, recommendations } = result.advanced || {}
  const terms = job?.requirements || legacyTerms(result)
  const manualChecks = job?.manualChecks || []
  const priorities = recommendations || checks.filter(check => !check.passed).map(check => ({ title: check.label, detail: check.detail, priority: 'medium' }))
  const sections = [['overview', 'Overview'], ['job', 'Job requirements'], ['parsing', 'Parsing audit']]
  if (scoring?.dimensions?.length) sections.push(['scoring', 'Score details'])
  const metrics = [{ label: 'Document checks passed', value: checks.filter(check => check.passed).length + ' / ' + checks.length }]
  if (job?.totalRequired) {
    metrics.push({ label: 'Required terms matched', value: job.matchedRequired + ' / ' + job.totalRequired, detail: job.evidencedRequired + ' in a contribution' })
  }
  if (job?.totalPreferred) {
    metrics.push({ label: 'Preferred terms matched', value: job.matchedPreferred + ' / ' + job.totalPreferred, detail: job.evidencedPreferred + ' in a contribution' })
  }
  if (terms.length) metrics.push({ label: 'Terms without a match', value: terms.filter(term => !term.alternative && term.status === 'missing').length })
  if (manualChecks.length) metrics.push({ label: 'Qualifications to verify', value: manualChecks.length })

  function exportLines() {
    return [
      'Nyris ATS readiness report',
      result.targetRole ? 'Target role — ' + result.targetRole : undefined,
      'Readiness estimate — ' + (result.score ?? 0) + '/100',
      '',
      'Score details',
      ...(scoring?.dimensions || []).map(row => row.label + ' — ' + row.earned + '/' + row.possible + '. ' + row.description),
      '',
      'Next edits',
      ...priorities.map(item => (recommendationLabel[item.priority] || 'Review') + ' — ' + item.title + '. ' + item.detail),
      '',
      'Job requirements',
      ...terms.flatMap(item => [
        item.term + ' — ' + (priorityLabel[item.priority] || 'Other job terms') + ' — ' + (statusLabel[evidenceStatus(item)] || item.status),
        item.source ? '  Job posting — ' + item.source : undefined,
        item.excerpt ? '  Resume evidence — ' + item.excerpt : undefined,
      ]),
      ...(manualChecks.length ? ['', 'Qualifications to verify', ...manualChecks.map(check => check.source + ' — ' + check.detail)] : []),
      '',
      'Parsing and document checks',
      ...[...checks, ...(parsing?.signals || [])].map(check => (check.passed ? 'Passed' : 'Review') + ' — ' + check.label + '. ' + check.detail),
    ]
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <section className="card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-3.5 sm:grid-cols-[125px_minmax(0,1fr)] sm:gap-4 sm:p-6">
        <ATSCircle score={result.score ?? 0} size={110} />
        <div className="contents sm:block sm:space-y-3">
          <div>
            <h2 className="break-words text-base font-semibold sm:text-xl">{result.targetRole ? 'Readiness for ' + result.targetRole : 'Resume readiness report'}</h2>
            <p className="mt-1 text-[13px] leading-relaxed sm:text-sm sm:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A Nyris estimate based on document checks{result.evaluatedWithJobDescription ? ' and evidence for terms in the job description' : ''}.
              {previous && typeof previous.score === 'number' && <> Previous run for this job <strong>{previous.score}/100</strong>.</>}
            </p>
          </div>
          <div className="col-span-2"><ReportMetrics items={metrics} /></div>
        </div>
      </section>
      <ReportNavigation options={sections} active={active} onChange={setActive} />
      {active === 'overview' && (
        <ReportPanel title="What to edit first" description="Start with missing evidence and parsing gaps that could obscure relevant experience.">
          {priorities.length ? <ol className="mt-4 space-y-3">{priorities.map((item, index) => (
            <li key={item.title + index} className="rounded-lg border p-2.5 sm:p-4" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }}>{recommendationLabel[item.priority] || 'Review'}</p>
              <h3 className="mt-1 font-medium">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.detail}</p>
            </li>
          ))}</ol> : <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>The current checks found no priority edits. Review the original document before submitting.</p>}
        </ReportPanel>
      )}
      {active === 'job' && <JobEvidence terms={terms} manualChecks={manualChecks} />}
      {active === 'parsing' && <ParsingReport parsing={parsing} checks={checks} />}
      {active === 'scoring' && scoring?.dimensions && <ReportPanel title={scoring.label} description="Each dimension shows the points earned and the possible points for this report.">
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {scoring.dimensions.map(row => <div key={row.label} className="rounded-lg border p-2.5 sm:p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap justify-between gap-2"><h3 className="font-medium">{row.label}</h3><span className="text-sm tabular-nums">{row.earned} / {row.possible}</span></div>
            <meter className="my-2 w-full" min={0} max={row.possible || 1} value={row.earned} aria-label={row.label} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{row.description}</p>
          </div>)}
        </div>
      </ReportPanel>}
      <ReportActions onReset={onReset} resetLabel="Edit and check again" filename="Nyris-ATS-report.txt" exportLines={exportLines} />
    </div>
  )
}
