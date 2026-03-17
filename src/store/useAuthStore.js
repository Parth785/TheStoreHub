import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token, isLoggedIn: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoggedIn: false })
  },
}))

export default useAuthStore