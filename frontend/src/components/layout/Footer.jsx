import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, FileText, BarChart3, Flame, Info, Github, Linkedin, Globe, Heart, Mail } from 'lucide-react'
import useUIStore from '../../store/uiStore'
import logoDark from '../../assets/logos/logo-dark.png'
import logoLight from '../../assets/logos/logo-light.png'
import logoIcon from '../../assets/logos/logo-icon.png'

const footerLinks = {
  Services: [
    { label: 'JD → Optimizer', path: '/optimizer', free: true },
    { label: 'Resume Builder', path: '/builder' },
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
  { icon: Github, href: 'https://github.com/arunar9363', label: 'GitHub' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Nyris"
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              Nyris is an AI-powered resume platform that helps job seekers land more interviews
              through intelligent optimization, ATS scoring, and professional templates.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  whileHover={{ y: -2 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'
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
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--text-muted)' }}>
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map(({ label, path, free }) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className="text-sm inline-flex items-center gap-1.5 transition-colors duration-200 hover:underline"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      {label}
                      {free && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="" className="w-5 h-5 object-contain opacity-70" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {year} Nyris AI. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            Made with <Heart size={11} className="text-red-400 fill-red-400" /> by{' '}
            <a
              href="https://arunps-portfolio.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline transition-colors"
              style={{ color: 'var(--accent-blue)' }}
            >
              A. P. S
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
