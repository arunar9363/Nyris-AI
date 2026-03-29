import axios from 'axios'

// LOCAL:      set nothing — uses Vite proxy (/api → localhost:5000)
// PRODUCTION: set VITE_API_URL=https://your-backend.onrender.com/api in Render env vars
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 2 minutes for AI calls
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nyris_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nyris_token')
      localStorage.removeItem('nyris_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api