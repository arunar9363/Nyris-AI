import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, BarChart3, FileText, Flame, ArrowRight, CheckCircle, Zap, Shield, Star } from 'lucide-react'
import logoIcon from '../assets/logos/logo-icon.png'

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

const features = [
  {
    icon: Sparkles, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
    title: 'JD → Resume Optimizer',
    desc: 'Paste any job description. Our AI rewrites your resume to match it perfectly with ATS-optimized keywords.',
    badge: 'Free', badgeColor: '#10b981', path: '/optimizer',
  },
  {
    icon: FileText, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',
    title: 'Resume Builder',
    desc: 'Build a stunning, ATS-ready resume from scratch with AI-powered suggestions across 3 domains.',
    badge: 'Pro', badgeColor: '#8b5cf6', path: '/builder',
  },
  {
    icon: BarChart3, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',
    title: 'ATS Score Checker',
    desc: 'Instantly score your resume. Get a breakdown of missing keywords, formatting issues, and fixes.',
    badge: 'Pro', badgeColor: '#8b5cf6', path: '/ats',
  },
  {
    icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
    title: 'Resume Roaster',
    desc: 'Get brutally honest (and funny) feedback on your resume. Because sometimes tough love helps.',
    badge: 'Pro', badgeColor: '#8b5cf6', path: '/roaster',
  },
]

const stats = [
  { value: '95%', label: 'Average ATS Score Increase' },
  { value: '10x', label: 'Faster Resume Tailoring' },
  { value: '3', label: 'Professional Templates' },
  { value: '100%', label: 'AI-Powered' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }} />
        {/* Animated orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(59,130,246,0.07)', top: '10%', left: '5%' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(139,92,246,0.07)', bottom: '10%', right: '5%' }}
          animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          {/* Logo mark */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <motion.div
              className=" h-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.1)', boxShadow: '0 8px 30px rgba(59,130,246,0.4)' }}
              
              transition={{ duration: 3, repeat: Infinity }}
            >
              <img src={logoIcon} alt="Nyris" className="w-12 h-12 object-contain" />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            <Zap size={12} /> AI-Powered · ATS-Optimized · Free to Start
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}
          >
            Land More Interviews<br />
            <span className="text-gradient">with AI-Optimized</span><br />
            Resumes
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Nyris AI tailors your resume to every job description in seconds.
            Higher ATS scores, better keyword matches, more callbacks.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/optimizer" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
              <Sparkles size={18} /> Optimize My Resume
            </Link>
            <Link to="/signup" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
              Create Free Account <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-10 text-sm"
            style={{ color: 'var(--text-muted)' }}>
            {['No credit card', 'Free optimizer', 'Instant PDF'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-400" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div className="text-4xl font-bold mb-1 text-gradient" style={{ fontFamily: 'DM Sans' }}>{value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--accent-blue)' }}>Everything You Need</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-4">
              One Platform. Four Superpowers.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              From optimization to roasting — Nyris covers every aspect of your resume journey.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map(({ icon: Icon, color, bg, title, desc, badge, badgeColor, path }) => (
              <motion.div key={title} variants={fadeUp}>
                <Link to={path} className="group block card p-6 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: 'var(--gradient-card)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: bg }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>{title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1 mt-1 shrink-0"
                      style={{ color: 'var(--accent-blue)' }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative text-center rounded-3xl p-12 overflow-hidden border"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.1))',
              borderColor: 'rgba(59,130,246,0.25)',
            }}
          >
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15), transparent 70%)',
            }} />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                style={{ background: '', }}>
                <Star size={35} color="#fff" />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                Start free with our JD Optimizer. No account needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/optimizer" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
                  <Sparkles size={17} /> Start Optimizing — Free
                </Link>
                <Link to="/about" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
