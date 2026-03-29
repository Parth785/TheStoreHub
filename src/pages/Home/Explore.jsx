import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'

function getCategoryEmoji(category) {
  const map = {
    'laptops': '💻',
    'phones': '📱',
    'smartphones': '📱',
    'tablets': '📟',
    'audio': '🎧',
    'mobile-accessories': '🔌',
    'laptop-accessories': '🖱️',
    'mens-watches': '⌚',
    'womens-watches': '💍',
    'beauty': '💄',
    'fragrances': '🌸',
    'furniture': '🪑',
    'groceries': '🛒',
    'home-decoration': '🏠',
    'kitchen-accessories': '🍳',
    'mens-shirts': '👔',
    'mens-shoes': '👟',
    'books': '📚',
    'collectibles': '🏆',
  }
  return map[category.toLowerCase()] || '📦'
}

function CardSkeleton() {
  return (
    <div className="min-w-[160px] max-w-[160px] bg-white/3 border border-white/5 rounded-2xl overflow-hidden flex-shrink-0 animate-pulse">
      <div className="h-32 bg-white/5" />
      <div className="p-3">
        <div className="h-3 bg-white/5 rounded mb-2" />
        <div className="h-3 bg-white/5 rounded w-2/3 mb-3" />
        <div className="h-6 bg-white/5 rounded-xl" />
      </div>
    </div>
  )
}

function CategoryRow({ category, emoji }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const addItem = useCartStore(state => state.addItem)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)


  useEffect(() => {
  productAPI.getByCategory(category, 0, 10)
    .then(res => {
      setProducts(res.data.content || [])
      setTotalProducts(res.data.totalElements || 0)
      setLoading(false)
    })
    .catch(() => setLoading(false))
}, [category])

  // check scroll state after products load
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current
      setCanScrollRight(scrollWidth > clientWidth)
    }
  }, [loading, products])

  const updateScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -400 : 400,
      behavior: 'smooth'
    })
    setTimeout(updateScrollButtons, 400)
  }

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    addItem(product)
    setToast(`${product.name} added`)
    setTimeout(() => setToast(''), 2000)
  }

  if (!loading && products.length === 0) return null

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>

      {/* Category header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <h2 className="text-base font-medium text-white">{category}</h2>
          {!loading && (
            <span className="text-xs text-white/20 ml-1">
              {products.length}+ items
            </span>
          )}
        </div>
        <button
          onClick={() => navigate(`/products/category/${category}`)}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-purple-400 transition-colors group">
          See all
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="relative">

        {/* Left scroll arrow — only when scrolled right */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 flex items-center">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white text-xs transition-all ml-1">
              ←
            </button>
          </div>
        )}

        {/* Right scroll arrow — only when more content exists */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 flex items-center justify-end">
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white text-xs transition-all mr-1">
              →
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

          {loading ? (
            Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[160px] max-w-[160px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/40 transition-all cursor-pointer flex-shrink-0 group"
                  onClick={() => navigate(`/products/${product.id}`)}>

                  <div className="h-32 overflow-hidden bg-white/3 relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="absolute inset-0 items-center justify-center text-3xl hidden">
                      📦
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-xs font-medium text-white mb-1 truncate leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-purple-400 text-xs font-medium mb-2">
                      ${product.price?.toLocaleString()}
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full border border-white/10 hover:border-purple-400 hover:bg-purple-500/10 text-white/50 hover:text-white text-xs py-1.5 rounded-xl transition-all">
                      + Add
                    </button>
                  </div>
                </div>
              ))}

              {/* View all card — only show if more than 5 products */}
              {/* View all card — only show if there are MORE products than loaded */}
              {totalProducts > products.length && (
                <div
                  className="min-w-[120px] max-w-[120px] border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400/50 hover:bg-purple-500/5 transition-all flex-shrink-0 gap-3 group"
                  onClick={() => navigate(`/products/category/${category}`)}>
                  <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-purple-400 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-all">
                    →
                  </div>
                  <p className="text-xs text-white/30 group-hover:text-white/50 text-center transition-colors px-2">
                    View all
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2.5 rounded-full text-xs font-medium z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>
          {toast}
        </motion.div>
      )}

    </motion.div>
  )
}

function Explore() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    productAPI.getCategories()
      .then(res => {
        setCategories(res.data)
        setCategoriesLoading(false)
      })
      .catch(() => setCategoriesLoading(false))
  }, [])

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

      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">
            The Store Hub
          </p>
          <h1 className="text-4xl md:text-5xl font-medium">
            What are you<br />looking for?
          </h1>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <div className="relative max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-base">⌕</span>
            <input
              type="text"
              placeholder="Search laptops, phones, accessories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 pl-10 py-3.5 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
            />
            {searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {search && !searchLoading && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors text-sm">
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Search results */}
        {showSearch ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-white/30 mb-6">
              {searchResults.length} results for
              <span className="text-white ml-1">"{search}"</span>
            </p>
            {searchResults.length === 0 && !searchLoading ? (
              <div className="text-center py-20 text-white/30">
                <p className="text-4xl mb-4">⊘</p>
                <p className="text-sm">No results for "{search}"</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-purple-400 text-sm hover:text-purple-300 transition-colors">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => navigate(`/products/${product.id}`)}>
                    <div className="h-36 overflow-hidden bg-white/3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-white/30 mb-1 truncate">{product.category}</p>
                      <h3 className="text-xs font-medium text-white mb-1 truncate">{product.name}</h3>
                      <p className="text-purple-400 text-xs">${product.price?.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div>
            {categoriesLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="mb-10">
                  <div className="h-5 w-32 bg-white/5 rounded-lg mb-4 animate-pulse" />
                  <div className="flex gap-3">
                    {Array(6).fill(0).map((_, j) => (
                      <div key={j} className="min-w-[160px] h-52 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <CategoryRow
                    category={category}
                    emoji={getCategoryEmoji(category)}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Explore