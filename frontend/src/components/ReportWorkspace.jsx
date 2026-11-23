import { ArrowLeft, Download } from 'lucide-react'
import { saveDownload } from '../lib/api'

export function ReportNavigation({ options, active, onChange }) {
  return (
    <nav aria-label="Report sections" className="flex flex-wrap gap-1.5 border-b pb-2 sm:gap-2 sm:pb-3" style={{ borderColor: 'var(--border)' }}>
      {options.map(([id, label]) => (
        <button key={id} type="button" className="resume-choice min-h-8 text-xs font-medium sm:min-h-0 sm:py-2 sm:text-sm" aria-pressed={active === id}
          onClick={() => onChange(id)}>{label}</button>
      ))}
    </nav>
  )
}

export function ReportPanel({ title, description, children }) {
  return (
    <section className="card min-w-0 p-3.5 sm:p-6">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {children}
    </section>
  )
}

export function ReportMetrics({ items }) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-1.5 sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] sm:gap-2">
      {items.map(({ label, value, detail }) => (
        <div key={label} className="min-w-0 rounded-lg border p-2 sm:p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <dt className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{label}</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums sm:mt-1 sm:text-xl">{value}</dd>
          {detail && <dd className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</dd>}
        </div>
      ))}
    </dl>
  )
}

export function ReportActions({ onReset, resetLabel, filename, exportLines }) {
  function download() {
    const content = exportLines().filter(line => line !== undefined).join('\n')
    saveDownload(new Blob([content + '\n'], { type: 'text/plain;charset=utf-8' }), filename)
  }

  return (
    <div className="flex flex-wrap justify-between gap-2">
      {onReset && <button className="btn-secondary" type="button" onClick={onReset}><ArrowLeft size={15} aria-hidden="true" /> {resetLabel}</button>}
      <button className="btn-secondary ml-auto" type="button" onClick={download}><Download size={15} aria-hidden="true" /> Download report</button>
    </div>
  )
}
