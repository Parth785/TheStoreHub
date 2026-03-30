import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { adminAPI } from '../../services/api'

const COLORS = ['#f59e0b', '#3b82f6', '#a78bfa', '#22c55e']

function StatCard({ label, value, sub, color = 'purple' }) {
  const colors = {
    purple: 'border-purple-500/20 bg-purple-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
  }

  return (
    <motion.div
      className={`border rounded-2xl p-5 ${colors[color]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-medium text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </motion.div>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [orderStats, setOrderStats] = useState(null)
  const [productStats, setProductStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [dailyRevenue, setDailyRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const adminToken = localStorage.getItem('token')
    if (!adminToken) {
      navigate('/admin/login')
      return
    }
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    try {
      const [orderRes, productRes, userRes, revenueRes] = await Promise.all([
        adminAPI.getOrderStats(),
        adminAPI.getProductStats(),
        adminAPI.getUserStats(),
        adminAPI.getDailyRevenue(7),
      ])
      setOrderStats(orderRes.data)
      setProductStats(productRes.data)
      setUserStats(userRes.data)
      setDailyRevenue(revenueRes.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      if (err.response?.status === 401) {
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  const pieData = orderStats ? [
    { name: 'Pending', value: orderStats.pendingOrders || 0 },
    { name: 'Processing', value: orderStats.processingOrders || 0 },
    { name: 'Shipped', value: orderStats.shippedOrders || 0 },
    { name: 'Delivered', value: orderStats.deliveredOrders || 0 },
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Admin Navbar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-6">
          <span className="text-xl font-medium">
            Store<span className="text-purple-400">Hub</span>
            <span className="text-xs text-white/30 ml-2 font-normal">Admin</span>
          </span>
          {['dashboard', 'orders', 'products', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-white/40 hover:text-white transition-colors">
            ← Store
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm border border-white/10 hover:border-red-400/50 hover:text-red-400 text-white/50 px-4 py-2 rounded-full transition-all">
            Sign out
          </button>
        </div>
      </nav>

      <div className="pt-24 px-4 md:px-8 pb-16 max-w-7xl mx-auto">

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <div>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">Overview</p>
              <h1 className="text-4xl font-medium">Dashboard</h1>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Revenue"
                value={`$${orderStats?.totalRevenue?.toLocaleString() || 0}`}
                sub={`$${orderStats?.todayRevenue?.toFixed(2) || 0} today`}
                color="green"
              />
              <StatCard
                label="Total Orders"
                value={orderStats?.totalOrders || 0}
                sub={`${orderStats?.todayOrders || 0} today`}
                color="purple"
              />
              <StatCard
                label="Total Products"
                value={productStats?.totalProducts || 0}
                sub={`${productStats?.lowStockProducts || 0} low stock`}
                color="blue"
              />
              <StatCard
                label="Total Users"
                value={userStats?.totalUsers || 0}
                sub={`${userStats?.todayUsers || 0} new today`}
                color="yellow"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Revenue bar chart */}
              <motion.div
                className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-6">
                  Revenue — last 7 days
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      formatter={v => [`$${v}`, 'Revenue']}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#7c3aed"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Order status pie chart */}
              <motion.div
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-6">
                  Order status
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

            </div>

            {/* Low stock alert */}
            {productStats?.lowStockProducts > 0 && (
              <motion.div
                className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-xl">⚠</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      Low stock alert
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {productStats.lowStockProducts} products have less than 10 units remaining
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="ml-auto text-xs border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-500/10 transition-all">
                    View products
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <AdminOrders />
        )}

        {/* Products tab */}
        {activeTab === 'products' && (
          <AdminProducts />
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <AdminUsers />
        )}

      </div>
    </div>
  )
}

// placeholder components for other tabs
function AdminOrders() {
  return (
    <div className="pt-4">
      <h1 className="text-4xl font-medium mb-8">Orders</h1>
      <p className="text-white/30">Coming soon — order management</p>
    </div>
  )
}

function AdminProducts() {
  return (
    <div className="pt-4">
      <h1 className="text-4xl font-medium mb-8">Products</h1>
      <p className="text-white/30">Coming soon — product management</p>
    </div>
  )
}

function AdminUsers() {
  return (
    <div className="pt-4">
      <h1 className="text-4xl font-medium mb-8">Users</h1>
      <p className="text-white/30">Coming soon — user management</p>
    </div>
  )
}

export default AdminDashboard