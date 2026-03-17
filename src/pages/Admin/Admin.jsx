import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI, orderAPI } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'MacBook Pro 16', price: 2499, category: 'Laptops', stock: 10 },
  { id: 2, name: 'iPhone 15 Pro', price: 1199, category: 'Phones', stock: 15 },
  { id: 3, name: 'Sony WH-1000XM5', price: 349, category: 'Audio', stock: 20 },
  { id: 4, name: 'Apple Watch Ultra', price: 799, category: 'Wearables', stock: 8 },
  { id: 5, name: 'iPad Pro M2', price: 1099, category: 'Tablets', stock: 12 },
  { id: 6, name: 'AirPods Pro', price: 249, category: 'Audio', stock: 25 },
]

const SAMPLE_ORDERS = [
  { id: 1, userId: 1, status: 'DELIVERED', totalPrice: 2499, createdAt: '2026-03-10T10:30:00' },
  { id: 2, userId: 2, status: 'SHIPPED', totalPrice: 1548, createdAt: '2026-03-14T14:20:00' },
  { id: 3, userId: 3, status: 'PENDING', totalPrice: 349, createdAt: '2026-03-17T09:00:00' },
  { id: 4, userId: 1, status: 'PROCESSING', totalPrice: 799, createdAt: '2026-03-16T11:00:00' },
]

const STATUS_COLORS = {
  PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  PROCESSING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  SHIPPED: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  DELIVERED: 'text-green-400 bg-green-400/10 border-green-400/20',
}

const ALL_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function Admin() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [orders, setOrders] = useState(SAMPLE_ORDERS)
  const [toast, setToast] = useState('')

  // add product form
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: '', stock: '', description: ''
  })

  useEffect(() => {
    productAPI.getAll()
      .then(res => setProducts(res.data))
      .catch(() => setProducts(SAMPLE_PRODUCTS))

    orderAPI.getMyOrders()
      .then(res => setOrders(res.data))
      .catch(() => setOrders(SAMPLE_ORDERS))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return

    productAPI.create ? productAPI.create(newProduct)
      .then(res => {
        setProducts([...products, res.data])
        setShowAddProduct(false)
        setNewProduct({ name: '', price: '', category: '', stock: '', description: '' })
        showToast('Product added successfully')
      })
      .catch(() => {
        // fallback — add locally
        const fake = { ...newProduct, id: products.length + 1, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }
        setProducts([...products, fake])
        setShowAddProduct(false)
        setNewProduct({ name: '', price: '', category: '', stock: '', description: '' })
        showToast('Product added successfully')
      }) : null
  }

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id))
    showToast('Product removed')
  }

  const handleStatusChange = (orderId, newStatus) => {
    orderAPI.updateStatus(orderId, newStatus)
      .then(() => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        showToast('Order status updated')
      })
      .catch(() => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        showToast('Order status updated')
      })
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">Admin</p>
          <h1 className="text-4xl md:text-5xl font-medium">Dashboard</h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          {[
            { label: 'Total products', value: products.length },
            { label: 'Total orders', value: orders.length },
            { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}` },
            { label: 'Pending orders', value: orders.filter(o => o.status === 'PENDING').length },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-2xl font-medium text-white">{stat.value}</p>
              <p className="text-xs text-white/30 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['dashboard', 'products', 'orders'].map(tab => (
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
        </div>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>

            {/* Recent orders */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">
                Recent orders
              </h3>
              <div className="flex flex-col gap-3">
                {orders.slice(0, 4).map(order => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Order #{order.id}</p>
                      <p className="text-xs text-white/30">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low stock */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">
                Low stock alert
              </h3>
              <div className="flex flex-col gap-3">
                {products
                  .filter(p => p.stock < 15)
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <p className="text-sm text-white">{product.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        product.stock < 10
                          ? 'text-red-400 bg-red-400/10 border-red-400/20'
                          : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                      }`}>
                        {product.stock} left
                      </span>
                    </div>
                  ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* Products tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>

            {/* Add product button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-full text-sm transition-all">
                {showAddProduct ? 'Cancel' : '+ Add product'}
              </button>
            </div>

            {/* Add product form */}
            {showAddProduct && (
              <motion.div
                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-sm font-medium mb-4 text-white/50 uppercase tracking-widest">
                  New product
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', placeholder: 'Product name', type: 'text' },
                    { key: 'price', placeholder: 'Price (e.g. 999)', type: 'number' },
                    { key: 'category', placeholder: 'Category', type: 'text' },
                    { key: 'stock', placeholder: 'Stock quantity', type: 'number' },
                  ].map(field => (
                    <input
                      key={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={newProduct[field.key]}
                      onChange={e => setNewProduct({ ...newProduct, [field.key]: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                    />
                  ))}
                  <input
                    type="text"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl text-sm transition-all">
                  Add product
                </button>
              </motion.div>
            )}

            {/* Products table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 px-5 py-3 border-b border-white/10 text-xs text-white/30 uppercase tracking-widest">
                <span className="col-span-2">Product</span>
                <span>Category</span>
                <span>Stock</span>
                <span>Price</span>
              </div>
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="grid grid-cols-5 px-5 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/3 transition-colors">
                  <span className="col-span-2 text-sm text-white">{product.name}</span>
                  <span className="text-sm text-white/50">{product.category}</span>
                  <span className={`text-sm ${product.stock < 10 ? 'text-red-400' : 'text-white/50'}`}>
                    {product.stock}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-400">${product.price}</span>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-white/20 hover:text-red-400 transition-colors text-xs ml-2">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 px-5 py-3 border-b border-white/10 text-xs text-white/30 uppercase tracking-widest">
                <span>Order</span>
                <span>User</span>
                <span>Date</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {orders.map(order => (
                <div
                  key={order.id}
                  className="grid grid-cols-5 px-5 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/3 transition-colors">
                  <span className="text-sm text-white">#{order.id}</span>
                  <span className="text-sm text-white/50">User {order.userId}</span>
                  <span className="text-sm text-white/50">{formatDate(order.createdAt)}</span>
                  <span className="text-sm text-purple-400">${order.totalPrice}</span>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer hover:border-purple-400 transition-colors">
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

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

export default Admin