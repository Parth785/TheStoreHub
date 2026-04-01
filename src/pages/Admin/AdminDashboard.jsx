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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [toast, setToast] = useState('')

  const STATUS_COLORS = {
    PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    PROCESSING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    SHIPPED: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    DELIVERED: 'text-green-400 bg-green-400/10 border-green-400/20',
  }

  const ALL_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

  useEffect(() => {
    fetchOrders(page)
  }, [page])

  const fetchOrders = async (pageNum) => {
    try {
      setLoading(true)
      const res = await adminAPI.getAllOrders(pageNum, 20)
      setOrders(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(o =>
        o.orderId === orderId ? { ...o, status: newStatus } : o
      ))
      showToast('Order status updated')
    } catch {
      showToast('Failed to update status')
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-4">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">Management</p>
        <h1 className="text-4xl font-medium">Orders</h1>
      </motion.div>

      {/* Orders table */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>

        {/* Table header */}
        <div className="grid grid-cols-6 px-6 py-3 border-b border-white/10 text-xs text-white/30 uppercase tracking-widest">
          <span>Order</span>
          <span>User</span>
          <span>Date</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {/* Table rows */}
        {orders.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order.orderId}
              className="grid grid-cols-6 px-6 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/3 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}>

              <span className="text-sm font-medium text-white">
                #{order.orderId}
              </span>

              <span className="text-sm text-white/50">
                User #{order.userId}
              </span>

              <span className="text-sm text-white/50">
                {formatDate(order.createdAt)}
              </span>

              <span className="text-sm text-white/50">
                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
              </span>

              <span className="text-sm text-purple-400 font-medium">
                ${order.totalPrice?.toLocaleString()}
              </span>

              <select
                value={order.status}
                onChange={e => handleStatusChange(order.orderId, e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all bg-black ${STATUS_COLORS[order.status]}`}>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s} className="bg-black text-white">
                    {s}
                  </option>
                ))}
              </select>

            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-white/10 rounded-xl text-sm text-white/50 hover:border-white/30 hover:text-white disabled:opacity-30 transition-all">
            ← Prev
          </button>
          <span className="text-sm text-white/30 px-4">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 border border-white/10 rounded-xl text-sm text-white/50 hover:border-white/30 hover:text-white disabled:opacity-30 transition-all">
            Next →
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          {toast}
        </motion.div>
      )}
    </div>
  )
}

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    name: '', price: '', stock: '', category: '', description: '', imageUrl: '', modelUrl: ''
  })

  useEffect(() => {
    fetchProducts(page)
  }, [page])

  const fetchProducts = async (pageNum) => {
    try {
      setLoading(true)
      const res = await adminAPI.getAllProducts(pageNum, 20)
      setProducts(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
    } catch (err) {
      console.error('Failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, {
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock)
        })
        showToast('Product updated successfully')
      } else {
        await adminAPI.createProduct({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock)
        })
        showToast('Product added successfully')
      }
      resetForm()
      fetchProducts(page)
    } catch {
      showToast('Failed to save product')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      modelUrl: product.modelUrl || ''
    })
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await adminAPI.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
      showToast('Product deleted')
    } catch {
      showToast('Failed to delete product')
    }
  }

  const resetForm = () => {
    setForm({ name: '', price: '', stock: '', category: '', description: '', imageUrl: '', modelUrl: '' })
    setShowAddForm(false)
    setEditingProduct(null)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-4">
      <motion.div
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">Management</p>
          <h1 className="text-4xl font-medium">Products</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(!showAddForm) }}
          className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm transition-all">
          {showAddForm ? 'Cancel' : '+ Add product'}
        </button>
      </motion.div>

      {/* Add / Edit form */}
      {showAddForm && (
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-6">
            {editingProduct ? 'Edit product' : 'New product'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { key: 'name', label: 'Product name', type: 'text', placeholder: 'MacBook Pro 16' },
                { key: 'price', label: 'Price', type: 'number', placeholder: '999' },
                { key: 'stock', label: 'Stock quantity', type: 'number', placeholder: '50' },
                { key: 'category', label: 'Category', type: 'text', placeholder: 'Laptops' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-white/40 text-xs mb-1 block">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-white/40 text-xs mb-1 block">Description</label>
                <input
                  type="text"
                  placeholder="Product description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">
                  3D Model URL <span className="text-white/20">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="/models/product.glb"
                  value={form.modelUrl}
                  onChange={e => setForm({ ...form, modelUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
                {editingProduct ? 'Save changes' : 'Add product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-white/10 hover:border-white/30 text-white/50 hover:text-white px-6 py-2.5 rounded-xl text-sm transition-all">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Products table */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>

        <div className="grid grid-cols-6 px-6 py-3 border-b border-white/10 text-xs text-white/30 uppercase tracking-widest">
          <span className="col-span-2">Product</span>
          <span>Category</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Actions</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          products.map((product, index) => (
            <motion.div
              key={product.id}
              className="grid grid-cols-6 px-6 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/3 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}>

              <div className="col-span-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <span className="text-sm text-white truncate">{product.name}</span>
              </div>

              <span className="text-sm text-white/50">{product.category}</span>

              <span className={`text-sm font-medium ${
                product.stock === 0
                  ? 'text-red-400'
                  : product.stock < 10
                  ? 'text-yellow-400'
                  : 'text-white/50'
              }`}>
                {product.stock}
              </span>

              <span className="text-sm text-purple-400">
                ${product.price?.toLocaleString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-xs border border-white/10 hover:border-purple-400 hover:text-purple-400 text-white/40 px-3 py-1.5 rounded-lg transition-all">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-xs border border-white/10 hover:border-red-400 hover:text-red-400 text-white/40 px-3 py-1.5 rounded-lg transition-all">
                  Delete
                </button>
              </div>

            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-white/10 rounded-xl text-sm text-white/50 hover:border-white/30 hover:text-white disabled:opacity-30 transition-all">
            ← Prev
          </button>
          <span className="text-sm text-white/30 px-4">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 border border-white/10 rounded-xl text-sm text-white/50 hover:border-white/30 hover:text-white disabled:opacity-30 transition-all">
            Next →
          </button>
        </div>
      )}

      {toast && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          {toast}
        </motion.div>
      )}
    </div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getAllUsers()
      setUsers(res.data)
    } catch (err) {
      console.error('Failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-4">
      <motion.div
        className="mb-8 flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">Management</p>
          <h1 className="text-4xl font-medium">Users</h1>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">⌕</span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20 w-64"
          />
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total users', value: users.length },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length },
          { label: 'Regular users', value: users.filter(u => u.role !== 'ADMIN').length },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-medium text-white">{stat.value}</p>
            <p className="text-xs text-white/30 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>

        <div className="grid grid-cols-5 px-6 py-3 border-b border-white/10 text-xs text-white/30 uppercase tracking-widest">
          <span className="col-span-2">User</span>
          <span>Email</span>
          <span>Joined</span>
          <span>Role</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              className="grid grid-cols-5 px-6 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/3 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}>

              {/* Avatar + name */}
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-medium text-purple-400 flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <span className="text-sm text-white truncate">{user.name}</span>
              </div>

              <span className="text-sm text-white/50 truncate">
                {user.email}
              </span>

              <span className="text-sm text-white/50">
                {formatDate(user.createdAt)}
              </span>

              <span className={`text-xs px-2 py-1 rounded-full border w-fit ${
                user.role === 'ADMIN'
                  ? 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                  : 'text-white/40 bg-white/5 border-white/10'
              }`}>
                {user.role || 'USER'}
              </span>

            </motion.div>
          ))
        )}
      </motion.div>

      {toast && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          {toast}
        </motion.div>
      )}
    </div>
  )
}

export default AdminDashboard