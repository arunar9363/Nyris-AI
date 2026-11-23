import { create } from 'zustand'
import api, { responseMessage } from '../lib/api'
import useResumeStore from './resumeStore'

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('nyris_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('nyris_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('nyris_token', data.token)
      localStorage.setItem('nyris_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoading: false })
      return { success: true }
    } catch (err) {
      const msg = responseMessage(err, 'Could not sign in. Check that the Nyris API is running.')
      set({ error: msg, isLoading: false })
      return { success: false, message: msg }
    }
  },

  signup: async (formData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/signup', formData)
      localStorage.setItem('nyris_token', data.token)
      localStorage.setItem('nyris_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoading: false })
      return { success: true }
    } catch (err) {
      const msg = responseMessage(err, 'Could not create the account. Check that the Nyris API is running.')
      set({ error: msg, isLoading: false })
      return { success: false, message: msg }
    }
  },

  logout: () => {
    localStorage.removeItem('nyris_token')
    localStorage.removeItem('nyris_user')
    useResumeStore.getState().clearPrivateResults()
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().token && !!get().user,
}))

export default useAuthStore
