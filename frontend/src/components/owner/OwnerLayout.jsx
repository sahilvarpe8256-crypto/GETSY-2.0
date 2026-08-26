import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Store,
  ExternalLink,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  CheckCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import getsyLogo from '../../assets/getsy-logo.png.png';
import { useAuth } from '../../context/AuthContext';
import { getShopById } from '../../services/shopService';
import './OwnerLayout.css';

export default function OwnerLayout({ children, activePageTitle, actionButton }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shopDetails, setShopDetails] = useState(null);

  const ownerShopId = user?.shopId || 'shop-1';

  useEffect(() => {
    getShopById(ownerShopId).then((data) => {
      if (data) setShopDetails(data);
    });
  }, [ownerShopId]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="owner-layout" id="owner-layout">
      {/* Mobile Top Header */}
      <header className="owner-mobile-header">
        <div className="owner-mobile-brand">
          <Link to="/owner/dashboard" className="owner-logo-link">
            <img src={getsyLogo} alt="Getsy" className="owner-logo-img" />
            <span className="owner-logo-text">Getsy</span>
          </Link>
          <span className="owner-badge">Owner</span>
        </div>

        <button
          type="button"
          className="owner-mobile-toggle"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle owner navigation"
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`owner-sidebar ${mobileNavOpen ? 'owner-sidebar--open' : ''}`}>
        {/* Brand & Store Header */}
        <div className="owner-sidebar-brand-section">
          <Link to="/owner/dashboard" className="owner-sidebar-logo">
            <img src={getsyLogo} alt="Getsy" className="owner-logo-img" />
            <span className="owner-logo-text">Getsy</span>
            <span className="owner-portal-tag">PORTAL</span>
          </Link>

          <div className="owner-shop-card-badge">
            <div className="owner-shop-icon-wrap">
              <Store size={18} />
            </div>
            <div className="owner-shop-info">
              <span className="owner-shop-name">
                {shopDetails?.name || user?.shopName || 'Kothrud Shoes & Boots'}
              </span>
              <div className="owner-shop-status-row">
                <span className="owner-status-dot" />
                <span className="owner-status-text">Merchant Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="owner-sidebar-nav">
          <div className="owner-nav-section-label">MANAGEMENT</div>

          <NavLink
            to="/owner/dashboard"
            end
            className={({ isActive }) =>
              `owner-nav-item ${isActive ? 'owner-nav-item--active' : ''}`
            }
            id="owner-nav-dashboard"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/owner/products"
            end
            className={({ isActive }) =>
              `owner-nav-item ${isActive ? 'owner-nav-item--active' : ''}`
            }
            id="owner-nav-products"
          >
            <Package size={18} />
            <span>My Products</span>
          </NavLink>

          <NavLink
            to="/owner/products/new"
            className={({ isActive }) =>
              `owner-nav-item ${isActive ? 'owner-nav-item--active' : ''}`
            }
            id="owner-nav-add-product"
          >
            <PlusCircle size={18} />
            <span>Add Product</span>
          </NavLink>

          <NavLink
            to="/owner/shop-profile"
            className={({ isActive }) =>
              `owner-nav-item ${isActive ? 'owner-nav-item--active' : ''}`
            }
            id="owner-nav-shop-profile"
          >
            <Store size={18} />
            <span>Shop Profile</span>
          </NavLink>

          <div className="owner-nav-divider" />
          <div className="owner-nav-section-label">STOREFRONT</div>

          <Link
            to={`/shops/${ownerShopId}`}
            className="owner-nav-item owner-nav-item--external"
            id="owner-nav-view-shop"
          >
            <ExternalLink size={18} />
            <span>View My Shop</span>
            <ChevronRight size={14} className="owner-external-arrow" />
          </Link>

          <Link
            to="/"
            className="owner-nav-item"
            id="owner-nav-customer-site"
          >
            <ArrowLeft size={18} />
            <span>Back to Customer Site</span>
          </Link>
        </nav>

        {/* Sidebar Footer User Info & Sign Out */}
        <div className="owner-sidebar-footer">
          <div className="owner-user-profile">
            <div className="owner-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="owner-user-details">
              <span className="owner-user-name">{user?.name || 'Shop Owner'}</span>
              <span className="owner-user-email">{user?.email || 'owner@getsy.com'}</span>
            </div>
          </div>

          <button
            type="button"
            className="owner-logout-btn"
            onClick={handleLogout}
            id="owner-sidebar-logout"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileNavOpen && (
        <div
          className="owner-mobile-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Owner Content Area */}
      <main className="owner-main-content">
        {/* Top Header bar if activePageTitle is provided */}
        {activePageTitle && (
          <div className="owner-page-topbar">
            <div>
              <h1 className="owner-page-title">{activePageTitle}</h1>
            </div>
            {actionButton && (
              <div className="owner-page-topbar-action">
                {actionButton}
              </div>
            )}
          </div>
        )}

        <div className="owner-content-body">
          {children}
        </div>
      </main>
    </div>
  );
}
