import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'

function Navbar() {
  const { isLoggedIn, logout } = useAuthStore()
  const getTotalItems = useCartStore(state => state.getTotalItems)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
      <Link to="/" className="text-xl font-medium tracking-tight text-white">
        Store<span className="text-purple-400">Hub</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/products" className="text-sm text-white/60 hover:text-white transition-colors">
          Explore
        </Link>

        {isLoggedIn && (
          <Link to="/orders" className="text-sm text-white/60 hover:text-white transition-colors">
            Orders
          </Link>
        )}

        {isLoggedIn && (
          <Link to="/profile" className="text-sm text-white/60 hover:text-white transition-colors">
            Profile
          </Link>
        )}

        <Link to="/cart" className="text-sm text-white/60 hover:text-white transition-colors">
          Cart ({getTotalItems()})
        </Link>

        {isLoggedIn && (
          <Link to="/admin" className="text-sm text-white/60 hover:text-white transition-colors">
            Admin
          </Link>
        )}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm border border-white/20 hover:border-red-400/50 hover:text-red-400 text-white/60 px-4 py-2 rounded-full transition-all">
            Sign out
          </button>
        ) : (
          <Link
            to="/login"
            className="text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar