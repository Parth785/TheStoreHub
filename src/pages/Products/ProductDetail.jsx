import { useState, useEffect, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { productAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'
import * as THREE from 'three'

const SAMPLE_PRODUCTS = [
  { 
    id: 1, 
    name: 'MacBook Pro 16', 
    price: 2499, 
    category: 'Laptops', 
    stock: 10, 
    description: 'The most powerful MacBook Pro ever. Featuring M3 Pro or M3 Max chip, up to 18 hours battery life, and a stunning Liquid Retina XDR display.', 
    imageUrl: '💻',
    modelUrl: '/models/macbook.glb'
  },
  { 
    id: 2, 
    name: 'iPhone 17 Pro', 
    price: 1199, 
    category: 'Phones', 
    stock: 15, 
    description: 'Titanium design meets A17 Pro chip. The most advanced iPhone ever with a 48MP main camera and Action Button.', 
    imageUrl: '📱',
    modelUrl: '/models/phone_17_pro_max.glb'
  },
  { 
    id: 3, 
    name: 'Sony WH-1000XM5', 
    price: 349, 
    category: 'Audio', 
    stock: 20, 
    description: 'Industry-leading noise cancellation with two processors and eight microphones. 30-hour battery life with quick charge.', 
    imageUrl: '🎧',
    modelUrl: '/models/wolvic_3d_model.glb'
  },
  { 
    id: 4, 
    name: 'Vintage Car Model', 
    price: 799, 
    category: 'Wearables', 
    stock: 8, 
    description: 'The most rugged and capable Apple Watch ever built. Designed for endurance athletes and adventurers.', 
    imageUrl: '🚗',
    modelUrl: '/models/vaz-2105-1-.glb'
  },
  { 
    id: 5, 
    name: 'iPad Pro M2', 
    price: 1099, 
    category: 'Tablets', 
    stock: 12, 
    description: 'Supercharged by M2 chip. With Apple Pencil hover, Wi-Fi 6E, and ProMotion display up to 120Hz.', 
    imageUrl: '📟',
    modelUrl: null
  },
  { 
    id: 6, 
    name: 'AirPods Pro', 
    price: 249, 
    category: 'Audio', 
    stock: 25, 
    description: 'Active Noise Cancellation, Transparency mode, Personalized Spatial Audio with dynamic head tracking.', 
    imageUrl: '🎵',
    modelUrl: null
  },
]
// Preload models so they are ready when user clicks
SAMPLE_PRODUCTS.forEach(p => {
  if (p.modelUrl) useGLTF.preload(p.modelUrl)
})

function Model({ url }) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 3 / maxDim
    scene.scale.setScalar(scale)
    scene.position.sub(center.multiplyScalar(scale))
  }, [scene])

  return <primitive object={scene} />
}

function ModelViewer({ modelUrl }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={2} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <directionalLight position={[-10, -10, -5]} intensity={1} />
      <Suspense fallback={null}>
        <Model url={modelUrl} />
      </Suspense>
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={true}
        autoRotateSpeed={1.5}
      />
    </Canvas>
  )
}

function EmojiViewer({ emoji }) {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)

  const handleMouseDown = (e) => { setIsDragging(true); setLastX(e.clientX) }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    const delta = e.clientX - lastX
    setRotation(r => r + delta * 0.5)
    setLastX(e.clientX)
  }
  const handleMouseUp = () => setIsDragging(false)

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      <div style={{
        transform: `rotateY(${rotation}deg)`,
        fontSize: '120px',
        transition: isDragging ? 'none' : 'transform 0.1s'
      }}>
        {emoji}
      </div>
      <p className="text-white/20 text-xs tracking-widest uppercase mt-6">
        drag to rotate
      </p>
    </div>
  )
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const addItem = useCartStore(state => state.addItem)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [hasModel, setHasModel] = useState(false)

  useEffect(() => {
    productAPI.getById(id)
      .then(res => {
        setProduct(res.data)
        setHasModel(!!res.data.modelUrl)
        setLoading(false)
      })
      .catch(() => {
        const sample = SAMPLE_PRODUCTS.find(p => p.id === parseInt(id))
        setProduct(sample || null)
        setHasModel(!!sample?.modelUrl)
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      showToast('Please sign in to add items to cart')
      setTimeout(() => navigate('/login'), 1000)
      return
    }
    addItem({ ...product, quantity })
    showToast(`${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      showToast('Please sign in first')
      setTimeout(() => navigate('/login'), 1000)
      return
    }
    addItem({ ...product, quantity })
    navigate('/cart')
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

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/40">
        Product not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 pb-16">

      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/products')}
          className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2">
          ← Back to products
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

            <motion.div
        className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
        style={{ height: '480px' }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}>
        {hasModel ? (
          <ModelViewer key={product.modelUrl} modelUrl={product.modelUrl} />
        ) : (
          <EmojiViewer emoji={product.imageUrl} />
        )}
        </motion.div>
        <motion.div
          className="flex flex-col justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>

          <p className="text-xs tracking-[4px] text-white/30 uppercase mb-3">
            {product.category}
          </p>

          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            {product.name}
          </h1>

          <p className="text-3xl text-purple-400 mb-6">
            ${product.price.toLocaleString()}
          </p>

          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mb-8">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-white/40">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-white/40 text-sm">Quantity</span>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="text-white/50 hover:text-white transition-colors w-5 text-center">
                −
              </button>
              <span className="text-white text-sm w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="text-white/50 hover:text-white transition-colors w-5 text-center">
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 border border-white/20 hover:border-purple-400 hover:bg-purple-500/10 text-white py-4 rounded-2xl text-sm font-medium transition-all disabled:opacity-30">
              Add to cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-2xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-30">
              Buy now
            </button>
          </div>

        </motion.div>
      </div>

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

export default ProductDetail