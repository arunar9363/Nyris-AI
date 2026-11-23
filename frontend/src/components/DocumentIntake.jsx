import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { FileDropzone } from './ui'
import { readResumeFile } from '../store/resumeStore'

const documentFiles = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
}
const jobFiles = { ...documentFiles, 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }

export function ResumeTextEditor({ id, label, text, onChange, placeholder, rows = 8, disabled }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
        <label className="label !mb-0" htmlFor={id}>{label}</label>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{words} {words === 1 ? 'word' : 'words'}</span>
      </div>
      <textarea id={id} className="input max-h-[45dvh] leading-5 sm:max-h-none sm:leading-relaxed" rows={rows} maxLength={30000}
        value={text} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} />
    </div>
  )
}

export default function DocumentIntake({ id, kind = 'resume', value, onChange, onBusyChange, allowImages = false, withDraft = false, rows }) {
  const [pendingFile, setPendingFile] = useState(null)
  const [error, setError] = useState('')
  const current = useRef(null)
  const job = kind === 'job'
  const documentName = job ? 'job description' : 'resume'

  useEffect(() => () => {
    current.current?.abort()
    onBusyChange(false)
  }, [onBusyChange])

  async function pick(file) {
    current.current?.abort()
    const request = new AbortController()
    current.current = request
    setError('')
    setPendingFile(file)
    onBusyChange(true)
    const result = await readResumeFile(file, withDraft ? 'resume-draft' : kind, request.signal)
    if (current.current !== request || request.signal.aborted) return
    setPendingFile(null)
    onBusyChange(false)
    if (result.success) {
      const { text, sections, draft } = result.data
      onChange({ text, file, sections, parsed: draft ? result.data : undefined })
    }
    else setError(result.message + (allowImages && file.type.startsWith('image/') ? ' Paste the job description to continue.' : ''))
  }

  function remove() {
    current.current?.abort()
    current.current = null
    setPendingFile(null)
    onBusyChange(false)
    setError('')
    onChange({ text: value.text, parsed: value.parsed })
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <FileDropzone file={pendingFile || value.file} onDrop={pick} onRemove={remove} name={documentName}
        accept={allowImages ? jobFiles : documentFiles} formats={allowImages ? 'PDF, Word, TXT, PNG, JPG, or WEBP' : 'PDF, Word, or TXT'} />
      {pendingFile && <p className="flex items-center gap-2 text-sm" role="status" style={{ color: 'var(--text-secondary)' }}><Loader2 size={15} className="animate-spin" /> Reading {documentName}…</p>}
      {error && <p className="resume-error" role="alert">{error}</p>}
      {value.file && !pendingFile && <p className="text-sm" role="status" style={{ color: 'var(--text-secondary)' }}>Text extracted. Check the wording and reading order below.</p>}
      {!job && !!value.sections?.length && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Headings found in the file include {value.sections.slice(0, 7).join(', ')}.</p>}
      <ResumeTextEditor id={id} label={value.file ? 'Extracted ' + documentName + ' text' : 'Paste ' + documentName + ' text'}
        text={value.text} onChange={text => onChange({ ...value, text })} rows={rows} disabled={!!pendingFile}
        placeholder={job ? 'Paste the responsibilities and qualifications from the posting…' : 'Paste your name, contact details, and resume sections…'} />
    </div>
  )
}
