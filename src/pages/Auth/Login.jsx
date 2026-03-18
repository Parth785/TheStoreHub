import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authAPI } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

// Toast component — animated popup from bottom
function Toast({ message, type, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${
            type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 40, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
          <span className="text-lg">
            {type === 'success' ? '✓' : '✕'}
          </span>
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
        })

        showToast('Account created! Signing you in...')
        setLoading(false)

        setTimeout(async () => {
          try {
            const res = await authAPI.login({
              email: form.email,
              password: form.password,
            })
            login(res.data)
            showToast('Welcome to arc.store!')
            setTimeout(() => navigate('/'), 1000)
          } catch {
            showToast('Registered! Please sign in.', 'success')
            setIsRegister(false)
          }
        }, 1500)

      } else {
        const res = await authAPI.login({
          email: form.email,
          password: form.password,
        })
        login(res.data)
        showToast('Welcome back!')
        setLoading(false)
        setTimeout(() => navigate('/'), 1000)
      }

    } catch (err) {
      const data = err.response?.data
      let message = 'Something went wrong'
      if (typeof data === 'string') message = data
      else if (data?.message) message = data.message
      showToast(message, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        <Link to="/" className="block text-center text-2xl font-medium mb-8 text-white">
          arc<span className="text-purple-400">.</span>store
        </Link>

        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-8"
          layout>

          {/* Title with animation when switching */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? 'register' : 'login'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}>
              <h1 className="text-2xl font-medium text-white mb-1">
                {isRegister ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-white/40 text-sm mb-8">
                {isRegister ? 'Join us to start shopping' : 'Sign in to continue'}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <AnimatePresence>
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}>
                  <label className="text-white/40 text-xs mb-1 block">Full name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Parth Lakhani"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-white/40 text-xs mb-1 block">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs mb-1 block">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] mt-2 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={loading ? 'loading' : isRegister ? 'register' : 'login'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="block">
                  {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
                </motion.span>
              </AnimatePresence>
            </button>

          </form>

          <p className="text-white/30 text-sm text-center mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setForm({ name: '', email: '', password: '' })
              }}
              className="text-purple-400 hover:text-purple-300 transition-colors">
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>

        </motion.div>
      </motion.div>

      {/* Animated toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />

    </div>
  )
}

export default Login