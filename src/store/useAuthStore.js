import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: !!localStorage.getItem('token'),

  login: (token) => {
    localStorage.setItem('token', token)
    const decoded = jwtDecode(token)
    set({ 
      token, 
      isLoggedIn: true,
      user: { id: decoded.userId }
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoggedIn: false })
  },

  setUser: (user) => set({ user }),
}))

export default useAuthStore