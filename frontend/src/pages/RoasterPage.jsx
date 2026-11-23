import { useState } from 'react'
import { Flame } from 'lucide-react'
import ReviewWizard from '../components/ReviewWizard'
import { ReportActions, ReportMetrics, ReportNavigation, ReportPanel } from '../components/ReportWorkspace'

const bulletStatus = { 'needs-work': 'Needs an edit', solid: 'Solid', strong: 'Strong evidence' }
const actionLabels = { specific: 'Specific action', vague: 'Vague opening', unclear: 'Action to clarify' }

export default function RoasterPage() {
  return <ReviewWizard tool="roaster" Result={RoastResult} />
}

function BulletReview({ bullets, summary }) {
  const [section, setSection] = useState('all')
  const [status, setStatus] = useState('all')
  const sections = [...new Set(bullets.map(bullet => bullet.section))]
  const visible = bullets.filter(bullet => (section === 'all' || bullet.section === section) && (status === 'all' || bullet.status === status))

  return (
    <ReportPanel title="Bullet-by-bullet review" description="Use the question beside each bullet to recover its missing detail. Fill any rewrite brackets with facts you can support.">
      <div className="mb-4 mt-4 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label>
          <span className="label">Resume section</span>
          <select className="input" value={section} onChange={event => setSection(event.target.value)}>
            <option value="all">All sections</option>
            {sections.map(name => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Writing quality</span>
          <select className="input" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="all">All bullets</option>
            {Object.entries(bulletStatus).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <p className="pb-2 text-xs" role="status" style={{ color: 'var(--text-secondary)' }}>
          {visible.length} of {bullets.length} available bullets{summary.bulletsAnalyzed > bullets.length ? ' · ' + summary.bulletsAnalyzed + ' analyzed' : ''}
        </p>
      </div>
      {visible.length ? <ol className="space-y-4">
        {visible.map(bullet => (
          <li key={bullet.index} className="space-y-3 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{bullet.section} · Bullet {bullet.index}</h3>
              <span className={'text-xs font-semibold ' + (bullet.status === 'needs-work' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>{bulletStatus[bullet.status] || bullet.status}</span>
            </div>
            <blockquote className="break-words border-l-2 border-brand/50 pl-3 text-sm leading-relaxed">{bullet.text}</blockquote>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                actionLabels[bullet.action],
                bullet.hasScope ? 'Scope shown' : 'Scope to clarify',
                bullet.hasOutcome ? 'Outcome shown' : 'Outcome to clarify',
                bullet.hasNumbers ? 'Number present' : null,
              ].filter(Boolean).map(label => <li key={label}>{label}</li>)}
            </ul>
            {!!bullet.matchedTerms?.length && <p className="break-words text-xs" style={{ color: 'var(--text-secondary)' }}>Job terms in this bullet <strong>{bullet.matchedTerms.join(', ')}</strong></p>}
            {!!bullet.issues?.length && (
              <ul className="space-y-2 border-t pt-3 text-sm" style={{ borderColor: 'var(--border)' }}>
                {bullet.issues.map((issue, index) => <li key={issue.id || index}>
                  <p className="font-medium">{issue.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{issue.detail}</p>
                </li>)}
              </ul>
            )}
            {bullet.coaching && (
              <div className="space-y-2 rounded-lg p-3 text-sm" style={{ background: 'var(--bg-primary)' }}>
                {bullet.coaching.question && <p>{bullet.coaching.question}</p>}
                {bullet.coaching.scaffold && <p className="break-words text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{bullet.coaching.scaffold}</p>}
              </div>
            )}
          </li>
        ))}
      </ol> : <p className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>No available bullets match these filters.</p>}
    </ReportPanel>
  )
}

function SectionReview({ sections }) {
  return (
    <ReportPanel title="Coverage by resume section" description="See where your existing bullets give the clearest picture of your work.">
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sections.map(section => (
          <div key={section.name} className="space-y-3 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold">{section.name}</h3>
            <ReportMetrics items={[
              { label: 'Bullets', value: section.bulletCount },
              { label: 'Need an edit', value: section.needsAttention },
              { label: 'Show scope', value: section.withScope },
              { label: 'Show an outcome', value: section.withOutcome },
            ]} />
          </div>
        ))}
      </div>
    </ReportPanel>
  )
}

export function RoastResult({ result, previous, onReset }) {
  const [active, setActive] = useState('plan')
  const detail = result.detailedReview
  const summary = detail?.summary
  const priorities = detail?.priorities?.length ? detail.priorities : (result.findings?.length ? result.findings : (result.mistakesBreakdown || []).map((title, index) => ({
    id: String(index), title, action: result.improvementTips?.[index],
  })))
  const sections = [['plan', 'Revision plan']]
  if (detail?.bullets?.length) sections.push(['bullets', 'Bullet review'])
  if (detail?.sections?.length) sections.push(['sections', 'Section coverage'])
  const baseline = previous?.detailedReview?.summary

  function exportLines() {
    return [
      'Nyris resume writing review',
      result.targetRole ? 'Target role — ' + result.targetRole : undefined,
      result.overallRating ? 'Writing grade — ' + result.overallRating : undefined,
      result.verdict,
      result.funnyRoast || result.seriousFeedback,
      '',
      'Writing breakdown',
      ...(result.rubric || []).map(row => row.label + ' — ' + row.score + '%. ' + row.summary),
      '',
      'Revision plan',
      ...priorities.map(item => item.title + ' — ' + (item.detail || item.action || 'Review this part of your resume.')),
      '',
      'Bullet review',
      ...(detail?.bullets || []).flatMap(bullet => [
        'Bullet ' + bullet.index + ' · ' + bullet.section + ' — ' + (bulletStatus[bullet.status] || bullet.status),
        bullet.text,
        ...(bullet.issues || []).map(issue => '  ' + issue.title + ' — ' + issue.detail),
        bullet.coaching?.question,
        bullet.coaching?.scaffold,
        '',
      ]),
      ...(detail?.sections?.length ? [
        'Section coverage',
        ...detail.sections.map(section => `${section.name} — ${section.bulletCount} bullets, ${section.needsAttention} needing an edit, ${section.withScope} with scope, ${section.withOutcome} with an outcome.`),
        '',
      ] : []),
      result.coachingNote ? 'AI coaching note — ' + result.coachingNote : undefined,
    ]
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <section className="card space-y-3 p-3.5 sm:space-y-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-base font-semibold sm:text-xl">{result.targetRole ? 'Writing review for ' + result.targetRole : 'Resume writing review'}</h2>
            {result.verdict && <p className="mt-2 font-medium">{result.verdict}</p>}
            {(result.funnyRoast || result.seriousFeedback) && (
              <p className="mt-2 flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {result.tone === 'playful' && <Flame size={16} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />}
                {result.funnyRoast || result.seriousFeedback}
              </p>
            )}
          </div>
          {result.overallRating && <div className="rounded-lg border px-2 py-1.5 text-center sm:px-4 sm:py-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Writing grade</p>
            <p className="text-xl font-bold sm:text-3xl" style={{ color: 'var(--accent-blue)' }}>{result.overallRating}</p>
          </div>}
        </div>
        {summary && <ReportMetrics items={[
          { label: 'Bullets analyzed', value: summary.bulletsAnalyzed },
          { label: 'Need an edit', value: summary.needsAttention, detail: baseline ? 'Previous run ' + baseline.needsAttention + ' of ' + baseline.bulletsAnalyzed : '' },
          { label: 'Scope shown', value: summary.withScope },
          { label: 'Outcome shown', value: summary.withOutcome },
          { label: 'Numbers present', value: summary.withNumbers },
        ]} />}
      </section>

      <ReportNavigation options={sections} active={active} onChange={setActive} />

      {active === 'plan' && <div className="space-y-4">
        <ReportPanel title="Edits to make next">
          {priorities.length ? <ol className="mt-4 space-y-3">{priorities.map((item, index) => (
            <li key={item.id || index} className="rounded-lg border p-2.5 sm:p-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium">{item.title}</h3>
                {item.priority && <span className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }}>
                  {item.priority}
                </span>}
              </div>
              {item.evidence && <blockquote className="mt-2 break-words border-l-2 border-brand/40 pl-3 text-sm">{item.evidence}</blockquote>}
              {(item.detail || item.action) && <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.detail || item.action}</p>}
            </li>
          ))}</ol> : <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Review dates, links, and outcomes before applying.</p>}
        </ReportPanel>
        {!!result.rubric?.length && (
          <ReportPanel title="Writing breakdown">
            <div className="mt-4"><ReportMetrics items={result.rubric.map(row => ({ label: row.label, value: row.score + '%', detail: row.summary }))} /></div>
          </ReportPanel>
        )}
        {result.evidenceHighlight?.text && <ReportPanel title="Evidence worth keeping">
          <blockquote className="mt-3 break-words border-l-2 border-emerald-500/50 pl-3 text-sm leading-relaxed">{result.evidenceHighlight.text}</blockquote>
        </ReportPanel>}
        {result.coachingNote && <ReportPanel title="AI coaching note" description={result.coachingNote} />}
        {result.coachingStatus === 'unavailable' && <p role="status" className="text-sm" style={{ color: 'var(--text-secondary)' }}>The writing review is ready. The optional AI note could not be added to this run.</p>}
      </div>}
      {active === 'bullets' && <BulletReview bullets={detail.bullets} summary={summary} />}
      {active === 'sections' && <SectionReview sections={detail.sections} />}
      <ReportActions onReset={onReset} resetLabel="Edit and review again" filename="Nyris-writing-review.txt" exportLines={exportLines} />
    </div>
  )
}
