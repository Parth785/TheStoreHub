import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'

const CATEGORIES = [
  'Laptops', 'Smartphones', 'Tablets', 'Mobile Accessories',
  'Laptop Accessories', 'Mens Watches', 'Womens Watches'
]

function CategoryRow({ category }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const addItem = useCartStore(state => state.addItem)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    productAPI.getByCategory(category, 0, 8)
      .then(res => {
        setProducts(res.data.content || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      })
    }
  }

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    addItem(product)
  }

  if (loading) {
    return (
      <div className="mb-12">
        <div className="h-6 w-32 bg-white/5 rounded-lg mb-4 animate-pulse" />
        <div className="flex gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="min-w-[200px] h-64 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>

      {/* Category header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-white">{category}</h2>
        <button
          onClick={() => navigate(`/products/category/${category}`)}
          className="text-purple-400 text-sm hover:text-purple-300 transition-colors flex items-center gap-1">
          See all →
        </button>
      </div>

      {/* Horizontal scroll with arrows */}
      <div className="relative group">

        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all opacity-0 group-hover:opacity-100">
          ←
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[200px] max-w-[200px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer flex-shrink-0 group/card"
              onClick={() => navigate(`/products/${product.id}`)}>

              <div className="h-36 overflow-hidden bg-white/3 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 group-hover/card:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="absolute inset-0 items-center justify-center text-4xl hidden">
                  📦
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-xs font-medium text-white mb-1 truncate">{product.name}</h3>
                <p className="text-purple-400 text-xs mb-2">${product.price?.toLocaleString()}</p>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full border border-white/10 hover:border-purple-400 hover:bg-purple-500/10 text-white/60 hover:text-white text-xs py-1.5 rounded-xl transition-all">
                  Add to cart
                </button>
              </div>
            </div>
          ))}

          {/* See all card */}
          <div
            className="min-w-[120px] max-w-[120px] bg-white/3 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400/50 transition-all flex-shrink-0 gap-2"
            onClick={() => navigate(`/products/category/${category}`)}>
            <span className="text-2xl">→</span>
            <p className="text-xs text-white/40 text-center">See all {category}</p>
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all opacity-0 group-hover:opacity-100">
          →
        </button>

      </div>
    </motion.div>
  )
}

function Explore() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState(CATEGORIES)
  const [search, setSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (!search.trim()) {
      setShowSearch(false)
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const res = await productAPI.search(search, 0, 20)
        setSearchResults(res.data.content || [])
        setShowSearch(true)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">Discover</p>
          <h1 className="text-4xl md:text-5xl font-medium">Explore</h1>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <div className="relative max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">⌕</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 pl-10 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
            />
            {searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Search results */}
        {showSearch ? (
          <div>
            <p className="text-sm text-white/40 mb-6">
              {searchResults.length} results for "{search}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="h-48 overflow-hidden bg-white/3 relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-white/30 mb-1">{product.category}</p>
                    <h3 className="text-sm font-medium text-white mb-1">{product.name}</h3>
                    <p className="text-purple-400 text-sm">${product.price?.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-20 text-white/30">
                <p className="text-4xl mb-4">⊘</p>
                <p className="text-sm">No products found for "{search}"</p>
              </div>
            )}
          </div>
        ) : (
          // Category rows
          <div>
            {categories.map(category => (
              <CategoryRow key={category} category={category} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Explore