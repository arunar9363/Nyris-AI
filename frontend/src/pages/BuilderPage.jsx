import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Code2, Brain, User2, Plus, Trash2, Download, RefreshCw, Wand2, CheckCircle } from 'lucide-react'
import useResumeStore from '../store/resumeStore'
import { ATSCircle, ProgressBar } from '../components/ui/index'

const DOMAINS = [
  { id: 'Full Stack', label: 'Full Stack Developer', icon: Code2, color: '#3b82f6' },
  { id: 'Data Science', label: 'Data Scientist / ML', icon: Brain, color: '#8b5cf6' },
  { id: 'General Software', label: 'General Software', icon: User2, color: '#06b6d4' },
]

const TEMPLATES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
]

const emptyExp = () => ({ title: '', company: '', location: '', dates: '', bullets: [''] })
const emptyProj = () => ({ name: '', tech: '', date: '', bullets: [''], live: '', github: '' })
const emptyEdu = () => ({ institution: '', degree: '', location: '', dates: '' })
const emptyCert = () => ({ name: '', issuer: '' })

export default function BuilderPage() {
  const { buildResume, builderResult, builderLoading } = useResumeStore()
  const [domain, setDomain] = useState('Full Stack')
  const [template, setTemplate] = useState('minimal')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', summary: '',
    education: [emptyEdu()],
    experience: [emptyExp()],
    projects: [emptyProj()],
    skills: '',
    certifications: [emptyCert()],
  })

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const updateArr = (field, idx, key, val) => {
    const arr = [...form[field]]
    arr[idx] = { ...arr[idx], [key]: val }
    setForm((f) => ({ ...f, [field]: arr }))
  }
  const updateArrBullet = (field, idx, bIdx, val) => {
    const arr = [...form[field]]
    const bullets = [...arr[idx].bullets]
    bullets[bIdx] = val
    arr[idx] = { ...arr[idx], bullets }
    setForm((f) => ({ ...f, [field]: arr }))
  }
  const addArrItem = (field, empty) => setForm((f) => ({ ...f, [field]: [...f[field], empty()] }))
  const removeArrItem = (field, idx) => setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))
  const addBullet = (field, idx) => updateArr(field, idx, 'bullets', [...form[field][idx].bullets, ''])
  const removeBullet = (field, idx, bIdx) => {
    const arr = [...form[field]]
    arr[idx] = { ...arr[idx], bullets: arr[idx].bullets.filter((_, i) => i !== bIdx) }
    setForm((f) => ({ ...f, [field]: arr }))
  }

  const handleBuild = async () => {
    if (!form.name) return setError('Please enter your name.')
    setError('')
    const result = await buildResume(form, domain, template)
    if (!result.success) setError(result.message)
  }

  const handleReset = () => useResumeStore.setState({ builderResult: null })

  if (builderResult) return <BuilderResult result={builderResult} onReset={handleReset} />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border"
          style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)', color: '#a78bfa' }}>
          <FileText size={12} /> Resume Builder
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          Build Your Resume from Scratch
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Fill in your details — our AI enhances everything to 90–100 ATS score
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Domain + Template */}
        <div className="card p-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Target Domain & Template</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {DOMAINS.map(({ id, label, icon: Icon, color }) => (
              <button key={id} onClick={() => setDomain(id)}
                className="p-3 rounded-xl border-2 text-left transition-all duration-200"
                style={{ borderColor: domain === id ? color : 'var(--border)', background: domain === id ? `${color}12` : 'transparent' }}>
                <Icon size={18} className="mb-2" style={{ color }} />
                <div className="text-xs font-semibold" style={{ color: domain === id ? color : 'var(--text-secondary)' }}>{label}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {TEMPLATES.map(({ id, label }) => (
              <button key={id} onClick={() => setTemplate(id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  borderColor: template === id ? 'var(--accent-blue)' : 'var(--border)',
                  background: template === id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  color: template === id ? 'var(--accent-blue)' : 'var(--text-muted)',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Info" icon={User2}>
          <div className="grid grid-cols-2 gap-4">
            {[['name','Full Name *'],['email','Email'],['phone','Phone'],['linkedin','LinkedIn'],['github','GitHub'],['portfolio','Portfolio']].map(([k, l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input value={form[k]} onChange={(e) => updateField(k, e.target.value)} className="input" placeholder={l} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="label">Professional Summary</label>
            <textarea value={form.summary} onChange={(e) => updateField('summary', e.target.value)}
              className="input resize-none" rows={3} placeholder="Brief professional summary (AI will enhance this)..." />
          </div>
        </Section>

        {/* Education */}
        <Section title="Education" icon={FileText} onAdd={() => addArrItem('education', emptyEdu)}>
          {form.education.map((edu, i) => (
            <div key={i} className="relative p-4 rounded-xl mb-3" style={{ background: 'var(--bg-secondary)' }}>
              {form.education.length > 1 && (
                <button onClick={() => removeArrItem('education', i)} className="absolute top-3 right-3 text-red-400 hover:bg-red-500/20 p-1 rounded">
                  <Trash2 size={13} />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[['institution','Institution'],['degree','Degree'],['location','Location'],['dates','Dates (e.g. 2022–2026)']].map(([k, l]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input value={edu[k]} onChange={(e) => updateArr('education', i, k, e.target.value)} className="input" placeholder={l} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* Experience */}
        <Section title="Experience" icon={FileText} onAdd={() => addArrItem('experience', emptyExp)}>
          {form.experience.map((exp, i) => (
            <div key={i} className="p-4 rounded-xl mb-3 relative" style={{ background: 'var(--bg-secondary)' }}>
              {form.experience.length > 1 && (
                <button onClick={() => removeArrItem('experience', i)} className="absolute top-3 right-3 text-red-400 hover:bg-red-500/20 p-1 rounded">
                  <Trash2 size={13} />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[['title','Job Title'],['company','Company'],['location','Location'],['dates','Dates']].map(([k, l]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input value={exp[k]} onChange={(e) => updateArr('experience', i, k, e.target.value)} className="input" placeholder={l} />
                  </div>
                ))}
              </div>
              <label className="label">Responsibilities / Bullets</label>
              {exp.bullets.map((b, bi) => (
                <div key={bi} className="flex gap-2 mb-2">
                  <input value={b} onChange={(e) => updateArrBullet('experience', i, bi, e.target.value)}
                    className="input flex-1" placeholder="Describe your responsibility..." />
                  {exp.bullets.length > 1 && (
                    <button onClick={() => removeBullet('experience', i, bi)} className="text-red-400 p-1"><Trash2 size={13} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => addBullet('experience', i)} className="text-xs btn-ghost px-2 py-1 gap-1">
                <Plus size={11} /> Add bullet
              </button>
            </div>
          ))}
        </Section>

        {/* Projects */}
        <Section title="Projects" icon={Code2} onAdd={() => addArrItem('projects', emptyProj)}>
          {form.projects.map((proj, i) => (
            <div key={i} className="p-4 rounded-xl mb-3 relative" style={{ background: 'var(--bg-secondary)' }}>
              {form.projects.length > 1 && (
                <button onClick={() => removeArrItem('projects', i)} className="absolute top-3 right-3 text-red-400 hover:bg-red-500/20 p-1 rounded">
                  <Trash2 size={13} />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[['name','Project Name'],['tech','Technologies'],['date','Date'],['live','Live URL'],['github','GitHub URL']].map(([k, l]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input value={proj[k]} onChange={(e) => updateArr('projects', i, k, e.target.value)} className="input" placeholder={l} />
                  </div>
                ))}
              </div>
              <label className="label">Description Bullets</label>
              {proj.bullets.map((b, bi) => (
                <div key={bi} className="flex gap-2 mb-2">
                  <input value={b} onChange={(e) => updateArrBullet('projects', i, bi, e.target.value)}
                    className="input flex-1" placeholder="Describe what you built..." />
                  {proj.bullets.length > 1 && (
                    <button onClick={() => removeBullet('projects', i, bi)} className="text-red-400 p-1"><Trash2 size={13} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => addBullet('projects', i)} className="text-xs btn-ghost px-2 py-1 gap-1">
                <Plus size={11} /> Add bullet
              </button>
            </div>
          ))}
        </Section>

        {/* Skills */}
        <Section title="Technical Skills" icon={Brain}>
          <textarea value={form.skills} onChange={(e) => updateField('skills', e.target.value)}
            className="input resize-none" rows={4}
            placeholder="List your skills (AI will categorize them)&#10;e.g. React, Node.js, Python, MongoDB, Docker, AWS..." />
        </Section>

        {/* Certifications */}
        <Section title="Certifications" icon={CheckCircle} onAdd={() => addArrItem('certifications', emptyCert)}>
          {form.certifications.map((cert, i) => (
            <div key={i} className="flex gap-3 mb-2">
              <input value={cert.name} onChange={(e) => updateArr('certifications', i, 'name', e.target.value)}
                className="input flex-1" placeholder="Certification name" />
              <input value={cert.issuer} onChange={(e) => updateArr('certifications', i, 'issuer', e.target.value)}
                className="input flex-1" placeholder="Issuer (e.g. Google, Microsoft)" />
              {form.certifications.length > 1 && (
                <button onClick={() => removeArrItem('certifications', i)} className="text-red-400 p-1"><Trash2 size={13} /></button>
              )}
            </div>
          ))}
        </Section>

        {error && (
          <p className="text-sm px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </p>
        )}

        {builderLoading ? (
          <div className="card p-6"><ProgressBar value={55} stage="AI building your resume..." /></div>
        ) : (
          <button onClick={handleBuild} className="btn-primary w-full justify-center py-3.5 text-base rounded-2xl">
            <Wand2 size={18} /> Build My Resume with AI
          </button>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children, onAdd }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: 'var(--accent-blue)' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="btn-ghost text-xs px-2 py-1 gap-1">
            <Plus size={12} /> Add
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function BuilderResult({ result, onReset }) {
  const { optimizedHtml, pdfUrl, atsScore } = result
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
              ✅ Your Resume is Ready!
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI has optimized and built your resume</p>
          </div>
          <div className="flex gap-3">
            <a href={pdfUrl} download className="btn-primary"><Download size={15} /> Download PDF</a>
            <button onClick={onReset} className="btn-secondary"><RefreshCw size={15} /> Build New</button>
          </div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="card p-6 flex flex-col items-center gap-2 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ATS Score</p>
            <ATSCircle score={atsScore || 0} size={120} />
          </div>
          <div className="card flex-1 overflow-hidden" style={{ height: '75vh' }}>
            <iframe srcDoc={optimizedHtml} className="w-full h-full border-0" title="Built Resume Preview" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
