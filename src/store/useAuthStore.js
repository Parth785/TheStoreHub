import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'

const useAuthStore = create((set) => ({
  // on app load — check if token exists in localStorage
  // if yes → restore auth state automatically
  token: localStorage.getItem('token') || null,
  isLoggedIn: !!localStorage.getItem('token'),
  user: (() => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const decoded = jwtDecode(token)
        return {
          id: decoded.userId,
          role: decoded.role || 'USER'  // ← add role
        }
      }
      return null
    } catch {
      return null
    }
  })(),

  login: (token) => {
    localStorage.setItem('token', token)
    const decoded = jwtDecode(token)
    set({
      token,
      isLoggedIn: true,
      user: {
        id: decoded.userId,
        role: decoded.role || 'USER'  // ← add role
      }
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    // localStorage.removeItem('cart')  // clear cart on logout
    set({ user: null, token: null, isLoggedIn: false })
  },

  setUser: (user) => set({ user }),
}))

export default useAuthStore