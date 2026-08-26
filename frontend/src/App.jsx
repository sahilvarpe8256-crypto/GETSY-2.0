import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LocationModal from './components/common/LocationModal';
import AuthModal from './components/auth/AuthModal';
import Home from './pages/Home/Home';
import Categories from './pages/Categories/Categories';
import Search from './pages/Search/Search';
import Product from './pages/Product/Product';
import Shops from './pages/Shops/Shops';
import ShopDetail from './pages/ShopDetail/ShopDetail';
import Wishlist from './pages/Wishlist/Wishlist';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import './App.css';

export default function App() {
  const [navLocationModalOpen, setNavLocationModalOpen] = useState(false);

  return (
    <AuthProvider>
      <WishlistProvider>
        <LocationProvider>
          <div className="app">
            <Navbar onOpenLocationModal={() => setNavLocationModalOpen(true)} />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/shops/:id" element={<ShopDetail />} />
              <Route path="/shop/:id" element={<ShopDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            </Routes>

            <Footer />

            {/* Global Location Modal */}
            <LocationModal
              isOpen={navLocationModalOpen}
              onClose={() => setNavLocationModalOpen(false)}
            />

            {/* Global Auth Modal */}
            <AuthModal />
          </div>
        </LocationProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
