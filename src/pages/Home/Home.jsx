import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Background orbs */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

      {/* Hero section */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">

        {/* Tag line */}
        <motion.p
          className="text-xs tracking-[6px] text-white/30 uppercase mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          Welcome to our world
        </motion.p>

        {/* Main title */}
        <motion.h1
          className="text-6xl md:text-8xl font-medium leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}>
          Where products<br />
          meet <span className="text-purple-400">experience</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/40 text-lg max-w-md mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}>
          Discover a new way to shop with immersive 3D previews,
          seamless checkout, and instant delivery.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:scale-105">
            Explore now
          </button>
          <button
            onClick={() => navigate('/login')}
            className="border border-white/20 text-white px-8 py-3 rounded-full text-sm hover:border-white/50 transition-all">
            Sign in
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.p
          className="absolute bottom-8 text-white/20 text-xs tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}>
          scroll to explore
        </motion.p>
      </div>

      {/* Stats section */}
      <motion.div
        className="grid grid-cols-3 gap-8 max-w-2xl mx-auto px-6 pb-32 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}>
        {[
          { number: '10K+', label: 'Products' },
          { number: '50K+', label: 'Customers' },
          { number: '99%', label: 'Satisfaction' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-medium text-white">{stat.number}</p>
            <p className="text-white/30 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

    </div>
  )
}

export default Home