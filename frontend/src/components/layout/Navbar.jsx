import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Home, LayoutGrid, Search, User, ChevronDown, Menu, X } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import './Navbar.css';

export default function Navbar({ onOpenLocationModal }) {
  const { location } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLocationClick = () => {
    if (onOpenLocationModal) {
      onOpenLocationModal();
    }
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <div className="navbar-logo-icon">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="12" width="32" height="24" rx="4" fill="#0e8c7f" />
              <rect x="8" y="16" width="24" height="16" rx="2" fill="#ffffff" opacity="0.3" />
              <path d="M14 12V8a6 6 0 0 1 12 0v4" stroke="#0e8c7f" strokeWidth="3" fill="none" />
              <circle cx="16" cy="22" r="2" fill="#ffffff" />
              <circle cx="24" cy="22" r="2" fill="#ffffff" />
              <circle cx="20" cy="27" r="2" fill="#ffffff" />
              <circle cx="20" cy="22" r="1.5" fill="#e8922d" />
            </svg>
          </div>
          <span className="navbar-logo-text">Getsy</span>
        </Link>

        {/* Location selector */}
        <button
          className="navbar-location"
          id="navbar-location"
          onClick={handleLocationClick}
        >
          <MapPin size={14} className="navbar-location-icon" />
          <span className="navbar-location-text">
            {location || 'Enter your current location'}
          </span>
          <ChevronDown size={14} />
        </button>

        {/* Nav links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'navbar-links--open' : ''}`}>
          <Link to="/" className="navbar-link navbar-link--active" id="nav-home">
            <Home size={16} />
            <span>Home</span>
          </Link>
          <Link to="/categories" className="navbar-link" id="nav-categories">
            <LayoutGrid size={16} />
            <span>Categories</span>
          </Link>
          <button className="navbar-link" id="nav-search">
            <Search size={16} />
            <span>Search</span>
          </button>
          <button className="navbar-link" id="nav-account">
            <User size={16} />
            <span>Account</span>
          </button>
        </div>

        {/* Auth button */}
        <button className="navbar-auth-btn" id="navbar-auth-btn">
          Sign Up / Login
        </button>

        {/* Mobile menu toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
