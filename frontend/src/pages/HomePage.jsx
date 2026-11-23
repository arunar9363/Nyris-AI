import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, FileText, Flame, Sparkles } from 'lucide-react'
import SampleResume from '../components/SampleResume'
import { getResumeProfile, resumeProfiles } from '../data/resumeGuide'

const tools = [
  { name: 'Resume Builder', detail: 'Format the experience you enter in an order suited to your profile.', path: '/builder', icon: FileText },
  { name: 'Job Description Optimizer', detail: 'Tailor an existing resume to a job description using your documented experience.', path: '/optimizer', icon: Sparkles },
  { name: 'ATS Checker', detail: 'Audit resume parsing and see how your experience supports job requirements.', path: '/ats', icon: BarChart3 },
  { name: 'Resume Roaster', detail: 'Find weak bullets and learn how to show the scope and results of your work.', path: '/roaster', icon: Flame },
]

export default function HomePage() {
  const featured = getResumeProfile('graduate')
  return (
    <div>
      <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-5 px-3 py-6 sm:gap-8 sm:px-6 sm:py-12 lg:grid-cols-[.95fr_1fr] lg:py-16">
          <div>
            <h1 className="text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:text-6xl sm:leading-[1.08]" style={{ color: 'var(--text-primary)' }}>
              Build a resume around your experience
            </h1>
            <p className="mt-2.5 max-w-lg text-sm leading-relaxed sm:mt-5 sm:text-lg sm:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Pick a structure that fits your career stage, tailor it to the job, and export a readable PDF or Word document.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <Link to="/resume-library" className="btn-primary">
                View resume examples <ArrowRight size={15} className="shrink-0 sm:h-[17px] sm:w-[17px]" aria-hidden="true" />
              </Link>
              <Link to="/builder" className="btn-secondary">Build my resume</Link>
            </div>
          </div>
          <div className="card min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b px-3 py-2 sm:flex-nowrap sm:p-4" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs font-medium sm:text-sm" style={{ color: 'var(--text-primary)' }}>Fresher · Classic layout</span>
              <Link to="/resume-library?profile=graduate" className="guide-source !mt-0 text-xs">Open full example <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>
            <div className="resume-paper-frame relative max-h-[250px] overflow-hidden after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-5 after:bg-gradient-to-t after:from-white after:to-transparent sm:max-h-[470px] sm:after:hidden">
              <SampleResume profile={featured} layout="minimal" />
            </div>
          </div>
        </div>
      </section>

      <section className="page-spacing mx-auto max-w-6xl sm:px-6">
        <h2 className="text-lg font-semibold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>Examples by situation</h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          {resumeProfiles.map(profile => <Link key={profile.id} className="resume-choice text-xs sm:text-sm" to={'/resume-library?profile=' + profile.id}>{profile.name}</Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 pb-7 sm:px-6 sm:pb-12">
        <h2 className="text-lg font-semibold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>Resume tools</h2>
        <div className="mt-2.5 grid gap-2 min-[360px]:grid-cols-2 sm:mt-4 sm:gap-3 lg:grid-cols-4">
          {tools.map(({ name, detail, path, icon: Icon }) => (
            <Link key={path} to={path} className="card block min-w-0 p-3 hover:border-brand/50 sm:p-5">
              <Icon size={16} className="mb-2 text-brand sm:mb-3 sm:h-[21px] sm:w-[21px]" aria-hidden="true" />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed sm:mt-2 sm:text-sm sm:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
