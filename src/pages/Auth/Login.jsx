import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  // handles any input change — updates the right field by name
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        // register then auto login
        await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
        })
        const res = await authAPI.login({
          email: form.email,
          password: form.password,
        })
        login(res.data.user, res.data.token)
      } else {
        const res = await authAPI.login({
          email: form.email,
          password: form.password,
        })
        login(res.data.user, res.data.token)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      {/* Background orb */}
      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        {/* Logo */}
        {/* <Link to="/" className="block text-center text-2xl font-medium mb-8">
          Store<span className="text-purple-400">Hub</span>
        </Link> */}

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {/* Title */}
          <h1 className="text-2xl font-medium text-white mb-1">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {isRegister ? 'Join us to start shopping' : 'Sign in to continue'}
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {isRegister && (
              <div>
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
              </div>
            )}

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
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] mt-2">
              {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>

          </form>

          {/* Toggle */}
          <p className="text-white/30 text-sm text-center mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="text-purple-400 hover:text-purple-300 transition-colors">
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  )
}

export default Login