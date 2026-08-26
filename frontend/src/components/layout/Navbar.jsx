import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import {
  MapPin,
  Home,
  LayoutGrid,
  Search,
  User,
  Heart,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Store
} from 'lucide-react';
import getsyLogo from '../../assets/getsy-logo.png.png';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import './Navbar.css';

export default function Navbar({ onOpenLocationModal }) {
  const { location } = useLocation();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const routeLocation = useRouteLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [routeLocation.pathname]);

  const handleLocationClick = () => {
    if (onOpenLocationModal) {
      onOpenLocationModal();
    }
  };

  const handleAuthClick = () => {
    openAuthModal({ mode: 'login' });
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-inner">
        {/* Original Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <img
            src={getsyLogo}
            alt="Getsy Logo"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">Getsy</span>
        </Link>

        {/* Location selector */}
        <button
          type="button"
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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'navbar-link--active' : ''}`
            }
            id="nav-home"
          >
            <Home size={16} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'navbar-link--active' : ''}`
            }
            id="nav-categories"
          >
            <LayoutGrid size={16} />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/shops"
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'navbar-link--active' : ''}`
            }
            id="nav-shops"
          >
            <Store size={16} />
            <span>Shops</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'navbar-link--active' : ''}`
            }
            id="nav-search"
          >
            <Search size={16} />
            <span>Search</span>
          </NavLink>

          {/* Wishlist Link — Only visible when authenticated */}
          {isAuthenticated && (
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link--active' : ''}`
              }
              id="nav-wishlist"
            >
              <div className="navbar-wishlist-icon-wrap">
                <Heart size={16} />
                {wishlistCount > 0 && (
                  <span className="navbar-wishlist-badge">{wishlistCount}</span>
                )}
              </div>
              <span>Wishlist</span>
            </NavLink>
          )}

          {/* Mobile-only menu items */}
          <div className="navbar-mobile-only-section">
            {isAuthenticated ? (
              <div className="navbar-user-menu-mobile">
                <Link to="/dashboard" className="navbar-link">
                  <User size={16} />
                  <span>Dashboard ({user?.name})</span>
                </Link>
                <button type="button" onClick={handleLogout} className="navbar-link logout-btn">
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="navbar-auth-btn-mobile"
                onClick={handleAuthClick}
              >
                Sign Up / Login
              </button>
            )}
          </div>
        </div>

        {/* Desktop Auth / Account section */}
        <div className="navbar-auth-desktop">
          {isAuthenticated ? (
            <div className="navbar-user-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="navbar-user-pill"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                id="navbar-user-pill"
              >
                <div className="navbar-user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="navbar-user-meta">
                  <span className="navbar-user-name">{user?.name || 'Account'}</span>
                  <span className="navbar-user-role">{user?.role || 'customer'}</span>
                </div>
                <ChevronDown size={14} className="navbar-user-chevron" />
              </button>

              {userDropdownOpen && (
                <div className="navbar-dropdown-menu" id="navbar-dropdown-menu">
                  <div className="navbar-dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>

                  <div className="navbar-dropdown-divider" />

                  <Link
                    to="/dashboard"
                    className="navbar-dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User size={15} />
                    <span>Customer Dashboard</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="navbar-dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Heart size={15} />
                    <span>My Wishlist ({wishlistCount})</span>
                  </Link>

                  {user?.role === 'owner' && (
                    <Link
                      to="/owner/dashboard"
                      className="navbar-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Store size={15} />
                      <span>Owner Dashboard</span>
                    </Link>
                  )}

                  <div className="navbar-dropdown-divider" />

                  <button
                    type="button"
                    className="navbar-dropdown-item navbar-dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="navbar-auth-btn"
              id="navbar-auth-btn"
              onClick={handleAuthClick}
            >
              Sign Up / Login
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
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
