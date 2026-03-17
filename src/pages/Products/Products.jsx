import { useState, useEffect, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { productAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'

// Sample products to show when backend is not connected yet
const SAMPLE_PRODUCTS = [
    { 
        id: 1, 
        name: 'MacBook Pro 16', 
        price: 2499, 
        category: 'Laptops', 
        stock: 10, 
        description: 'The most powerful MacBook Pro ever.', 
        imageUrl: '💻',
        modelUrl: '/models/ps4-stik.glb'  // just for testing
    },
    { 
      id: 2, 
      name: 'iPhone 15 Pro', 
      price: 1199, 
      category: 'Phones', 
      stock: 15, 
      description: 'Titanium design meets A17 Pro chip...', 
      imageUrl: '📱',
      modelUrl: '/models/iphone.glb'  // ← add this
    },
    { 
      id: 3, 
      name: 'Sony WH-1000XM5', 
      price: 349, 
      category: 'Audio', 
      stock: 20, 
      description: 'Industry leading noise cancellation...', 
      imageUrl: '🎧',
      modelUrl: '/models/headphones.glb'
    },
    { 
      id: 4, 
      name: 'Apple Watch Ultra', 
      price: 799, 
      category: 'Wearables', 
      stock: 8, 
      description: 'The most rugged Apple Watch ever...', 
      imageUrl: '⌚',
      modelUrl: '/models/watch.glb'
    },
    { 
      id: 5, 
      name: 'iPad Pro M2', 
      price: 1099, 
      category: 'Tablets', 
      stock: 12, 
      description: 'Supercharged by M2 chip...', 
      imageUrl: '📟',
      modelUrl: '/models/tablet.glb'
    },
    { 
      id: 6, 
      name: 'AirPods Pro', 
      price: 249, 
      category: 'Audio', 
      stock: 25, 
      description: 'Active Noise Cancellation...', 
      imageUrl: '🎵',
      modelUrl: '/models/airpods.glb'
    },
  ]

const SUGGESTIONS = [
  { name: 'Samsung Galaxy S24', available: false },
  { name: 'Dell XPS 15', available: false },
  { name: 'MacBook Pro 16', available: true },
  { name: 'iPhone 15 Pro', available: true },
  { name: 'Google Pixel 8', available: false },
  { name: 'Sony WH-1000XM5', available: true },
]

function Products() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const addItem = useCartStore(state => state.addItem)

  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [unavailableProduct, setUnavailableProduct] = useState(null)
  const [toast, setToast] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Laptops', 'Phones', 'Audio', 'Wearables', 'Tablets']

  // fetch from backend when connected
  useEffect(() => {
    productAPI.getAll()
      .then(res => setProducts(res.data))
      .catch(() => setProducts(SAMPLE_PRODUCTS)) // fallback to sample
  }, [])

  // search suggestions with debounce
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const timeout = setTimeout(() => {
      const matched = SUGGESTIONS.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
      setSuggestions(matched)
      setShowSuggestions(true)
    }, 300) // wait 300ms after user stops typing

    return () => clearTimeout(timeout)
  }, [search])

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.name)
    setShowSuggestions(false)
    if (!suggestion.available) {
      setUnavailableProduct(suggestion.name)
    } else {
      setUnavailableProduct(null)
    }
  }

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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && (search ? matchesSearch : true)
  })

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      {/* Background orb */}
      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        className="max-w-6xl mx-auto mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">Our collection</p>
        <h1 className="text-4xl md:text-5xl font-medium">Explore products</h1>
      </motion.div>

      {/* Search bar */}
      <motion.div
        className="max-w-6xl mx-auto mb-8 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}>
        <div className="relative max-w-xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">⌕</span>
          <input
            type="text"
            placeholder="Search for anything..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => search && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full bg-white/5 border border-white/10 rounded-full px-5 pl-10 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-20">
              {suggestions.map((s) => (
                <div
                  key={s.name}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors">
                  <span className="text-sm text-white/70">{s.name}</span>
                  {s.available
                    ? <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">In stock</span>
                    : <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">Coming soon</span>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Coming soon banner */}
      {unavailableProduct && (
        <motion.div
          className="max-w-6xl mx-auto mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-6 py-4 max-w-xl">
            <div>
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">{unavailableProduct}</span> is not available yet
              </p>
              <p className="text-xs text-white/30 mt-1">We will notify you when it arrives</p>
            </div>
            <button
              onClick={() => showToast('You will be notified when it arrives!')}
              className="text-xs border border-white/10 px-4 py-2 rounded-full hover:border-white/30 transition-colors">
              Notify me
            </button>
          </div>
        </motion.div>
      )}

      {/* Category filters */}
      <motion.div
        className="max-w-6xl mx-auto mb-8 flex gap-2 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedCategory === cat
                ? 'bg-purple-500 text-white'
                : 'border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
            }`}>
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => navigate(`/products/${product.id}`)}>

            {/* Product image / emoji */}
            <div className="h-48 flex items-center justify-center bg-white/3 text-7xl group-hover:scale-110 transition-transform duration-300">
              {product.imageUrl}
            </div>

            {/* Product info */}
            <div className="p-4">
              <p className="text-xs text-white/30 mb-1">{product.category}</p>
              <h3 className="text-sm font-medium text-white mb-1">{product.name}</h3>
              <p className="text-purple-400 text-sm mb-4">${product.price.toLocaleString()}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation() // prevent card click
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
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-4">⊘</p>
          <p className="text-sm">No products found</p>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}>
          {toast}
        </motion.div>
      )}

    </div>
  )
}

export default Products