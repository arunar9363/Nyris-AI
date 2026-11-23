import { sectionLabels } from '../data/resumeGuide'

const labelsFor = profile => ({
  ...sectionLabels,
  skills: ['experienced', 'switch', 'return', 'leadership'].includes(profile) ? 'Skills' : 'Technical Skills',
})

function ResumeRow({ title, meta, stack, italic = false }) {
  if (!title && !meta) return null
  return <p className="paper-row">
    <span className="paper-row-main">
      {italic ? <em>{title}</em> : <strong>{title}</strong>}
      {stack && <> | <em>{stack}</em></>}
    </span>
    {meta && <span className="paper-row-meta">{meta}</span>}
  </p>
}

export default function SampleResume({ profile, layout, label = profile.name + ' resume example' }) {
  const { sample: data, order } = profile
  const labels = labelsFor(profile.id)
  const contacts = [
    { label: data.phone }, { label: data.email, accent: true },
    { label: data.linkedin && 'LinkedIn', accent: true }, { label: data.github && 'GitHub', accent: true },
    { label: data.portfolio && 'Portfolio', accent: true }, { label: data.location },
  ].filter(item => item.label)
  const sections = {
    summary: data.summary && <p>{data.summary}</p>,
    education: data.education?.map(entry => <div className="paper-entry" key={entry.id || entry.institution}>
      <ResumeRow title={entry.institution} meta={entry.location} />
      <ResumeRow title={entry.degree} meta={entry.dates} italic />
      {entry.details && <p>{entry.details}</p>}
    </div>),
    experience: data.experience?.map(entry => <div className="paper-entry" key={entry.id || entry.title}>
      <ResumeRow title={entry.title} meta={entry.dates} />
      <ResumeRow title={entry.company} meta={entry.location} italic />
      {entry.bullets.length > 0 && <ul>{entry.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}
    </div>),
    projects: data.projects?.map(entry => <div className="paper-entry" key={entry.id || entry.name}>
      <ResumeRow title={entry.name} meta={entry.date} stack={layout !== 'modern' ? entry.tech : undefined} />
      {layout === 'modern' && <ResumeRow title={entry.tech} italic />}
      {!!entry.bullets.length && <ul>{entry.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}
      {(entry.live || entry.github) && <p className="paper-contact">{[entry.live && 'Live demo', entry.github && 'Repository'].filter(Boolean).join(' | ')}</p>}
    </div>),
    skills: data.skills?.categories.map(entry => <p key={entry.label}><strong>{entry.label}{entry.label && ':'}</strong> {entry.items}</p>),
    certifications: data.certifications?.map(entry => <p key={entry.id || entry.name}><strong>{entry.name}</strong>{entry.issuer && ' | ' + entry.issuer}{entry.dates && ' | ' + entry.dates}</p>),
  }
  return (
    <article className="resume-paper" data-layout={layout} aria-label={label}>
      <div className="paper-identity">
        <h2 className="paper-name">{data.name}</h2>
        <address>{contacts.map(({ label, accent }, index) => <span key={label}>{index > 0 && ' | '}<span className={accent ? 'paper-contact' : undefined}>{label}</span></span>)}</address>
      </div>
      {order.filter(key => sections[key] && sections[key].length !== 0).map(key => (
        <section key={key}>
          <h3>{labels[key]}</h3>
          {sections[key]}
        </section>
      ))}
    </article>
  )
}
