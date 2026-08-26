import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LocationModal from './components/common/LocationModal';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Customer Pages
import Home from './pages/Home/Home';
import Categories from './pages/Categories/Categories';
import Search from './pages/Search/Search';
import Product from './pages/Product/Product';
import Shops from './pages/Shops/Shops';
import ShopDetail from './pages/ShopDetail/ShopDetail';
import Wishlist from './pages/Wishlist/Wishlist';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';

// Shop Owner Pages
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import OwnerProducts from './pages/OwnerProducts/OwnerProducts';
import AddProduct from './pages/AddProduct/AddProduct';
import EditProduct from './pages/EditProduct/EditProduct';
import OwnerShopProfile from './pages/OwnerShopProfile/OwnerShopProfile';

import './App.css';

function AppContent() {
  const [navLocationModalOpen, setNavLocationModalOpen] = useState(false);
  const location = useLocation();

  const isOwnerRoute = location.pathname.startsWith('/owner');

  return (
    <div className="app">
      {/* Show Customer Navbar only on customer pages */}
      {!isOwnerRoute && (
        <Navbar onOpenLocationModal={() => setNavLocationModalOpen(true)} />
      )}

      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />

        {/* Protected Owner Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/products"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/products/new"
          element={
            <ProtectedRoute requiredRole="owner">
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/products/:id/edit"
          element={
            <ProtectedRoute requiredRole="owner">
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/shop-profile"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerShopProfile />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Show Footer only on customer pages */}
      {!isOwnerRoute && <Footer />}

      {/* Global Location Modal */}
      <LocationModal
        isOpen={navLocationModalOpen}
        onClose={() => setNavLocationModalOpen(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
