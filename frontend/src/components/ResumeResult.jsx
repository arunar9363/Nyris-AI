import { useState } from 'react'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { downloadResume, responseMessage } from '../lib/api'
import { ATSCircle } from './ui'

const formats = [
  ['pdf', 'PDF'],
  ['docx', 'Word'],
  ['txt', 'Text'],
]

export default function ResumeResult({ result, onBack, backLabel = 'Edit resume details' }) {
  const [view, setView] = useState('page')
  const [exporting, setExporting] = useState('')
  const [error, setError] = useState('')
  const report = result.report || {}
  const tailoring = result.tailoring?.mode ? result.tailoring : null
  const terms = report.termEvidence || []

  async function save(format) {
    setExporting(format)
    setError('')
    try { await downloadResume(result, format) }
    catch (problem) { setError(responseMessage(problem, 'The download could not be completed.')) }
    finally { setExporting('') }
  }

  return (
    <div className="page-spacing mx-auto max-w-6xl space-y-3 sm:space-y-4 sm:px-6 sm:py-9">
      <div className="flex flex-wrap items-end justify-between gap-2.5 sm:gap-4">
        <div>
          {onBack && <button type="button" onClick={onBack} className="btn-ghost mb-1 pl-0 sm:mb-3"><ArrowLeft size={15} /> {backLabel}</button>}
          <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>Your resume</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {tailoring?.mode === 'source' ? 'Your wording is preserved in the selected layout and section order.'
              : tailoring?.mode === 'ai' ? 'Review the suggested wording and verify each claim before exporting.'
              : 'Check your reviewed details and download the file type requested by the employer.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {formats.map(([format, label]) => (
            <button key={format} type="button" disabled={!!exporting}
              className={format === 'pdf' ? 'btn-primary' : 'btn-secondary'} onClick={() => save(format)}>
              {exporting === format ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="resume-error" role="alert">{error}</p>}

      <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="card min-w-0 overflow-hidden">
          <div className="flex flex-wrap gap-1.5 border-b p-2 sm:gap-2 sm:p-3" style={{ borderColor: 'var(--border)' }}>
            <button type="button" className="resume-choice px-2 py-1.5 text-xs sm:px-3 sm:text-sm" aria-pressed={view === 'page'} onClick={() => setView('page')}>Page preview</button>
            <button type="button" className="resume-choice px-2 py-1.5 text-xs sm:px-3 sm:text-sm" aria-pressed={view === 'text'} onClick={() => setView('text')}>Text preview</button>
            {!!report.documentChecks?.length && <button type="button" className="resume-choice px-2 py-1.5 text-xs sm:px-3 sm:text-sm"
              aria-pressed={view === 'checks'} onClick={() => setView('checks')}>Document checks</button>}
          </div>
          {view === 'page' && <iframe sandbox="" srcDoc={result.optimizedHtml} className="h-[62dvh] min-h-72 w-full border-0 bg-white sm:h-[74vh] sm:min-h-[520px]" title="Resume page preview" />}
          {view === 'text' && (
            <pre className="max-h-[62dvh] overflow-auto whitespace-pre-wrap break-words p-3 text-xs leading-5 sm:min-h-[440px] sm:max-h-none sm:p-5 sm:text-sm sm:leading-6" style={{ color: 'var(--text-primary)' }}>{result.documentText}</pre>
          )}
          {view === 'checks' && (
            <div className="space-y-4 p-3 sm:space-y-5 sm:p-5">
              <ul className="grid gap-3 sm:grid-cols-2">
                {report.documentChecks.map(check => <li key={check.label} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-medium">{check.label} <span className={check.passed ? 'text-emerald-500' : 'text-amber-500'}>{check.passed ? '✓' : '· Review'}</span></p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{check.detail}</p>
                </li>)}
              </ul>
              {!!terms.length && <section>
                <h2 className="font-medium">Evidence for job terms</h2>
                <ul className="mt-2 space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {terms.map(term => <li key={term.term}>
                    <strong>{term.term}</strong> · {term.status === 'in-context' ? 'In a contribution' : term.status === 'mentioned' ? 'Mentioned' : 'To review'}
                    {term.excerpt && <p className="mt-0.5 break-words pl-3 text-xs">{term.excerpt}</p>}
                  </li>)}
                </ul>
              </section>}
            </div>
          )}
        </div>
        <aside className="card p-3.5 sm:p-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Before applying</h2>
          {typeof result.atsScore === 'number' && (
            <div className="my-4 flex flex-col items-center gap-2">
              <ATSCircle score={result.atsScore} size={86} label="Readiness" />
              <p className="text-center text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Readiness is an estimate based on the resume text and any target job description.</p>
            </div>
          )}
          {tailoring && (
            <dl className="my-4 space-y-2 border-y py-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <div className="flex justify-between gap-2"><dt>Readiness</dt><dd className="font-medium">{tailoring.originalScore} → {result.atsScore}</dd></div>
              {report.evaluatedWithJobDescription && <div className="flex justify-between gap-2"><dt>Matched terms</dt>
                <dd className="font-medium">{tailoring.originalMatches} → {report.matchedKeywords?.length || 0}</dd></div>}
            </dl>
          )}
          <ul className="list-disc space-y-2 pl-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {[...(result.warnings || []), ...(report.suggestions || [])].slice(0, 5).map(item => <li key={item}>{item}</li>)}
            <li>Verify names, dates, achievements, and links against your records.</li>
          </ul>
          {result.report?.matchedKeywords?.length > 0 && (
            <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Matched job terms include {result.report.matchedKeywords.slice(0, 8).join(', ')}.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
