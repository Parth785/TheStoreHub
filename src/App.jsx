import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Home from './pages/Home/Home.jsx'
import Explore from './pages/Home/Explore.jsx'
import Login from './pages/Auth/Login.jsx'
import Products from './pages/Products/Products.jsx'
import ProductDetail from './pages/Products/ProductDetail.jsx'
import CategoryPage from './pages/Products/CategoryPage.jsx'
import Cart from './pages/Cart/Cart.jsx'
import Orders from './pages/Orders/Orders.jsx'
import Profile from './pages/Profile/Profile.jsx'
import Admin from './pages/Admin/Admin.jsx'

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Explore />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/category/:category" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}

export default App
