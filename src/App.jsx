import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Auth/Login.jsx'
import Products from './pages/Products/Products.jsx'
import ProductDetail from './pages/Products/ProductDetail.jsx'

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<div className="text-center pt-32 text-2xl">Cart</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<div className="text-center pt-32 text-2xl">Orders</div>} />
        <Route path="/profile" element={<div className="text-center pt-32 text-2xl">Profile</div>} />
      </Routes>
    </div>
  )
}

export default App