import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { orderAPI, authAPI } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'

const SAMPLE_USER = {
  id: 1,
  name: 'Parth Lakhani',
  email: 'parth@example.com',
  phone: '+91 98765 43210',
  address: 'Ahmedabad, Gujarat, India',
  role: 'USER',
  createdAt: '2026-01-15T10:00:00',
}

const SAMPLE_ORDERS = [
  { id: 1, status: 'DELIVERED', totalPrice: 2499, createdAt: '2026-03-10T10:30:00' },
  { id: 2, status: 'SHIPPED', totalPrice: 1548, createdAt: '2026-03-14T14:20:00' },
  { id: 3, status: 'PENDING', totalPrice: 349, createdAt: '2026-03-17T09:00:00' },
]

const STATUS_COLORS = {
  PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  PROCESSING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  SHIPPED: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  DELIVERED: 'text-green-400 bg-green-400/10 border-green-400/20',
}

function Profile() {
  const navigate = useNavigate()
  const { isLoggedIn, logout, user } = useAuthStore()
  const { items } = useCartStore()

  const [profile, setProfile] = useState(SAMPLE_USER)
  const [orders, setOrders] = useState(SAMPLE_ORDERS)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user?.id) {
      authAPI.getProfile(user.id)
        .then(res => setProfile(res.data))
        .catch(() => setProfile(SAMPLE_USER))
    }

    orderAPI.getMyOrders()
      .then(res => setOrders(res.data))
      .catch(() => setOrders(SAMPLE_ORDERS))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">Account</p>
          <h1 className="text-4xl md:text-5xl font-medium">My profile</h1>
        </motion.div>

        {/* Profile card */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl font-medium text-purple-400 flex-shrink-0">
            {getInitials(profile.name)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-medium text-white">{profile.name}</h2>
            <p className="text-white/40 text-sm mt-1">{profile.email}</p>
            <p className="text-xs text-white/20 mt-1">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="border border-white/10 hover:border-red-400/50 hover:text-red-400 text-white/50 px-4 py-2 rounded-xl text-sm transition-all">
            Sign out
          </button>

        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          {[
            { label: 'Total orders', value: orders.length },
            { label: 'Total spent', value: `$${totalSpent.toLocaleString()}` },
            { label: 'Cart items', value: items.length },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-medium text-white">{stat.value}</p>
              <p className="text-xs text-white/30 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}>
          {['profile', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm transition-all capitalize ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <motion.div
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">
              Personal details
            </h3>
            <div className="flex flex-col gap-0">
              {[
                { label: 'Full name', value: profile.name },
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
                { label: 'Address', value: profile.address },
                { label: 'Account type', value: profile.role },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/30">{row.label}</span>
                  <span className="text-sm text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            {orders.map((order, index) => (
              <div
                key={order.id}
                onClick={() => navigate('/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-400/30 transition-all">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white">Order #{order.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-white/30">{formatDate(order.createdAt)}</span>
                </div>
                <span className="text-purple-400 font-medium">
                  ${order.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  )
}

export default Profile