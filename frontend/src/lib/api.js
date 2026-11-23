import axios from 'axios'

const configuredBase = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
const baseURL = configuredBase
  ? (configuredBase.endsWith('/api') ? configuredBase : configuredBase + '/api')
  : '/api'

const api = axios.create({ baseURL, timeout: 90000 })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('nyris_token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})
api.interceptors.response.use(response => response, error => {
  const url = error.config?.url
  const signingIn = url === '/auth/login' || url === '/auth/signup'
  if (error.response?.status === 401 && !signingIn && error.config?.headers?.Authorization) {
    localStorage.removeItem('nyris_token')
    localStorage.removeItem('nyris_user')
    window.location.assign('/login')
  }
  return Promise.reject(error)
})

export function responseMessage(error, fallback = 'Unable to reach Nyris. Please try again.') {
  return error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The request timed out. Try again with a shorter input.' : fallback)
}

export function saveDownload(data, filename) {
  const url = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function downloadResume(result, format) {
  try {
    const { data } = await api.get('/resume/' + result.resumeId + '/export/' + format, {
      responseType: 'blob',
      headers: result.accessToken ? { 'X-Resume-Access': result.accessToken } : undefined,
    })
    const name = (result.optimizedData?.name || result.title || 'Resume').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim().slice(0, 80)
    saveDownload(data, (name || 'Resume') + '.' + format)
  } catch (error) {
    const payload = error.response?.data
    if (payload instanceof Blob) {
      const body = await payload.text()
      try { error.response.data = JSON.parse(body) } catch { /* keep the default download error */ }
    }
    throw error
  }
}
export default api
