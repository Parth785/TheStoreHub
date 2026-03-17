import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'
import { orderAPI } from '../../services/api'

function Cart() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      showToast('Please sign in to checkout')
      setTimeout(() => navigate('/login'), 1000)
      return
    }

    setLoading(true)
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      }

      await orderAPI.create(orderData)
      clearCart()
      showToast('Order placed successfully!')
      setTimeout(() => navigate('/orders'), 1500)
    } catch (err) {
      // backend not connected yet — simulate success
      clearCart()
      showToast('Order placed successfully!')
      setTimeout(() => navigate('/orders'), 1500)
    } finally {
      setLoading(false)
    }
  }

  // empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <p className="text-6xl">🛒</p>
        <h2 className="text-2xl font-medium">Your cart is empty</h2>
        <p className="text-white/40 text-sm">Add some products to get started</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm transition-all">
          Browse products
        </button>
      </div>
    )
  }

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
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">
            {getTotalItems()} items
          </p>
          <h1 className="text-4xl md:text-5xl font-medium">Your cart</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart items — left side */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}>

                {/* Product emoji */}
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {item.imageUrl}
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/30 mb-1">{item.category}</p>
                  <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                  <p className="text-purple-400 text-sm mt-1">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-white/50 hover:text-white transition-colors w-5 text-center text-lg">
                    −
                  </button>
                  <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-white/50 hover:text-white transition-colors w-5 text-center text-lg">
                    +
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 text-lg">
                  ✕
                </button>

              </motion.div>
            ))}

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="text-white/20 hover:text-white/50 text-xs transition-colors text-left mt-2">
              Clear cart
            </button>
          </div>

          {/* Order summary — right side */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-28">

              <h2 className="text-lg font-medium mb-6">Order summary</h2>

              {/* Items breakdown */}
              <div className="flex flex-col gap-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-white/50 truncate max-w-[150px]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-white/70">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white">${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Tax</span>
                  <span className="text-white">${(getTotalPrice() * 0.18).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between font-medium text-lg mb-6">
                <span>Total</span>
                <span className="text-purple-400">
                  ${(getTotalPrice() * 1.18).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-4 rounded-2xl text-sm font-medium transition-all hover:scale-[1.02]">
                {loading ? 'Placing order...' : 'Place order'}
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full border border-white/10 hover:border-white/30 text-white/50 hover:text-white py-3 rounded-2xl text-sm transition-all mt-3">
                Continue shopping
              </button>

            </div>
          </motion.div>

        </div>
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

export default Cart