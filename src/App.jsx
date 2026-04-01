import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Home from './pages/Home/Home.jsx'
import Explore from './pages/Home/Explore.jsx'
import Login from './pages/Auth/Login.jsx'
// import Products from './pages/Products/Products.jsx'
import ProductDetail from './pages/Products/ProductDetail.jsx'
import CategoryPage from './pages/Products/CategoryPage.jsx'
import Cart from './pages/Cart/Cart.jsx'
import Orders from './pages/Orders/Orders.jsx'
import Profile from './pages/Profile/Profile.jsx'
// import Admin from './pages/Admin/Admin.jsx'
import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'


function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Explore />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/category/:category" element={<CategoryPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
