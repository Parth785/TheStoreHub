import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../../services/api'

function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await adminAPI.login(form)
      localStorage.setItem('adminToken', res.data)
      navigate('/admin')
    } catch (err) {
      setError('Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        <div className="text-center mb-8">
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">Restricted</p>
          <h1 className="text-3xl font-medium text-white">
            Store<span className="text-purple-400">Hub</span>
          </h1>
          <p className="text-white/30 text-sm mt-2">Admin Panel</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Username</label>
              <input
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all mt-2">
              {loading ? 'Signing in...' : 'Access Admin Panel'}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin