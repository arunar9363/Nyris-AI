import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ExternalLink, FileText } from 'lucide-react'
import SampleResume from '../components/SampleResume'
import { getResumeProfile, resumeLayouts, resumeProfiles, sectionLabels } from '../data/resumeGuide'

const sources = {
  greenhouse: 'https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse',
  berkeley: 'https://career.berkeley.edu/prepare-for-success/resumes/',
  harvard: 'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
  uk: 'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
  gap: 'https://nationalcareers.service.gov.uk/careers-advice/explain-gaps-in-work-history/',
  yale: 'https://ocs.yale.edu/resources/resume-to-cv-conversion/',
  federal: 'https://help.usajobs.gov/faq/application/documents/resume/what-to-include',
}

function Source({ href, children }) {
  return <a className="guide-source" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={12} aria-hidden="true" /></a>
}

export default function ResumeLibraryPage() {
  const [params, setParams] = useSearchParams()
  const profile = getResumeProfile(params.get('profile'))
  const layout = resumeLayouts.find(item => item.id === params.get('layout')) || resumeLayouts[0]
  const buildSearch = new URLSearchParams({ profile: profile.id, layout: layout.id }).toString()
  const chooseProfile = value => setParams({ profile: value, layout: layout.id }, { replace: true })
  const chooseLayout = value => setParams({ profile: profile.id, layout: value }, { replace: true })

  return (
    <div className="page-spacing mx-auto max-w-6xl sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium sm:mb-3 sm:gap-2 sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
          <FileText size={17} aria-hidden="true" /> Resume examples
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-5xl" style={{ color: 'var(--text-primary)' }}>Choose a resume structure</h1>
        <p className="mt-2 text-sm leading-relaxed sm:mt-4 sm:text-base sm:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          See what to put first for your situation, then use the same section order in the Builder or Optimizer.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-7 sm:gap-2" aria-label="Applicant profiles">
        {resumeProfiles.map(item => (
          <button key={item.id} type="button" className="resume-choice min-h-8 text-xs sm:min-h-0 sm:py-2 sm:text-sm" aria-pressed={item.id === profile.id}
            onClick={() => chooseProfile(item.id)}>{item.name}</button>
        ))}
      </div>

      <div className="mt-3.5 grid items-start gap-3 sm:mt-6 sm:gap-5 lg:grid-cols-[0.8fr_1.3fr]">
        <aside className="card space-y-3 p-3.5 sm:space-y-5 sm:p-6">
          <div>
            <h2 className="text-base font-semibold sm:text-xl" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.intro}</p>
          </div>
          <ul className="space-y-1.5 text-sm sm:space-y-3" style={{ color: 'var(--text-secondary)' }}>
            {profile.priorities.map(item => <li key={item} className="flex items-start gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />{item}</li>)}
          </ul>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Suggested order</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {profile.order.map(key => <li key={key}>{sectionLabels[key]}</li>)}
            </ol>
            <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>{profile.length}. Include the sections you can substantiate.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary" to={'/builder?' + buildSearch}>Use in Builder <ArrowRight size={15} aria-hidden="true" /></Link>
            <Link className="btn-secondary" to={'/optimizer?' + buildSearch}>Use in Optimizer</Link>
          </div>
        </aside>

        <div className="card min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2.5 sm:p-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile.exampleRole} example</p>
              <p className="mt-1 text-xs" aria-live="polite" style={{ color: 'var(--text-secondary)' }}>{layout.name} layout</p>
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label="Example layouts">
              {resumeLayouts.map(item => (
                <button key={item.id} type="button" className="resume-choice px-2.5 py-1.5 text-xs" aria-pressed={item.id === layout.id}
                  onClick={() => chooseLayout(item.id)}>{item.name}</button>
              ))}
            </div>
          </div>
          <div className="resume-paper-frame"><SampleResume profile={profile} layout={layout.id} /></div>
          <p className="px-3 py-2 text-xs sm:px-4 sm:py-3" style={{ color: 'var(--text-secondary)' }}>{layout.detail} Candidate details are fictional.</p>
        </div>
      </div>

      <section className="mt-5 sm:mt-10">
        <h2 className="text-lg font-semibold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>Before you submit</h2>
        <div className="mt-2.5 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          <div className="card p-3.5 sm:p-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Check the document text</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Keep a single column, contact information in the document body, and recognizable headings. Copy the PDF text to confirm the reading order.
            </p>
            <Source href={sources.greenhouse}>Greenhouse parsing guidance</Source>
            <Source href={sources.berkeley}>Berkeley formatting guidance</Source>
          </div>
          <div className="card p-3.5 sm:p-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Match your evidence to the role</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Use the posting’s language for skills and responsibilities you can demonstrate. List your most recent role first and quantify results when you have the figures.
            </p>
            <Source href={sources.harvard}>Harvard resume guide</Source>
            <Source href={sources.uk}>National Careers Service CV guide</Source>
          </div>
          <div className="card p-3.5 sm:p-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Follow the posting’s instructions</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Submit PDF or Word as requested. Academic CVs and federal applications can require different sections. Explain a career break briefly when it adds context.
            </p>
            <Source href={sources.yale}>Yale academic CV guidance</Source>
            <Source href={sources.federal}>USAJOBS application guidance</Source>
            <Source href={sources.gap}>Career break guidance</Source>
          </div>
        </div>
      </section>
    </div>
  )
}
