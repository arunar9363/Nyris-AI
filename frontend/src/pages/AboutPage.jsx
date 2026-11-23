import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, TrendingUp, AlertCircle, CheckCircle,
  Linkedin, Github, Globe, Star, Send, MessageSquare,
  Bug, Lightbulb, Heart, User2, ThumbsUp, AudioLines
} from 'lucide-react'
import arunPhoto from '../assets/images/arun.png'
import api, { responseMessage } from '../lib/api'
import drxLogo from '../assets/logos/drxlogo.png';
import synidLogo from '../assets/logos/synidlogo.png';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

const solutions = [
  { icon: Sparkles, title: 'Job Description Optimizer', desc: 'Tailor your resume wording to the job using your documented experience as the source.' },
  { icon: Target, title: 'Keyword Matching', desc: 'Compare the terms in the job description with the text in your resume.' },
  { icon: TrendingUp, title: 'ATS Checker', desc: 'Audit extracted resume text and compare evidence against required and preferred job qualifications.' },
  { icon: CheckCircle, title: 'Resume Layouts', desc: 'Choose a single-column layout and export a text-based PDF, Word document, or plain text.' },
]

const FEEDBACK_TYPES = [
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: '#f59e0b' },
  { value: 'bug_report', label: 'Bug Report', icon: Bug, color: '#ef4444' },
  { value: 'feature_request', label: 'Feature Request', icon: Sparkles, color: '#8b5cf6' },
  { value: 'appreciation', label: 'Appreciation', icon: Heart, color: '#ec4899' },
  { value: 'general', label: 'General', icon: MessageSquare, color: '#3b82f6' },
]

