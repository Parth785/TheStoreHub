import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'

function CategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const addItem = useCartStore(state => state.addItem)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [toast, setToast] = useState('')
  const pageRef = useRef(0)
  const loadingRef = useRef(false)

  const loadProducts = async (pageNum, reset = false) => {
    if (loadingRef.current) return
    loadingRef.current = true

    try {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)

      const res = await productAPI.getByCategory(category, pageNum, 12)
      const data = res.data
      const newProducts = data.content || []

      if (reset) {
        setProducts(newProducts)
      } else {
        setProducts(prev => [...prev, ...newProducts])
      }

      setHasMore(pageNum < data.totalPages - 1)

    } catch (err) {
      console.error('Failed:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      loadingRef.current = false
    }
  }

  useEffect(() => {
    pageRef.current = 0
    loadProducts(0, true)
  }, [category])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (
        scrollTop + windowHeight >= documentHeight - 300 &&
        hasMore &&
        !loadingRef.current
      ) {
        pageRef.current += 1
        loadProducts(pageRef.current)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, category])

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      showToast('Please sign in to add items to cart')
      setTimeout(() => navigate('/login'), 1000)
      return
    }
    addItem(product)
    showToast(`${product.name} added to cart`)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-10 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <button
            onClick={() => navigate('/products')}
            className="text-white/40 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <div>
            <p className="text-xs tracking-[4px] text-white/30 uppercase mb-1">Category</p>
            <h1 className="text-4xl md:text-5xl font-medium">{category}</h1>
          </div>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
              onClick={() => navigate(`/products/${product.id}`)}>

              <div className="h-48 overflow-hidden bg-white/3 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="absolute inset-0 items-center justify-center text-5xl hidden">
                  📦
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-white/30 mb-1">{product.category}</p>
                <h3 className="text-sm font-medium text-white mb-1">{product.name}</h3>
                <p className="text-purple-400 text-sm mb-4">${product.price?.toLocaleString()}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(product)
                  }}
                  className="w-full border border-white/10 hover:border-purple-400 hover:bg-purple-500/10 text-white/70 hover:text-white text-xs py-2 rounded-xl transition-all">
                  Add to cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20 text-white/30">
            <p className="text-4xl mb-4">⊘</p>
            <p className="text-sm">No products in this category</p>
          </div>
        )}

        {/* Loading more */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* All loaded */}
        {!hasMore && products.length > 0 && (
          <p className="text-center text-white/20 text-xs tracking-widest uppercase py-8">
            All {category} products loaded
          </p>
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

export default CategoryPage