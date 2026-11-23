import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Linkedin, Globe, Heart, Mail } from 'lucide-react'
import useUIStore from '../../store/uiStore'
import logoDark from '../../assets/logos/logo-dark.png'
import logoLight from '../../assets/logos/logo-light.png'
import logoIcon from '../../assets/logos/logo-icon.png'

const footerLinks = {
  Services: [
    { label: 'JD → Optimizer', path: '/optimizer', free: true },
    { label: 'Resume Builder', path: '/builder' },
    { label: 'Resume Examples', path: '/resume-library', free: true },
    { label: 'ATS Checker', path: '/ats' },
    { label: 'Resume Roaster', path: '/roaster' },
  ],
  Platform: [
    { label: 'About Nyris', path: '/about' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Resumes', path: '/history' },
    { label: 'Get Started', path: '/signup' },
  ],
}

const socials = [
  { icon: Linkedin, href: 'https://www.linkedin.com/in/arun-pratap-singh-944491292', label: 'LinkedIn' },
  { icon: Globe, href: 'https://arunps-portfolio.vercel.app/', label: 'Portfolio' },
  { icon: Mail, href: 'mailto:arunstp45@gmail.com', label: 'Email' },
]

export default function Footer() {
  const { theme } = useUIStore()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t mt-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-6 md:grid-cols-4 md:gap-10">

          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="mb-2 inline-block sm:mb-4">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Nyris"
                className="h-6 w-auto sm:h-9"
              />
            </Link>
            <p className="mb-3 max-w-xs text-[13px] leading-relaxed sm:mb-6 sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Nyris is an AI-powered resume platform that helps job seekers land more interviews
              through intelligent optimization, ATS scoring, and professional templates.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2 sm:gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  whileHover={{ y: -2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-200 sm:rounded-xl"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(var(--accent-blue-rgb) / .4)'
                    e.currentTarget.style.color = 'var(--accent-blue)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-widest sm:mb-4 sm:text-xs"
                style={{ color: 'var(--text-muted)' }}>
                {category}
              </h4>
              <ul className="space-y-0.5 sm:space-y-3">
                {links.map(({ label, path, free }) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className="inline-flex min-h-7 items-center gap-1.5 text-[13px] transition-colors duration-200 hover:underline sm:min-h-0 sm:text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      {label}
                      {free && (
                        <span className="hidden rounded px-1.5 py-0.5 text-[9px] font-bold uppercase sm:inline"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                          Free
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 px-3 py-2.5 sm:flex-row sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="" className="h-4 w-4 object-contain opacity-70 sm:h-5 sm:w-5" />
            <span className="text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
              © {year} Nyris AI. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
            Made with <Heart size={11} className="text-red-400 fill-red-400" /> by{' '}
            <a
              href="https://arunps-portfolio.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline transition-colors"
              style={{ color: 'var(--accent-blue)' }}
            >
              ARUN
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
