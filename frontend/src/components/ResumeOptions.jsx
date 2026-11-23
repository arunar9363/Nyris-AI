import { getResumeProfile, resumeLayouts, resumeProfiles, sectionLabels } from '../data/resumeGuide'

export function ProfileSelect({ value, onChange }) {
  const profile = getResumeProfile(value)
  return (
    <div>
      <label className="label" htmlFor="resume-profile">Applicant profile</label>
      <select id="resume-profile" className="input" value={profile.id} onChange={event => onChange(event.target.value)}>
        {resumeProfiles.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.intro} {profile.length}.</p>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {profile.order.map(key => sectionLabels[key]).join(' → ')}
      </p>
    </div>
  )
}

export function LayoutSelect({ layout, onLayoutChange, paperSize, onPaperChange }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <fieldset>
        <legend className="label mb-2">Resume layout</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {resumeLayouts.map(item => (
            <button
              key={item.id}
              type="button"
              aria-pressed={layout === item.id}
              className="resume-choice"
              onClick={() => onLayoutChange(item.id)}
            >
              <span className="block text-sm font-semibold sm:text-base">{item.name}</span>
              <span className="mt-0.5 block text-xs leading-snug sm:mt-1 sm:leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="resume-paper-size">Paper size</label>
        <select id="resume-paper-size" className="input max-w-xs" value={paperSize} onChange={event => onPaperChange(event.target.value)}>
          <option value="LETTER">US Letter</option>
          <option value="A4">A4</option>
        </select>
      </div>
    </div>
  )
}
