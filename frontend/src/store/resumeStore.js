import { create } from 'zustand'
import api, { responseMessage } from '../lib/api'

async function post(path, body, fallback) {
  try {
    const { data } = await api.post(path, body)
    return { success: true, data: data.data }
  } catch (error) {
    return { success: false, message: responseMessage(error, fallback) }
  }
}

export function optimizeResume({ contact, settings, ...input }) {
  return post('/resume/optimize', { ...input, ...contact, ...settings }, 'Could not optimize the resume. Please try again.')
}

export function buildResume(formData, options) {
  return post('/resume/build', { formData, ...options }, 'Could not build the resume. Please try again.')
}

export async function importResumeDraft(intake) {
  if (intake.parsed?.text === intake.text) return { success: true, data: intake.parsed }
  const response = await post('/resume/extract', { kind: 'resume-draft', resumeText: intake.text }, 'Could not import the resume.')
  if (response.success && !response.data?.draft) {
    return { success: false, message: 'Update the connected API to auto-fill resume details.' }
  }
  return response
}

export async function previewResume(payload, signal) {
  const { data } = await api.post('/resume/preview', payload, { signal })
  return data.data
}

export async function readResumeFile(file, kind, signal) {
  const form = new FormData()
  form.append('document', file)
  form.append('kind', kind)
  try {
    const { data } = await api.post('/resume/extract', form, { signal })
    if (!data?.success || typeof data.data?.text !== 'string') {
      return { success: false, message: 'The connected server returned an unexpected upload response. Check the API URL or paste the document text.' }
    }
    return { success: true, data: data.data }
  } catch (error) {
    const message = error.response?.status === 404
      ? 'The connected API needs an update to accept file uploads. You can paste the document text to continue.'
      : responseMessage(error, 'Could not read the document.')
    return { success: false, message }
  }
}

export function reviewResume(tool, details) {
  const path = tool === 'ats' ? '/ats/check' : '/roaster/roast'
  return post(path, details, 'Could not review the resume. Please try again.')
}

const useResumeStore = create((set, get) => ({
  history: [],
  historyLoading: false,
  historyError: '',
  clearPrivateResults: () => set({
    history: [], historyError: '', historyLoading: false,
  }),

  fetchHistory: async () => {
    if (get().historyLoading) return
    const token = localStorage.getItem('nyris_token')
    set({ historyLoading: true, historyError: '' })
    try {
      const { data } = await api.get('/resume/history')
      if (localStorage.getItem('nyris_token') === token) set({ history: data.data })
    } catch (error) {
      if (localStorage.getItem('nyris_token') === token) set({ historyError: responseMessage(error, 'Unable to load your saved resumes.') })
    } finally {
      if (localStorage.getItem('nyris_token') === token) set({ historyLoading: false })
    }
  },

  toggleFavorite: async id => {
    try {
      const { data } = await api.patch('/resume/' + id + '/favorite')
      set(state => ({ history: state.history.map(entry => entry._id === id ? { ...entry, isFavorite: data.data.isFavorite } : entry) }))
      return { success: true }
    } catch (error) {
      return { success: false, message: responseMessage(error, 'Unable to update the favorite.') }
    }
  },

  deleteResume: async id => {
    try {
      await api.delete('/resume/' + id)
      set(state => ({ history: state.history.filter(entry => entry._id !== id) }))
      return { success: true }
    } catch (error) {
      return { success: false, message: responseMessage(error, 'Unable to delete the saved result.') }
    }
  },
}))

export default useResumeStore
