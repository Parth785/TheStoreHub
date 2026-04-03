import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { productAPI } from '../../services/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'
import * as THREE from 'three'
import React, { useState, useEffect, Suspense } from 'react'
import { reviewAPI } from '../../services/api'


// Error boundary catches Three.js crashes
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <img
            src={this.props.imageUrl}
            alt={this.props.name}
            className="w-48 h-48 object-contain"
          />
          <p className="text-white/30 text-xs tracking-widest uppercase">
            3D model unavailable
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

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
    name: 'Boat Wireless Headphones', 
    price: 349, 
    category: 'Audio', 
    stock: 20, 
    description: 'Industry-leading noise cancellation with two processors and eight microphones. 30-hour battery life with quick charge.', 
    imageUrl: '🎧',
    modelUrl: '/models/boat_rockerz_510_headphone_3d_model.glb'
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
    modelUrl: '/models/apple_ipad_pro.glb'
  },
  { 
    id: 6, 
    name: 'AirPods Pro', 
    price: 249, 
    category: 'Audio', 
    stock: 25, 
    description: 'Active Noise Cancellation, Transparency mode, Personalized Spatial Audio with dynamic head tracking.', 
    imageUrl: '🎵',
    modelUrl: '/models/airpods_pro_with_magsafe_charging_case_ios15.glb'
  },
]
// Preload models so they are ready when user clicks
SAMPLE_PRODUCTS.forEach(p => {
  if (p.modelUrl) useGLTF.preload(p.modelUrl)
})

