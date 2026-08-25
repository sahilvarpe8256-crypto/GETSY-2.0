import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LocationModal from './components/common/LocationModal';
import Home from './pages/Home/Home';
import Categories from './pages/Categories/Categories';
import Product from './pages/Product/Product';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import './App.css';

export default function App() {
  const [navLocationModalOpen, setNavLocationModalOpen] = useState(false);

  return (
    <LocationProvider>
      <div className="app">
        <Navbar onOpenLocationModal={() => setNavLocationModalOpen(true)} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Routes>

        <Footer />

        {/* Location modal triggered from navbar */}
        <LocationModal
          isOpen={navLocationModalOpen}
          onClose={() => setNavLocationModalOpen(false)}
        />
      </div>
    </LocationProvider>
  );
}
