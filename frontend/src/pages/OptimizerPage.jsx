import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowRight, ArrowLeft, Download, RefreshCw,
  Briefcase, Upload, MessageSquare, User, Layout, CheckCircle,
  Plus, Trash2, FileImage, FileText as FileTextIcon, X, Image
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import useResumeStore from '../store/resumeStore'
import { StepIndicator, FileDropzone, ProgressBar, ATSCircle, Tag } from '../components/ui/index'

/* ─── 5 Steps restored ─── */
const STEPS = ['Job Description', 'Upload Resume', 'Suggestions', 'Your Info', 'Template']

const TEMPLATES = [
  { id: 'minimal', label: 'Minimal', desc: 'Clean, ATS-first, classic layout', color: '#3b82f6' },
  { id: 'modern', label: 'Modern', desc: 'Sidebar accent, two-column', color: '#8b5cf6' },
  { id: 'creative', label: 'Creative', desc: 'Bold header, chip skills', color: '#06b6d4' },
]

/* ─── JD File Dropzone (PDF + Image) ─── */
function JDFileDropzone({ onDrop, file, onRemove }) {
  const accept = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted[0] && onDrop(accepted[0]),
    accept,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  })

  const isImage = file && file.type.startsWith('image/')

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.08)' }}
      >
        {isImage ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
            <img src={URL.createObjectURL(file)} alt="JD" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(16,185,129,0.2)' }}>
            <FileTextIcon size={16} style={{ color: '#10b981' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isImage ? 'Image — AI will read text from it' : 'PDF — AI will extract text'}
            {' · '}{(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-500/20 transition-colors">
          <X size={14} className="text-red-400" />
        </button>
      </motion.div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200"
      style={{
        borderColor: isDragActive ? 'var(--accent-blue)' : 'var(--border)',
        background: isDragActive ? 'rgba(59,130,246,0.06)' : 'var(--bg-secondary)',
        transform: isDragActive ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <input {...getInputProps()} />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.1)' }}>
          <FileTextIcon size={18} style={{ color: 'var(--accent-blue)' }} />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.1)' }}>
          <Image size={18} style={{ color: '#8b5cf6' }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isDragActive ? 'Drop it here!' : 'Upload JD as PDF or Image'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          PDF, PNG, JPG, WEBP · Max 10MB · or click to browse
        </p>
      </div>
    </div>
  )
}

/* ══════════ MAIN PAGE ══════════ */
export default function OptimizerPage() {
  const store = useResumeStore()
  const [error, setError] = useState('')
  const [jdFile, setJdFile] = useState(null)

  const next = async () => {
    setError('')

    if (store.optimizerStep === 1) {
      const hasJdText = store.jobDescription.trim().length > 0
      const hasJdFile = !!jdFile
      if (!hasJdText && !hasJdFile)
        return setError('Please enter a job description, or upload a PDF/image of the JD.')
      // If JD file uploaded, encode it for backend
      if (hasJdFile && !hasJdText) {
        store.setJobDescription(`[JD_FILE_UPLOADED: ${jdFile.name}]`)
        store.setJdFile(jdFile)
      }
    }

    if (store.optimizerStep === 2 && !store.resumeFile && !store.resumeText.trim())
      return setError('Please upload your resume or paste the text.')

    if (store.optimizerStep === 4 && !store.personalInfo.name)
      return setError('Please enter at least your name.')

    if (store.optimizerStep === 5) {
      if (!store.resumeFile && !store.resumeText.trim())
        return setError('Please go back to Step 2 and upload your resume.')
      const result = await store.optimizeResume()
      if (!result.success) setError(result.message)
      return
    }

    store.setOptimizerStep(store.optimizerStep + 1)
  }

  const back = () => {
    setError('')
    store.setOptimizerStep(store.optimizerStep - 1)
  }

  const addProjectLink = () =>
    store.setPersonalInfo({ projectLinks: [...store.personalInfo.projectLinks, ''] })
  const updateProjectLink = (i, val) => {
    const arr = [...store.personalInfo.projectLinks]
    arr[i] = val
    store.setPersonalInfo({ projectLinks: arr })
  }
  const removeProjectLink = (i) => {
    const arr = store.personalInfo.projectLinks.filter((_, idx) => idx !== i)
    store.setPersonalInfo({ projectLinks: arr.length ? arr : [''] })
  }

  if (store.isOptimizing) return <OptimizingScreen progress={store.optimizerProgress} stage={store.optimizerStage} />
  if (store.optimizerResult) return <ResultScreen result={store.optimizerResult} onReset={() => { store.resetOptimizer(); setJdFile(null) }} />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border"
          style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#60a5fa' }}>
          <Sparkles size={12} /> Free · No Account Needed
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          JD → Resume Optimizer
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          5 simple steps to an ATS-optimized resume tailored to the job
        </p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-10">
        <StepIndicator steps={STEPS} currentStep={store.optimizerStep} />
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={store.optimizerStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className="card p-8">

            {/* ── STEP 1: Job Description ── */}
            {store.optimizerStep === 1 && (
              <div className="space-y-6">
                <StepHeader icon={Briefcase} step={1} total={5} title="Enter Job Description"
                  desc="Paste the JD text, or upload it as a PDF / screenshot image" />

                {/* JD Text */}
                <div>
                  <label className="label">Job Description Text</label>
                  <textarea
                    value={jdFile ? '' : store.jobDescription}
                    onChange={(e) => { store.setJobDescription(e.target.value); setJdFile(null) }}
                    disabled={!!jdFile}
                    className="input resize-none"
                    rows={7}
                    placeholder="Paste the full job description here... (requirements, responsibilities, skills)"
                  />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {jdFile ? '📎 JD file uploaded below — text input disabled' : `${store.jobDescription.length} characters · More detail = better optimization`}
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    OR upload JD file
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {/* JD File Upload */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <FileImage size={11} /> Upload JD as PDF or Image
                    <span className="text-[10px] font-normal normal-case ml-1" style={{ color: 'var(--text-muted)' }}>
                      (screenshot, scan, or PDF of the job posting)
                    </span>
                  </label>
                  <JDFileDropzone
                    onDrop={(f) => { setJdFile(f); store.setJobDescription('') }}
                    file={jdFile}
                    onRemove={() => setJdFile(null)}
                  />
                </div>

                {/* Info tip */}
                <div className="p-3.5 rounded-xl border" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
                  <p className="text-xs" style={{ color: '#60a5fa' }}>
                    💡 <strong>Tip:</strong> Paste text for best results. Upload image/PDF if you only have a screenshot of the job posting.
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 2: Upload Resume ── */}
            {store.optimizerStep === 2 && (
              <div className="space-y-5">
                <StepHeader icon={Upload} step={2} total={5} title="Upload Your Resume"
                  desc="Upload your existing resume — PDF or TXT, or paste text below" />
                <FileDropzone
                  onDrop={(f) => { store.setResumeFile(f); store.setResumeText('') }}
                  file={store.resumeFile}
                  onRemove={() => store.setResumeFile(null)}
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs font-medium px-2" style={{ color: 'var(--text-muted)' }}>OR paste text</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <textarea
                  value={store.resumeText}
                  onChange={(e) => { store.setResumeText(e.target.value); store.setResumeFile(null) }}
                  className="input resize-none text-xs font-mono"
                  rows={8}
                  placeholder="Paste your resume text here..."
                />
              </div>
            )}

            {/* ── STEP 3: Suggestions ── */}
            {store.optimizerStep === 3 && (
              <div className="space-y-5">
                <StepHeader icon={MessageSquare} step={3} total={5} title="Custom Suggestions"
                  desc="Tell us what to improve or highlight (optional)" />
                <div>
                  <label className="label">What should we focus on?</label>
                  <textarea
                    value={store.customSuggestions}
                    onChange={(e) => store.setCustomSuggestions(e.target.value)}
                    className="input resize-none"
                    rows={6}
                    placeholder="e.g. Highlight my React.js experience, improve project descriptions, add more backend keywords, make summary more impactful..."
                  />
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#60a5fa' }}>💡 Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Emphasize leadership experience', 'Add more quantified achievements', 'Improve technical skills section', 'Make the summary more concise'].map((s) => (
                      <button key={s} type="button"
                        onClick={() => store.setCustomSuggestions((prev) => prev ? `${prev}, ${s}` : s)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors hover:bg-blue-500/20"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Personal Info ── */}
            {store.optimizerStep === 4 && (
              <div className="space-y-5">
                <StepHeader icon={User} step={4} total={5} title="Your Contact Info"
                  desc="This will be used in the generated resume" />
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name *', placeholder: 'Arun Pratap Singh', type: 'text' },
                    { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
                    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'text' },
                    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/yourname', type: 'text' },
                    { key: 'github', label: 'GitHub URL', placeholder: 'github.com/yourname', type: 'text' },
                    { key: 'portfolio', label: 'Portfolio URL', placeholder: 'yourportfolio.com', type: 'text' },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        value={store.personalInfo[key]}
                        onChange={(e) => store.setPersonalInfo({ [key]: e.target.value })}
                        className="input"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Project Links (clickable in PDF)</label>
                    <button onClick={addProjectLink} className="text-xs btn-ghost px-2 py-1 gap-1">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {store.personalInfo.projectLinks.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={link}
                          onChange={(e) => updateProjectLink(i, e.target.value)}
                          className="input flex-1"
                          placeholder={`https://project-${i + 1}.vercel.app`}
                        />
                        {store.personalInfo.projectLinks.length > 1 && (
                          <button onClick={() => removeProjectLink(i)} className="btn-ghost p-2 text-red-400">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: Template ── */}
            {store.optimizerStep === 5 && (
              <div className="space-y-5">
                <StepHeader icon={Layout} step={5} total={5} title="Choose Template"
                  desc="Select how your final resume will look" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TEMPLATES.map(({ id, label, desc, color }) => (
                    <button key={id} onClick={() => store.setSelectedTemplate(id)}
                      className="relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-1"
                      style={{
                        borderColor: store.selectedTemplate === id ? color : 'var(--border)',
                        background: store.selectedTemplate === id ? `${color}14` : 'var(--bg-secondary)',
                      }}>
                      {store.selectedTemplate === id && (
                        <CheckCircle size={16} className="absolute top-3 right-3" style={{ color }} />
                      )}
                      <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center"
                        style={{ background: `${color}20` }}>
                        <Layout size={15} style={{ color }} />
                      </div>
                      <div className="font-bold text-sm mb-1"
                        style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>{label}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                    </button>
                  ))}
                </div>

                {/* Review summary */}
                <div className="space-y-2 mt-2">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Review before generating
                  </p>
                  <ReviewRow label="Job Description"
                    value={jdFile ? `File: ${jdFile.name}` : (store.jobDescription.slice(0, 80) + '...')}
                    ok={!!(store.jobDescription || jdFile)} />
                  <ReviewRow label="Resume"
                    value={store.resumeFile ? store.resumeFile.name : store.resumeText ? 'Text pasted' : 'Not provided'}
                    ok={!!(store.resumeFile || store.resumeText)} />
                  <ReviewRow label="Custom Suggestions"
                    value={store.customSuggestions || 'None — AI will decide'} ok />
                  <ReviewRow label="Name"
                    value={store.personalInfo.name || 'Not provided'}
                    ok={!!store.personalInfo.name} />
                </div>

                <div className="p-4 rounded-xl border" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <p className="text-sm" style={{ color: '#34d399' }}>
                    ✅ All templates are ATS-optimized · PDFs generated via Puppeteer · Takes 15–40 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 text-sm px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </motion.p>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button onClick={back} disabled={store.optimizerStep === 1}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowLeft size={15} /> Back
              </button>
              <button onClick={next} className="btn-primary">
                {store.optimizerStep === 5
                  ? <><Sparkles size={15} /> Optimize & Generate</>
                  : <>Next <ArrowRight size={15} /></>
                }
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─── Step Header ─── */
function StepHeader({ icon: Icon, step, total = 5, title, desc }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(59,130,246,0.15)' }}>
        <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--accent-blue)' }}>
          Step {step} of {total}
        </p>
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
    </div>
  )
}

/* ─── Review Row ─── */
function ReviewRow({ label, value, ok }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border"
      style={{
        background: ok ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
        borderColor: ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
      }}>
      <CheckCircle size={15} className="mt-0.5 shrink-0"
        style={{ color: ok ? '#10b981' : '#ef4444' }} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider block mb-0.5"
          style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-sm truncate block" style={{ color: 'var(--text-secondary)' }}>{value}</span>
      </div>
    </div>
  )
}

/* ─── Optimizing Screen ─── */
function OptimizingScreen({ progress, stage }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center">
        <div className="card p-10">
          <motion.div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 50px rgba(37,99,235,0.4)' }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={30} color="#fff" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
            AI is Working...
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Analyzing your resume and optimizing for the job description
          </p>
          <ProgressBar value={progress} stage={stage} />
          <div className="mt-6 grid grid-cols-3 gap-2">
            {['Parsing', 'Optimizing', 'Generating'].map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                style={{ background: progress > i * 33 ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)' }}>
                <motion.div className="w-6 h-6 rounded-full flex items-center justify-center"
                  animate={{ scale: progress > i * 33 && progress <= (i + 1) * 33 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ background: progress > i * 33 ? 'rgba(59,130,246,0.3)' : 'var(--border)' }}>
                  {progress > (i + 1) * 33
                    ? <CheckCircle size={13} style={{ color: '#10b981' }} />
                    : <div className="w-2 h-2 rounded-full"
                      style={{ background: progress > i * 33 ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                  }
                </motion.div>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Result Screen ─── */
function ResultScreen({ result, onReset }) {
  const { optimizedHtml, pdfUrl, atsScore, comparison, suggestions, keywordImprovements } = result
  const [activeTab, setActiveTab] = useState('preview')

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>
                Resume Optimized!
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your ATS-optimized resume is ready. Download the PDF below.
            </p>
          </div>
          <div className="flex gap-3">
            <a href={pdfUrl} download className="btn-primary">
              <Download size={15} /> Download PDF
            </a>
            <button onClick={onReset} className="btn-secondary">
              <RefreshCw size={15} /> New Resume
            </button>
          </div>
        </div>
      </motion.div>

      {/* ATS Score + Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 flex flex-col items-center justify-center md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>ATS Score</p>
          <ATSCircle score={atsScore || 0} size={130} />
        </div>
        <div className="md:col-span-3 card p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>What Changed</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatBox label="Added" value={comparison?.added?.length || 0} color="#10b981" />
            <StatBox label="Improved" value={comparison?.improved?.length || 0} color="#f59e0b" />
            <StatBox label="Keywords" value={keywordImprovements?.length || 0} color="#3b82f6" />
          </div>
          <div className="flex flex-wrap gap-2">
            {comparison?.added?.slice(0, 4).map((t) => <Tag key={t} added>{t}</Tag>)}
            {comparison?.improved?.slice(0, 4).map((t) => <Tag key={t} improved>{t}</Tag>)}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)' }}>
        {['preview', 'suggestions'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
            style={{
              background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab ? 'var(--shadow-card)' : 'none',
            }}>
            {tab === 'preview' ? 'Resume Preview' : 'AI Suggestions'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'preview' ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card overflow-hidden" style={{ height: '80vh' }}>
            <iframe srcDoc={optimizedHtml} className="w-full h-full border-0" title="Optimized Resume Preview" />
          </motion.div>
        ) : (
          <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {suggestions?.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 card p-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>{i + 1}</div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl"
      style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