const TYPE_META = {
  suggestion: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  bug_report: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  feature_request: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  appreciation: { color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  general: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={26}
            style={{
              color: star <= (hovered || value) ? '#f59e0b' : 'var(--border)',
              fill: star <= (hovered || value) ? '#f59e0b' : 'none',
              transition: 'all 0.15s',
            }}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold" style={{ color: '#f59e0b' }}>
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

function FeedbackForm({ onNewFeedback }) {
  const [form, setForm] = useState({ name: '', email: '', feedbackType: 'general', message: '', rating: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.message.trim() || form.message.trim().length < 10)
      return setError('Please write at least 10 characters.')
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim() || 'User',
        email: form.email.trim(),
        feedbackType: form.feedbackType,
        message: form.message.trim(),
        rating: form.rating || null,
      }
      const { data } = await api.post('/feedback', payload)
      onNewFeedback(data.data)
      setSubmitted(true)
      setForm({ name: '', email: '', feedbackType: 'general', message: '', rating: 0 })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card p-4 sm:p-8">
      <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 sm:rounded-2xl"
          style={{ background: 'rgb(var(--accent-blue-rgb) / .12)' }}>
          <MessageSquare size={18} style={{ color: 'var(--accent-blue)' }} />
        </div>
        <div>
          <h3 className="text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
            Share Your Feedback
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Help us improve Nyris your feedback is published publicly
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center sm:py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <CheckCircle size={28} style={{ color: '#10b981' }} />
            </motion.div>
            <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Thank you! 🎉</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your feedback has been published below.
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="label flex items-center gap-1">
                  <User2 size={11} /> Name
                  <span className="text-[10px] normal-case font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input"
                  placeholder="Your name (or stay anonymous)"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  Email
                  <span className="text-[10px] normal-case font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Feedback Type */}
            <div>
              <label className="label">Feedback Type</label>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, feedbackType: value }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200"
                    style={{
                      borderColor: form.feedbackType === value ? color : 'var(--border)',
                      background: form.feedbackType === value ? `${color}15` : 'transparent',
                      color: form.feedbackType === value ? color : 'var(--text-muted)',
                    }}
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="label flex items-center gap-1">
                <Star size={11} /> Rating
                <span className="text-[10px] normal-case font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            </div>

            {/* Message */}
            <div>
              <label className="label">Your Feedback *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="input resize-none"
                rows={5}
                placeholder="Share your thoughts, ideas, or report a problem... (min 10 characters)"
              />
              <div className="flex items-center justify-between mt-1">
                {error ? (
                  <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
                ) : <span />}
                <p className="text-xs" style={{ color: form.message.length > 900 ? '#f87171' : 'var(--text-muted)' }}>
                  {form.message.length}/1000
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3 rounded-xl"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting...
                </span>
              ) : (
                <><Send size={15} /> Submit Feedback</>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function PublicFeedbackList({ feedbacks }) {
  if (!feedbacks || feedbacks.length === 0) return (
    <div className="card py-6 text-center sm:py-10">
      <MessageSquare size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No feedback yet — be the first!</p>
    </div>
  )

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-6">
        <ThumbsUp size={16} style={{ color: 'var(--accent-blue)' }} />
        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          Community Feedback
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgb(var(--accent-blue-rgb) / .12)', color: 'var(--accent-blue)' }}>
          {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>
      <div className="grid gap-2.5 sm:gap-4 md:grid-cols-2">
        {feedbacks.map((fb, i) => {
          const meta = TYPE_META[fb.feedbackType] || TYPE_META.general
          return (
            <motion.div
              key={fb._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card min-w-0 p-3 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'var(--brand-fill)' }}>
                    {(fb.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="break-words text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {fb.name || 'User'}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0"
                  style={{ background: meta.bg, color: meta.color }}>
                  {fb.feedbackType?.replace('_', ' ')}
                </span>
              </div>

              {fb.rating > 0 && (
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12}
                      style={{ color: s <= fb.rating ? '#f59e0b' : 'var(--border)', fill: s <= fb.rating ? '#f59e0b' : 'none' }} />
                  ))}
                </div>
              )}

              <p className="break-words text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                "{fb.message}"
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function AboutPage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [feedbackError, setFeedbackError] = useState('')

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data } = await api.get('/feedback/public')
        setFeedbacks(data.data || [])
      } catch (error) {
        setFeedbackError(responseMessage(error, 'Unable to load the public feedback.'))
      } finally {
        setFeedbackLoading(false)
      }
    }
    fetchFeedbacks()
  }, [])

  const handleNewFeedback = (fb) => {
    setFeedbackError('')
    setFeedbacks((prev) => [fb, ...prev])
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden px-3 py-8 text-center sm:px-4 sm:py-24">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgb(var(--accent-blue-rgb) / .06), transparent)' }} />
        <motion.div initial="hidden" animate="show" variants={container} className="relative z-10 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold sm:mb-6 sm:gap-2 sm:px-3 sm:py-1.5"
            style={{ background: 'rgb(var(--accent-blue-rgb) / .1)', borderColor: 'rgb(var(--accent-blue-rgb) / .25)', color: 'var(--accent-blue)' }}>
            <Sparkles size={12} /> About Nyris AI
          </motion.div>
          <motion.h1 variants={fadeUp} className="mb-3 text-[1.75rem] font-bold leading-tight sm:mb-6 sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
            Built for Job Seekers.<br />
            <span className="text-gradient">Powered by Groq AI.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm leading-relaxed sm:text-lg sm:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Nyris is a AI platform that eliminates the frustration of resume tailoring.
            We built it because we've been there spending hours on a resume, only to hear nothing back. Resume optimization shouldn't be a black box or a guessing game. With Nyris, you get an ATS-optimized resume in minutes, so you can focus on preparing for interviews and landing your dream job.
          </motion.p>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="px-3 py-6 sm:px-4 sm:py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.div variants={fadeUp} className="mb-2 flex items-center gap-2 sm:mb-4 sm:gap-3">
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#ef4444' }}>The Problem</p>
            </motion.div>
            <motion.h2 variants={fadeUp} className="section-heading mb-2 text-xl sm:mb-4 sm:text-4xl">Preparing a readable resume</motion.h2>
            <motion.p variants={fadeUp} className="max-w-2xl text-sm sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Recruiting systems extract information from resume files. Readable text, clear section headings, and a consistent timeline make it easier to see how your experience fits the role.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-3 py-6 sm:px-4 sm:py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>
              Our Solution
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading mb-3 text-xl sm:mb-12 sm:text-4xl">How Nyris AI Solves This</motion.h2>
            <motion.div variants={container} className="grid gap-2.5 sm:gap-6 md:grid-cols-2">
              {solutions.map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp} className="card p-3 sm:p-6">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg sm:mb-4 sm:h-10 sm:w-10 sm:rounded-2xl"
                    style={{ background: 'rgb(var(--accent-blue-rgb) / .1)' }}>
                    <Icon size={14} className="sm:h-[18px] sm:w-[18px]" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <h3 className="mb-1 text-sm font-bold sm:mb-2 sm:text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── USE CASE SECTION ── */}
      <section className="px-3 py-6 sm:px-4 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--accent-blue)' }}>Real Use Cases</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading mb-2 text-xl sm:mb-4 sm:text-4xl">
              Who Is Nyris Built For?
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-3 max-w-2xl text-sm sm:mb-12 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Students, career changers, and experienced candidates can choose the section order that makes their strongest evidence easy to find.
            </motion.p>

            <motion.div variants={container} className="grid gap-2.5 sm:gap-5 md:grid-cols-2">

              {/* Use Case 1 */}
              <motion.div variants={fadeUp} className="card p-3 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm sm:h-9 sm:w-9 sm:rounded-xl sm:text-lg"
                    style={{ background: 'rgb(var(--accent-blue-rgb) / .1)' }}>🎓</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Students and New Graduates
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Put your expected graduation date, relevant class projects, and internships near the top. Use bullets that describe what you contributed and what you learned or delivered.
                </p>
              </motion.div>

              {/* Use Case 2 */}
              <motion.div variants={fadeUp} className="card p-3 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm sm:h-9 sm:w-9 sm:rounded-xl sm:text-lg"
                    style={{ background: 'rgb(var(--accent-purple-rgb) / .1)' }}>💼</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    The Career Switcher
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  You're moving from one domain to another maybe from IT support to software development,
                  or from a non-tech role to a data role. Your experience is transferable but your resume
                  doesn't show it. Nyris reads the job description, understands what they want,
                  and rewrites your existing resume to highlight exactly the parts that matter for that role.
                </p>
              </motion.div>

              {/* Use Case 3 */}
              <motion.div variants={fadeUp} className="card p-3 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm sm:h-9 sm:w-9 sm:rounded-xl sm:text-lg"
                    style={{ background: 'rgba(16,185,129,0.1)' }}>⚡</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    The Mass Applicant
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Keep a complete record of your roles and achievements. Tailor each application by choosing the evidence that best supports the responsibilities in that posting.
                </p>
              </motion.div>

              {/* Use Case 4 */}
              <motion.div variants={fadeUp} className="card p-3 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm sm:h-9 sm:w-9 sm:rounded-xl sm:text-lg"
                    style={{ background: 'rgba(245,158,11,0.1)' }}>🔍</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    The Self-Doubter
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Use the ATS checker to confirm that key sections and contact details can be read from the document. Compare the extracted text with the target job description.
                </p>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Developer profile */}
      <section className="px-3 py-6 sm:px-4 sm:py-24" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.h2 variants={fadeUp} className="section-heading mb-3 text-center text-xl sm:mb-12 sm:text-4xl">Meet the Developer</motion.h2>

            <motion.div variants={fadeUp} className="card p-3.5 sm:p-8 md:p-10">
              <div className="flex flex-col items-start gap-3 sm:items-center sm:gap-8 md:flex-row md:items-start">
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-4">
                  <div className="h-[84px] w-[84px] overflow-hidden rounded-2xl sm:h-36 sm:w-36 sm:rounded-3xl">
                    <img src={arunPhoto} alt="Arun Pratap Singh" width={144} height={144} loading="lazy"
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-1.5 sm:gap-3">
                    <a href="https://www.linkedin.com/in/arun-pratap-singh-944491292" target="_blank" rel="noreferrer"
                      aria-label="Arun Pratap Singh on LinkedIn"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgb(var(--accent-blue-rgb) / .12)', color: 'var(--accent-blue)' }}>
                      <Linkedin size={15} />
                    </a>
                    <a href="https://github.com/arunar9363" target="_blank" rel="noreferrer"
                      aria-label="Arun Pratap Singh on GitHub"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)' }}>
                      <Github size={15} />
                    </a>
                    <a href="https://arunps-portfolio.vercel.app/" target="_blank" rel="noreferrer"
                      aria-label="Arun Pratap Singh’s portfolio"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <Globe size={15} />
                    </a>
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <h3 className="mb-1 text-lg font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                    Arun Pratap Singh
                  </h3>
                  <p className="mb-2 text-[13px] font-medium sm:mb-5 sm:text-sm" style={{ color: 'var(--accent-blue)' }}>
                    AI Developer &amp; Software Engineer
                  </p>

                  <p className="mb-3 text-sm leading-relaxed sm:mb-5" style={{ color: 'var(--text-secondary)' }}>
                    I build full-stack applications that put AI to work in everyday tasks. My work spans interface design,
                    backend APIs, and model integration. I created Nyris to help job seekers tailor resumes to specific roles
                    and review ATS readiness before applying.
                  </p>

                  {/* Notable Projects */}
                  <div className="mb-1 space-y-2 sm:mb-6 sm:space-y-3">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Selected Projects</h4>

                    {/* DoctorXCare */}
                    <a href="https://doctorcare-x.vercel.app/" target="_blank" rel="noreferrer"
                      className="flex items-start gap-2 rounded-lg border p-2.5 transition-all duration-200 hover:-translate-y-0.5 sm:gap-3 sm:rounded-xl sm:p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', textDecoration: 'none', display: 'flex' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                        style={{ background: 'rgba(6,182,212,0.12)' }}><img src={drxLogo} alt="DoctorXCare" className="h-5 w-5 object-contain sm:h-7 sm:w-7" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>DoctorXCare</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          An AI-powered health information platform for exploring symptoms, understanding lab reports in plain
                          language, tracking health information, and finding nearby doctors.
                        </p>
                      </div>
                    </a>

                    {/* SYNID AI */}
                    <a href="https://synidai.onrender.com" target="_blank" rel="noreferrer"
                      className="flex items-start gap-2 rounded-lg border p-2.5 transition-all duration-200 hover:-translate-y-0.5 sm:gap-3 sm:rounded-xl sm:p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', textDecoration: 'none', display: 'flex' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                        style={{ background: 'rgba(139,92,246,0.12)' }}><img src={synidLogo} alt="SYNID AI" className="h-5 w-5 object-contain sm:h-7 sm:w-7" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>SYNID AI</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          A self-hosted chat assistant with multiple AI models, customizable assistant behavior, and streaming
                          responses. Conversation history is stored in the operator's own database.
                        </p>
                      </div>
                    </a>

                    <a href="https://mac-jlzf.onrender.com/" target="_blank" rel="noreferrer"
                      className="flex items-start gap-2 rounded-lg border p-2.5 transition-all duration-200 hover:-translate-y-0.5 sm:gap-3 sm:rounded-xl sm:p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                        <AudioLines size={17} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>MAC - Your Wellbeing Check-ins</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          A Python pipeline that analyzes sentiment and emotion across text, audio, and video.
                          It coordinates modality-specific agents and summarizes their findings.
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEEDBACK SECTION ── */}
      <section className="px-3 py-6 sm:px-4 sm:py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3 text-center"
              style={{ color: 'var(--accent-blue)' }}>Community</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading mb-2 text-center text-xl sm:mb-3 sm:text-4xl">
              Your Feedback Matters
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-4 text-center text-sm sm:mb-12 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Share a suggestion, report a bug, or just say hi we read every message.
            </motion.p>

            {/* Form */}
            <motion.div variants={fadeUp} className="mb-5 sm:mb-12">
              <FeedbackForm onNewFeedback={handleNewFeedback} />
            </motion.div>

            {/* Public List */}
            <motion.div variants={fadeUp}>
              {feedbackLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="card p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full shimmer" />
                        <div className="space-y-1.5">
                          <div className="shimmer h-3 w-24 rounded" />
                          <div className="shimmer h-2.5 w-16 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="shimmer h-3 rounded w-full" />
                        <div className="shimmer h-3 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : feedbackError ? <p className="resume-error" role="alert">{feedbackError}</p> : (
                <PublicFeedbackList feedbacks={feedbacks} />
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
