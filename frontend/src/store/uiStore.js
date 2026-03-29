import { create } from 'zustand'

const getStoredTheme = () => localStorage.getItem('nyris_theme') || 'dark'

const useUIStore = create((set, get) => ({
  theme: getStoredTheme(),
  sidebarOpen: false,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('nyris_theme', next)
    if (next === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    }
    set({ theme: next })
  },

  initTheme: () => {
    const theme = getStoredTheme()
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('light')
    }
    set({ theme })
  },

  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

export default useUIStore
