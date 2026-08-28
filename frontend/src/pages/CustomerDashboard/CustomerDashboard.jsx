import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Heart,
  Store,
  LocateFixed,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useWishlist } from '../../context/WishlistContext';
import LocationPickerMap from '../../components/common/LocationPickerMap';
import LocationModal from '../../components/common/LocationModal';
import './CustomerDashboard.css';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { location, coordinates, setLocation, detectCurrentLocation, isLocating, locationError } = useLocation();
  const { wishlistItems, wishlistCount } = useWishlist();

  // Location modal open state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSaveLocation = (newLoc, newCoords) => {
    setLocation(newLoc, newCoords);
    setSaveSuccess(`Location updated to ${newLoc}`);
    setIsLocationModalOpen(false);
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  return (
    <main className="customer-dashboard-page">
      <div className="container">
        {/* User Hero Header */}
        <div className="customer-hero-card">
          <div className="customer-hero-profile">
            <div className="customer-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="customer-profile-info">
              <div className="customer-tag">
                <Sparkles size={13} />
                <span>Customer Profile</span>
              </div>
              <h1 className="customer-name">{user?.name || 'Valued Shopper'}</h1>
              <p className="customer-email">{user?.email || 'customer@getsy.com'}</p>
            </div>
          </div>

          <div className="customer-hero-meta">
            <div className="customer-stat-pill">
              <Heart size={16} color="#ef4444" />
              <span>{wishlistCount} Saved Items</span>
            </div>
            <button type="button" onClick={logout} className="customer-logout-btn">
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="auth-alert auth-alert--success" style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={16} />
            <span>{saveSuccess}</span>
          </div>
        )}

        <div className="customer-dashboard-grid">
          {/* Left Column: Location Management */}
          <div className="customer-card customer-location-card">
            <div className="customer-card-header">
              <div className="customer-card-title-wrap">
                <MapPin size={20} className="card-icon" />
                <div>
                  <h2 className="customer-card-title">My Discovery Location</h2>
                  <p className="customer-card-subtitle">
                    Determines store distance and nearby neighborhood availability
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="customer-edit-loc-btn"
                onClick={() => setIsLocationModalOpen(true)}
                id="customer-change-location-btn"
              >
                <MapPin size={14} />
                <span>Change Location</span>
              </button>
            </div>

            {/* Current Active Location View */}
              <div className="customer-current-loc-box">
                <div className="current-loc-badge">
                  <span className="current-loc-dot" />
                  <span>Active Location</span>
                </div>
                <h3 className="current-loc-name">{location || 'Pune, Maharashtra (Default)'}</h3>
                {coordinates && (
                  <span className="current-loc-coords">
                    GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </span>
                )}

                <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <LocationPickerMap
                    initialCoordinates={coordinates}
                    initialLocationName={location}
                    height="200px"
                    onLocationChange={(data) => {
                      if (data?.coordinates) {
                        setLocation(data.locationName, data.coordinates);
                      }
                    }}
                  />
                </div>

                <div className="current-loc-actions" style={{ marginTop: '16px' }}>
                  <Link to="/shops" className="customer-discover-link">
                    <Store size={15} />
                    <span>Browse Nearby Shops</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onLocationSelected={handleSaveLocation}
              />
            </div>

          {/* Right Column: Quick Links & Summary */}
          <div className="customer-card customer-quick-links-card">
            <h2 className="customer-card-title" style={{ marginBottom: '14px' }}>
              Quick Navigation
            </h2>

            <div className="customer-links-list">
              <Link to="/wishlist" className="customer-quick-item">
                <div className="quick-item-icon bg-red">
                  <Heart size={18} color="#ef4444" />
                </div>
                <div className="quick-item-text">
                  <strong>My Wishlist</strong>
                  <span>{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</span>
                </div>
                <ChevronRight size={16} className="quick-arrow" />
              </Link>

              <Link to="/shops" className="customer-quick-item">
                <div className="quick-item-icon bg-teal">
                  <Store size={18} color="var(--primary)" />
                </div>
                <div className="quick-item-text">
                  <strong>Explore Local Shops</strong>
                  <span>Browse verified stores near you</span>
                </div>
                <ChevronRight size={16} className="quick-arrow" />
              </Link>

              <Link to="/categories" className="customer-quick-item">
                <div className="quick-item-icon bg-blue">
                  <ShoppingBag size={18} color="#0284c7" />
                </div>
                <div className="quick-item-text">
                  <strong>Shop by Category</strong>
                  <span>Footwear, Clothing, Ornaments & more</span>
                </div>
                <ChevronRight size={16} className="quick-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
