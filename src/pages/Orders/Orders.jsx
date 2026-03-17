import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { orderAPI } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

// Sample orders to show when backend is not connected
const SAMPLE_ORDERS = [
  {
    id: 1,
    createdAt: '2026-03-10T10:30:00',
    status: 'DELIVERED',
    totalPrice: 2499,
    items: [
      { productId: 1, name: 'MacBook Pro 16', quantity: 1, price: 2499 }
    ]
  },
  {
    id: 2,
    createdAt: '2026-03-14T14:20:00',
    status: 'SHIPPED',
    totalPrice: 1548,
    items: [
      { productId: 2, name: 'iPhone 15 Pro', quantity: 1, price: 1199 },
      { productId: 6, name: 'AirPods Pro', quantity: 1, price: 349 }
    ]
  },
  {
    id: 3,
    createdAt: '2026-03-17T09:00:00',
    status: 'PENDING',
    totalPrice: 349,
    items: [
      { productId: 3, name: 'Sony WH-1000XM5', quantity: 1, price: 349 }
    ]
  },
]

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const STATUS_COLORS = {
  PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  PROCESSING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  SHIPPED: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  DELIVERED: 'text-green-400 bg-green-400/10 border-green-400/20',
}

function StatusTracker({ status }) {
  const currentStep = STATUS_STEPS.indexOf(status)

  return (
    <div className="flex items-center gap-0 mt-4">
      {STATUS_STEPS.map((step, index) => (
        <div key={step} className="flex items-center flex-1">

          {/* Circle */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 border transition-all ${
            index <= currentStep
              ? 'bg-purple-500 border-purple-500 text-white'
              : 'bg-white/5 border-white/10 text-white/20'
          }`}>
            {index < currentStep ? '✓' : index + 1}
          </div>

          {/* Line */}
          {index < STATUS_STEPS.length - 1 && (
            <div className={`h-[1px] flex-1 transition-all ${
              index < currentStep ? 'bg-purple-500' : 'bg-white/10'
            }`} />
          )}

        </div>
      ))}
    </div>
  )
}

function Orders() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    orderAPI.getMyOrders()
      .then(res => {
        setOrders(res.data)
        setLoading(false)
      })
      .catch(() => {
        setOrders(SAMPLE_ORDERS)
        setLoading(false)
      })
  }, [isLoggedIn])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <p className="text-6xl">📦</p>
        <h2 className="text-2xl font-medium">No orders yet</h2>
        <p className="text-white/40 text-sm">Your order history will appear here</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm transition-all">
          Start shopping
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">
            {orders.length} orders
          </p>
          <h1 className="text-4xl md:text-5xl font-medium">Order history</h1>
        </motion.div>

        {/* Orders list */}
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}>

              {/* Order header */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/3 transition-colors"
                onClick={() => setExpandedOrder(
                  expandedOrder === order.id ? null : order.id
                )}>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      Order #{order.id}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-white/30">
                    {formatDate(order.createdAt)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-purple-400 font-medium">
                    ${order.totalPrice.toLocaleString()}
                  </span>
                  <span className={`text-white/30 text-sm transition-transform duration-200 ${
                    expandedOrder === order.id ? 'rotate-180' : ''
                  }`}>
                    ↓
                  </span>
                </div>

              </div>

              {/* Expanded order details */}
              {expandedOrder === order.id && (
                <motion.div
                  className="border-t border-white/10 p-5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}>

                  {/* Status tracker */}
                  <div className="mb-6">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                      Order status
                    </p>
                    <StatusTracker status={order.status} />
                    <div className="flex justify-between mt-2">
                      {STATUS_STEPS.map(step => (
                        <span key={step} className="text-xs text-white/20 flex-1 text-center">
                          {step.charAt(0) + step.slice(1).toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                      Items
                    </p>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                          <span className="text-white/70">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-white/50">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                    <span className="text-sm text-white/50">Total</span>
                    <span className="text-purple-400 font-medium">
                      ${order.totalPrice.toLocaleString()}
                    </span>
                  </div>

                </motion.div>
              )}

            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Orders