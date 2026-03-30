import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, TrendingUp, AlertCircle, CheckCircle,
  Code2, Linkedin, Github, Globe, Star, Send, MessageSquare,
  Bug, Lightbulb, Heart, User2, ThumbsUp
} from 'lucide-react'
import arunPhoto from '../assets/images/arun.jpg'
import api from '../lib/api'
import drxLogo from '../assets/logos/drxlogo.png';
import synidLogo from '../assets/logos/synidlogo.png';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

const stats = [
  { value: '73%', label: 'Resumes rejected by ATS', color: '#ef4444' },
  { value: '4h+', label: 'Avg time to tailor a resume', color: '#f59e0b' },
  { value: '250+', label: 'Applications per job opening', color: '#3b82f6' },
  { value: '6%', label: 'Average interview callback rate', color: '#8b5cf6' },
]

const solutions = [
  { icon: Sparkles, title: 'AI-Powered Optimization', desc: 'AI analyzes your resume against the JD and optimizes every bullet point, keyword, and section for maximum ATS compatibility.' },
  { icon: Target, title: 'Keyword Matching', desc: 'We identify missing keywords from the job description and intelligently integrate them into your resume without sounding robotic.' },
  { icon: TrendingUp, title: 'ATS Score Tracking', desc: 'Real-time ATS scoring shows you exactly how your resume performs and what to fix to push it above 85+.' },
  { icon: CheckCircle, title: 'Professional Templates', desc: 'ATS-optimized templates (Minimal, Modern, Creative) that render pixel-perfect PDFs via Puppeteer.' },
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
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.12)' }}>
          <MessageSquare size={18} style={{ color: 'var(--accent-blue)' }} />
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
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
            className="text-center py-10"
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
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    <div className="text-center py-10 card">
      <MessageSquare size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No feedback yet — be the first!</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <ThumbsUp size={16} style={{ color: 'var(--accent-blue)' }} />
        <h3 className="font-bold text-lg" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          Community Feedback
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)' }}>
          {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {feedbacks.map((fb, i) => {
          const meta = TYPE_META[fb.feedbackType] || TYPE_META.general
          return (
            <motion.div
              key={fb._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                    {(fb.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
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

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data } = await api.get('/feedback/public')
        setFeedbacks(data.data || [])
      } catch {
        setFeedbacks([])
      } finally {
        setFeedbackLoading(false)
      }
    }
    fetchFeedbacks()
  }, [])

  const handleNewFeedback = (fb) => {
    setFeedbacks((prev) => [fb, ...prev])
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.1), transparent)' }} />
        <motion.div initial="hidden" animate="show" variants={container} className="relative z-10 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            <Sparkles size={12} /> About Nyris AI
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl font-bold mb-6" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
            Built for Job Seekers.<br />
            <span className="text-gradient">Powered by AI.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Nyris is a AI platform that eliminates the frustration of resume tailoring.
            We built it because we've been there spending hours on a resume, only to hear nothing back. Resume optimization shouldn't be a black box or a guessing game. With Nyris, you get an ATS-optimized resume in minutes, so you can focus on preparing for interviews and landing your dream job.
          </motion.p>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#ef4444' }}>The Problem</p>
            </motion.div>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-4">The Resume Black Hole</motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-12 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Most job applications never reach a human reviewer. ATS software filters out resumes
              that don't match the exact keywords before a hiring manager ever sees them. Job seekers are left in the dark, spending hours tailoring resumes with no feedback on what works. The result? A frustrating, inefficient process where qualified candidates get rejected by an algorithm.
            </motion.p>
            <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(({ value, label, color }) => (
                <motion.div key={label} variants={fadeUp} className="card p-6 text-center">
                  <div className="text-4xl font-black mb-2" style={{ color, fontFamily: 'DM Sans' }}>{value}</div>
                  <div className="text-sm leading-snug" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-blue)' }}>
              Real Case Study
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-8">The 10-Hour Resume Week</motion.h2>
            <motion.div variants={fadeUp} className="card p-8">
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                A typical job seeker spends <strong style={{ color: 'var(--text-primary)' }}>1-2 hours per application</strong> manually tailoring their resume
                researching the company, identifying keywords, rewriting bullet points, and reformatting the document.
                Applying to 10 positions means an entire work week just on resume writing.
              </p>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                Despite this effort, most receive <strong style={{ color: '#ef4444' }}>ATS scores below 60</strong>  because they're guessing
                which keywords matter. The result? Their resume never reaches a human. With Nyris, that same job seeker can get an ATS-optimized resume in under 5 minutes, with a score above 85, and start getting interview calls instead of radio silence.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { before: '10+ hours', after: '~5 mins', label: 'Resume tailoring time' },
                  { before: 'ATS score: 45', after: 'ATS score: 88', label: 'Average ATS improvement' },
                  { before: '7% callbacks', after: '20% callbacks', label: 'Interview callback rate' },
                ].map(({ before, after, label }) => (
                  <div key={label} className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{label}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm line-through" style={{ color: '#ef4444' }}>{before}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                      <span className="text-sm font-bold" style={{ color: '#10b981' }}>{after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>
              Our Solution
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-12">How Nyris AI Solves This</motion.h2>
            <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
              {solutions.map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp} className="card p-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── USE CASE SECTION ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--accent-blue)' }}>Real Use Cases</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-4">
              Who Is Nyris Built For?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base mb-12 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Every feature in Nyris was designed around one type of person someone who knows they're capable,
              but keeps getting filtered out before a human even reads their resume.
            </motion.p>

            <motion.div variants={container} className="grid md:grid-cols-2 gap-5">

              {/* Use Case 1 */}
              <motion.div variants={fadeUp} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(59,130,246,0.1)' }}>🎓</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
                    The Final-Year Student
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  You have good projects, decent grades, and real skills but every time you apply,
                  you hear nothing. Your resume isn't bad. It's just not tailored. You paste the JD into
                  Nyris, upload your resume, and in under a minute you get an ATS-optimized version
                  with the exact keywords that recruiter is looking for. You stop guessing. You start getting calls.
                </p>
              </motion.div>

              {/* Use Case 2 */}
              <motion.div variants={fadeUp} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(139,92,246,0.1)' }}>💼</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
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
              <motion.div variants={fadeUp} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(16,185,129,0.1)' }}>⚡</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
                    The Mass Applicant
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  You're applying to 20–30 companies and manually tweaking your resume for each one is
                  eating hours of your day. With Nyris, you drop in the JD, upload once, and download
                  a tailored PDF in seconds. What used to take 2–3 hours per application now takes 2 minutes.
                  You apply more. You apply smarter. You land more interviews.
                </p>
              </motion.div>

              {/* Use Case 4 */}
              <motion.div variants={fadeUp} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(245,158,11,0.1)' }}>🔍</div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
                    The Self-Doubter
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  You've applied to roles you're genuinely qualified for and still heard nothing.
                  You start wondering is my resume even readable? Is it formatted right? Am I missing
                  something obvious? The ATS Checker gives you a real score, points out exactly what's
                  wrong, and tells you specifically what to fix. No more guessing. Just a clear answer.
                </p>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Lead Developer */}
      <section className="py-24 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3 text-center"
              style={{ color: 'var(--accent-blue)' }}>Meet the Developer</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-12 text-center">Lead Developer</motion.h2>

            <motion.div variants={fadeUp} className="card p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="shrink-0 flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-36 h-36 rounded-3xl overflow-hidden"
                     >
                      <img src={arunPhoto} alt="Arun Pratap Singh" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--accent-blue)' }}>
                      <Code2 size={14} color="#fff" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a href="https://www.linkedin.com/in/arun-pratap-singh-944491292" target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)' }}>
                      <Linkedin size={15} />
                    </a>
                    <a href="https://github.com/arunar9363" target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)' }}>
                      <Github size={15} />
                    </a>
                    <a href="https://arunps-portfolio.vercel.app/" target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <Globe size={15} />
                    </a>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
                      Arun Pratap Singh
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)' }}>
                      Lead Developer
                    </span>
                  </div>
                  <p className="text-sm mb-5 font-medium" style={{ color: 'var(--accent-blue)' }}>
                    Full Stack Developer · B.Tech Information Technology
                  </p>

                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                    I'm a final-year undergrad who builds and ships full-stack, AI-powered products independently
                    not as assignments, but as real platforms that real people use. I don't wait to learn things in class.
                    I pick a problem that bothers me, figure out the stack I need, and build until it's live.
                    Nyris came out of my own frustration I spent hours tailoring resumes and still got ignored.
                    So I built the tool I wished existed.
                  </p>

                  {/* Notable Projects */}
                  <div className="space-y-3 mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                      Other Things I've Built
                    </p>

                    {/* DoctorXCare */}
                    <a href="https://doctorxcare.in" target="_blank" rel="noreferrer"
                      className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', textDecoration: 'none', display: 'flex' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                        style={{ background: 'rgba(6,182,212,0.12)' }}><img src={drxLogo} alt="DoctorXCare" className="w-7 h-7 object-contain" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>DoctorXCare</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>Live</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          I built this because I kept seeing people panic over health symptoms at midnight with no one to ask.
                          DoctorXCare lets you describe what you're feeling and get instant, structured guidance on what might be wrong, how urgent it is, and what to do next. It's
                          not a generic Google result, but a proper AI-driven response. You can also upload
                          your lab reports and it breaks them down in plain language, tracks your health over time,
                          and helps you find the right doctor nearby when you actually need one.
                        </p>
                      </div>
                    </a>

                    {/* SYNID AI */}
                    <a href="https://synidai.onrender.com" target="_blank" rel="noreferrer"
                      className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', textDecoration: 'none', display: 'flex' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                        style={{ background: 'rgba(139,92,246,0.12)' }}><img src={synidLogo} alt="SYNID AI" className="w-7 h-7 object-contain" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>SYNID AI</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>Live</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          I was paying for AI tools I didn't fully control, so I built my own. SYNID AI is a
                          self-hosted chat assistant where your conversations stay in your own database,
                          you can switch between multiple AI models on the fly, set custom personalities,
                          and get responses that stream token by token in real time exactly like ChatGPT,
                          except it's mine and I know exactly where the data goes.
                    
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
      <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-3 text-center"
              style={{ color: 'var(--accent-blue)' }}>Community</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading text-4xl mb-3 text-center">
              Your Feedback Matters
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-center mb-12" style={{ color: 'var(--text-secondary)' }}>
              Share a suggestion, report a bug, or just say hi we read every message.
            </motion.p>

            {/* Form */}
            <motion.div variants={fadeUp} className="mb-12">
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
              ) : (
                <PublicFeedbackList feedbacks={feedbacks} />
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}