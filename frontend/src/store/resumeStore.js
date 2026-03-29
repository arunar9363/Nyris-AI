import { create } from 'zustand'
import api from '../lib/api'

const useResumeStore = create((set, get) => ({
  // Optimizer flow state
  optimizerStep: 1,
  jobDescription: '',
  jdFile: null,
  resumeFile: null,
  resumeText: '',
  customSuggestions: '',
  personalInfo: {
    name: '', email: '', phone: '',
    linkedin: '', github: '', portfolio: '',
    projectLinks: [''],
  },
  selectedTemplate: 'minimal',

  // Results
  optimizerResult: null,
  isOptimizing: false,
  optimizerProgress: 0,
  optimizerStage: '',

  // History
  history: [],
  favorites: [],
  historyLoading: false,

  // ATS
  atsResult: null,
  atsLoading: false,

  // Roaster
  roastResult: null,
  roastLoading: false,

  // Builder
  builderResult: null,
  builderLoading: false,

  // Setters
  setOptimizerStep: (step) => set({ optimizerStep: step }),
  setJobDescription: (v) => set({ jobDescription: v }),
  setJdFile: (f) => set({ jdFile: f }),
  setResumeFile: (f) => set({ resumeFile: f }),
  setResumeText: (v) => set({ resumeText: v }),
  setCustomSuggestions: (v) => set({ customSuggestions: v }),
  setPersonalInfo: (info) => set((s) => ({ personalInfo: { ...s.personalInfo, ...info } })),
  setSelectedTemplate: (t) => set({ selectedTemplate: t }),

  resetOptimizer: () => set({
    optimizerStep: 1,
    jobDescription: '',
    jdFile: null,
    resumeFile: null,
    resumeText: '',
    customSuggestions: '',
    personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', projectLinks: [''] },
    selectedTemplate: 'minimal',
    optimizerResult: null,
    optimizerProgress: 0,
    optimizerStage: '',
  }),

  // Optimize resume action
  optimizeResume: async () => {
    const s = get()
    set({ isOptimizing: true, optimizerProgress: 0, optimizerStage: 'Parsing resume...' })

    const progressStages = [
      { pct: 15, msg: 'Parsing resume content...' },
      { pct: 30, msg: 'Analyzing job description...' },
      { pct: 50, msg: 'AI optimizing content...' },
      { pct: 70, msg: 'Injecting into template...' },
      { pct: 85, msg: 'Generating PDF...' },
      { pct: 95, msg: 'Finalizing...' },
    ]

    let stageIdx = 0
    const interval = setInterval(() => {
      if (stageIdx < progressStages.length) {
        const { pct, msg } = progressStages[stageIdx]
        set({ optimizerProgress: pct, optimizerStage: msg })
        stageIdx++
      }
    }, 1500)

    try {
      const formData = new FormData()
      formData.append('jobDescription', s.jobDescription)
      formData.append('customSuggestions', s.customSuggestions)
      formData.append('templateId', s.selectedTemplate)
      formData.append('name', s.personalInfo.name)
      formData.append('email', s.personalInfo.email)
      formData.append('phone', s.personalInfo.phone)
      formData.append('linkedin', s.personalInfo.linkedin)
      formData.append('github', s.personalInfo.github)
      formData.append('portfolio', s.personalInfo.portfolio)
      s.personalInfo.projectLinks.filter(Boolean).forEach((l) => formData.append('projectLinks', l))
      if (s.resumeFile) formData.append('resumeFile', s.resumeFile)
      else formData.append('resumeText', s.resumeText)
      if (s.jdFile) formData.append('jdFile', s.jdFile)

      const { data } = await api.post('/resume/optimize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(interval)
      set({ optimizerProgress: 100, optimizerStage: 'Done!', optimizerResult: data.data, isOptimizing: false })
      return { success: true }
    } catch (err) {
      clearInterval(interval)
      set({ isOptimizing: false, optimizerProgress: 0, optimizerStage: '' })
      return { success: false, message: err.response?.data?.message || 'Optimization failed' }
    }
  },

  // Check ATS
  checkATS: async (file, jobDescription, resumeText) => {
    set({ atsLoading: true, atsResult: null })
    try {
      const formData = new FormData()
      if (file) formData.append('resumeFile', file)
      else formData.append('resumeText', resumeText)
      if (jobDescription) formData.append('jobDescription', jobDescription)

      const { data } = await api.post('/ats/check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set({ atsResult: data.data, atsLoading: false })
      return { success: true }
    } catch (err) {
      set({ atsLoading: false })
      return { success: false, message: err.response?.data?.message || 'ATS check failed' }
    }
  },

  // Roast resume
  roastResume: async (file, resumeText) => {
    set({ roastLoading: true, roastResult: null })
    try {
      const formData = new FormData()
      if (file) formData.append('resumeFile', file)
      else formData.append('resumeText', resumeText)

      const { data } = await api.post('/roaster/roast', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set({ roastResult: data.data, roastLoading: false })
      return { success: true }
    } catch (err) {
      set({ roastLoading: false })
      return { success: false, message: err.response?.data?.message || 'Roast failed' }
    }
  },

  // Build resume
  buildResume: async (formData, domain, templateId) => {
    set({ builderLoading: true, builderResult: null })
    try {
      const { data } = await api.post('/resume/build', { formData, domain, templateId })
      set({ builderResult: data.data, builderLoading: false })
      return { success: true }
    } catch (err) {
      set({ builderLoading: false })
      return { success: false, message: err.response?.data?.message || 'Build failed' }
    }
  },

  // Fetch history
  fetchHistory: async () => {
    set({ historyLoading: true })
    try {
      const { data } = await api.get('/resume/history')
      set({ history: data.data, historyLoading: false })
    } catch {
      set({ historyLoading: false })
    }
  },

  toggleFavorite: async (id) => {
    try {
      await api.patch(`/resume/${id}/favorite`)
      set((s) => ({
        history: s.history.map((r) => r._id === id ? { ...r, isFavorite: !r.isFavorite } : r),
      }))
    } catch {}
  },

  deleteResume: async (id) => {
    try {
      await api.delete(`/resume/${id}`)
      set((s) => ({ history: s.history.filter((r) => r._id !== id) }))
    } catch {}
  },
}))

export default useResumeStore
