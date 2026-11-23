import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ResumeResult from '../components/ResumeResult'
import { ATSResult } from './ATSPage'
import { RoastResult } from './RoasterPage'
import api, { responseMessage } from '../lib/api'

export default function SavedResumePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const goBack = () => navigate('/history')

  useEffect(() => {
    const controller = new AbortController()
    setResult(null)
    setError('')
    api.get('/resume/' + id, { signal: controller.signal })
      .then(({ data }) => setResult(data.data))
      .catch(problem => {
        if (!controller.signal.aborted) setError(responseMessage(problem, 'Unable to open the saved result.'))
      })
    return () => controller.abort()
  }, [id])

  if (result?.optimizedHtml) return <ResumeResult result={result} onBack={goBack} backLabel="Back to history" />

  return (
    <div className="page-spacing mx-auto max-w-6xl">
      {!result && !error && <p role="status" style={{ color: 'var(--text-secondary)' }}>Loading saved result…</p>}
      {error && <p className="resume-error" role="alert">{error}</p>}
      <Link to="/history" className="btn-secondary my-4">Back to history</Link>
      {result?.type === 'ats_check' && <ATSResult result={{ ...result.report, score: result.atsScore }} />}
      {result?.type === 'roasted' && <RoastResult result={result.roastContent || {}} />}
    </div>
  )
}