function ModelWithFallback({ url, onError }) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    if (!scene) {
      onError()
      return
    }
    try {
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3 / maxDim
      scene.scale.setScalar(scale)
      scene.position.sub(center.multiplyScalar(scale))
    } catch (e) {
      onError()
    }
  }, [scene])

  return <primitive object={scene} />
}

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
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <p className="text-4xl">📦</p>
        <p className="text-white/30 text-xs tracking-widest uppercase">
          3D model unavailable
        </p>
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      onError={() => setHasError(true)}>
      <ambientLight intensity={2} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <directionalLight position={[-10, -10, -5]} intensity={1} />
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#534AB7" wireframe />
        </mesh>
      }>
        <ModelWithFallback url={modelUrl} onError={() => setHasError(true)} />
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
function ImageViewer({ imageUrl, name }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white/3 p-8">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
    </div>
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
  const addItem = useCartStore(state => state.addItem)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [hasModel, setHasModel] = useState(false)
  const { user, isLoggedIn } = useAuthStore()
const [reviews, setReviews] = useState([])
const [reviewSummary, setReviewSummary] = useState(null)
const [showReviewForm, setShowReviewForm] = useState(false)
const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
const [submittingReview, setSubmittingReview] = useState(false)

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

  useEffect(() => {
    if (!id) return
    reviewAPI.getProductReviews(id)
      .then(res => setReviews(res.data || []))
      .catch(() => setReviews([]))

    reviewAPI.getProductSummary(id)
      .then(res => setReviewSummary(res.data))
      .catch(() => setReviewSummary(null))
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

  const handleReviewSubmit = async (e) => {
  e.preventDefault()
  if (!isLoggedIn) {
    showToast('Please sign in to leave a review')
    return
  }
  setSubmittingReview(true)
  try {
    await reviewAPI.create({
      productId: parseInt(id),
      rating: reviewForm.rating,
      comment: reviewForm.comment
    })
    // refresh reviews
    const res = await reviewAPI.getProductReviews(id)
    setReviews(res.data || [])
    const summaryRes = await reviewAPI.getProductSummary(id)
    setReviewSummary(summaryRes.data)
    setShowReviewForm(false)
    setReviewForm({ rating: 5, comment: '' })
    showToast('Review submitted successfully!')
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to submit review')
  } finally {
    setSubmittingReview(false)
  }
}

const handleDeleteReview = async (reviewId) => {
  try {
    await reviewAPI.deleteReview(reviewId)
    setReviews(reviews.filter(r => r.id !== reviewId))
    showToast('Review deleted')
  } catch {
    showToast('Failed to delete review')
  }
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
        <ModelErrorBoundary imageUrl={product.imageUrl} name={product.name}>
          <ModelViewer key={product.modelUrl} modelUrl={product.modelUrl} />
        </ModelErrorBoundary>
      ) : (
        <ImageViewer imageUrl={product.imageUrl} name={product.name} />
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

      {/* Reviews section */}
<div className="max-w-6xl mx-auto mt-16">

  {/* Reviews header */}
  <div className="flex items-center justify-between mb-8">
    <div>
      <p className="text-xs tracking-[4px] text-white/30 uppercase mb-2">
        Customer reviews
      </p>
      <h2 className="text-3xl font-medium">
        Reviews
        {reviewSummary?.totalReviews > 0 && (
          <span className="text-white/30 text-xl ml-3">
            ({reviewSummary.totalReviews})
          </span>
        )}
      </h2>
    </div>
    {isLoggedIn && (
      <button
        onClick={() => setShowReviewForm(!showReviewForm)}
        className="border border-white/10 hover:border-purple-400 hover:bg-purple-500/10 text-white/60 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-all">
        {showReviewForm ? 'Cancel' : '+ Write a review'}
      </button>
    )}
  </div>

  {/* Rating summary */}
  {reviewSummary && reviewSummary.totalReviews > 0 && (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>

      {/* Average rating */}
      <div className="text-center flex-shrink-0">
        <p className="text-6xl font-medium text-white">
          {reviewSummary.averageRating?.toFixed(1)}
        </p>
        <div className="flex justify-center gap-1 my-2">
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              className={`text-lg ${
                star <= Math.round(reviewSummary.averageRating)
                  ? 'text-yellow-400'
                  : 'text-white/20'
              }`}>
              ★
            </span>
          ))}
        </div>
        <p className="text-white/30 text-sm">
          {reviewSummary.totalReviews} reviews
        </p>
      </div>

      {/* Rating breakdown */}
      <div className="flex-1 flex flex-col gap-2">
        {[
          { stars: 5, count: reviewSummary.fiveStar },
          { stars: 4, count: reviewSummary.fourStar },
          { stars: 3, count: reviewSummary.threeStar },
          { stars: 2, count: reviewSummary.twoStar },
          { stars: 1, count: reviewSummary.oneStar },
        ].map(row => (
          <div key={row.stars} className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-4">{row.stars}</span>
            <span className="text-yellow-400 text-xs">★</span>
            <div className="flex-1 bg-white/10 rounded-full h-1.5">
              <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all"
                style={{
                  width: reviewSummary.totalReviews > 0
                    ? `${(row.count / reviewSummary.totalReviews) * 100}%`
                    : '0%'
                }}
              />
            </div>
            <span className="text-xs text-white/30 w-4">{row.count}</span>
          </div>
        ))}
      </div>

    </motion.div>
  )}

  {/* Write review form */}
  {showReviewForm && (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}>
      <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-6">
        Write your review
      </h3>
      <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">

        {/* Star rating picker */}
        <div>
          <label className="text-white/40 text-xs mb-2 block">Your rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                className={`text-2xl transition-all hover:scale-110 ${
                  star <= reviewForm.rating ? 'text-yellow-400' : 'text-white/20'
                }`}>
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="text-white/40 text-xs mb-1 block">Your review</label>
          <textarea
            value={reviewForm.comment}
            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
            placeholder="Share your experience with this product..."
            rows={4}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-400 transition-colors placeholder:text-white/20 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submittingReview}
          className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all w-fit">
          {submittingReview ? 'Submitting...' : 'Submit review'}
        </button>

      </form>
    </motion.div>
  )}

  {/* Reviews list */}
  {reviews.length === 0 ? (
    <div className="text-center py-16 text-white/30">
      <p className="text-4xl mb-3">💬</p>
      <p className="text-sm">No reviews yet — be the first to review!</p>
      {isLoggedIn && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mt-4 text-purple-400 text-sm hover:text-purple-300 transition-colors">
          Write a review
        </button>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}>

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-medium text-purple-400 flex-shrink-0">
                {review.userName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{review.userName}</p>
                <p className="text-xs text-white/30">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= review.rating ? 'text-yellow-400' : 'text-white/20'
                    }`}>
                    ★
                  </span>
                ))}
              </div>

              {/* Delete button for own reviews */}
              {user?.id === review.userId && (
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-white/20 hover:text-red-400 transition-colors text-xs">
                  ✕
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-white/60 leading-relaxed">
            {review.comment}
          </p>

        </motion.div>
      ))}
    </div>
  )}

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