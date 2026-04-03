import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { paymentAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'

function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearCart = useCartStore(state => state.clearCart)

  // orderId and amount passed from cart via navigation state
  const { orderId, amount } = location.state || {}

  const [step, setStep] = useState('form') // form | processing | success | failed
  const [toast, setToast] = useState('')
  const [transactionId, setTransactionId] = useState('')

  const [form, setForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!orderId) {
      navigate('/cart')
    }
  }, [orderId])

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
  }

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2)
    }
    return cleaned
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let formatted = value

    if (name === 'cardNumber') formatted = formatCardNumber(value)
    if (name === 'expiry') formatted = formatExpiry(value)
    if (name === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 3)

    setForm({ ...form, [name]: formatted })
    setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.cardHolder.trim()) newErrors.cardHolder = 'Name required'
    if (form.cardNumber.replace(/\s/g, '').length !== 16) newErrors.cardNumber = 'Invalid card number'
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) newErrors.expiry = 'Invalid expiry'
    if (form.cvv.length !== 3) newErrors.cvv = 'Invalid CVV'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStep('processing')

    try {
      const res = await paymentAPI.processPayment(orderId, {
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        expiry: form.expiry,
        cvv: form.cvv,
        cardHolder: form.cardHolder,
      })

      if (res.data.success) {
        setTransactionId(res.data.transactionId)
        clearCart()
        setStep('success')
      } else {
        setStep('failed')
      }
    } catch {
      setStep('failed')
    }
  }

  // get card type from number
  const getCardType = () => {
    const num = form.cardNumber.replace(/\s/g, '')
    if (num.startsWith('4')) return 'VISA'
    if (num.startsWith('5')) return 'MC'
    if (num.startsWith('3')) return 'AMEX'
    return ''
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">

        {/* Payment form */}
        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>

            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">
                Secure Payment
              </p>
              <h1 className="text-3xl font-medium">
                Store<span className="text-purple-400">Hub</span>
              </h1>
              <p className="text-white/30 text-sm mt-2">
                Order #{orderId} · ${amount?.toLocaleString()}
              </p>
            </div>

            {/* Card preview */}
            <motion.div
              className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl p-6 mb-6 relative overflow-hidden"
              style={{ aspectRatio: '1.6' }}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 bg-yellow-400/80 rounded-md" />
                  {getCardType() && (
                    <span className="text-white/70 text-sm font-medium tracking-wider">
                      {getCardType()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1 tracking-widest">CARD NUMBER</p>
                  <p className="text-white text-lg font-mono tracking-widest">
                    {form.cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-white/40 text-xs mb-1 tracking-widest">CARD HOLDER</p>
                    <p className="text-white text-sm font-medium">
                      {form.cardHolder || 'YOUR NAME'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1 tracking-widest">EXPIRES</p>
                    <p className="text-white text-sm font-medium">
                      {form.expiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div>
                  <label className="text-white/40 text-xs mb-1 block">Card holder name</label>
                  <input
                    name="cardHolder"
                    type="text"
                    placeholder="John Doe"
                    value={form.cardHolder}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20 ${
                      errors.cardHolder ? 'border-red-400' : 'border-white/10 focus:border-purple-400'
                    }`}
                  />
                  {errors.cardHolder && (
                    <p className="text-red-400 text-xs mt-1">{errors.cardHolder}</p>
                  )}
                </div>

                <div>
                  <label className="text-white/40 text-xs mb-1 block">Card number</label>
                  <input
                    name="cardNumber"
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={form.cardNumber}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20 font-mono tracking-wider ${
                      errors.cardNumber ? 'border-red-400' : 'border-white/10 focus:border-purple-400'
                    }`}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Expiry date</label>
                    <input
                      name="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20 ${
                        errors.expiry ? 'border-red-400' : 'border-white/10 focus:border-purple-400'
                      }`}
                    />
                    {errors.expiry && (
                      <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">CVV</label>
                    <input
                      name="cvv"
                      type="password"
                      placeholder="•••"
                      value={form.cvv}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20 ${
                        errors.cvv ? 'border-red-400' : 'border-white/10 focus:border-purple-400'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] mt-2">
                  Pay ${amount?.toLocaleString()}
                </button>

                <p className="text-center text-white/20 text-xs flex items-center justify-center gap-2">
                  <span>🔒</span>
                  Secured with 256-bit encryption
                </p>

              </form>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="w-full text-white/30 hover:text-white text-sm transition-colors mt-4 text-center">
              ← Back to cart
            </button>

          </motion.div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-medium mb-2">Processing payment</h2>
            <p className="text-white/30 text-sm">Please wait, do not close this page</p>
          </motion.div>
        )}

        {/* Success */}
        {step === 'success' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}>

            {/* Success icon */}
            <motion.div
              className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}>
              <span className="text-green-400 text-3xl">✓</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}>
              <h2 className="text-3xl font-medium mb-2">Payment successful!</h2>
              <p className="text-white/40 text-sm mb-6">
                Your order has been confirmed and is being processed
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/40">Order ID</span>
                  <span className="text-white font-medium">#{orderId}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/40">Amount paid</span>
                  <span className="text-green-400 font-medium">${amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Transaction ID</span>
                  <span className="text-white/60 text-xs font-mono">{transactionId}</span>
                </div>
              </div>

              <p className="text-white/30 text-xs mb-8">
                A confirmation email has been sent to your inbox
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all">
                  View my orders
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full border border-white/10 hover:border-white/30 text-white/50 hover:text-white py-3 rounded-xl text-sm transition-all">
                  Continue shopping
                </button>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* Failed */}
        {step === 'failed' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>

            <motion.div
              className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}>
              <span className="text-red-400 text-3xl">✕</span>
            </motion.div>

            <h2 className="text-3xl font-medium mb-2">Payment failed</h2>
            <p className="text-white/40 text-sm mb-8">
              Something went wrong with your payment. Please try again.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('form')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all">
                Try again
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="w-full border border-white/10 hover:border-white/30 text-white/50 hover:text-white py-3 rounded-xl text-sm transition-all">
                Back to cart
              </button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  )
}

export default Payment