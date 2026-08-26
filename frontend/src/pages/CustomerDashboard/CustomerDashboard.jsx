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
import './CustomerDashboard.css';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { location, coordinates, setLocation, detectCurrentLocation, isLocating, locationError } = useLocation();
  const { wishlist } = useWishlist();

  // Location edit mode: 'view' | 'edit'
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationTab, setLocationTab] = useState('map'); // 'map' | 'manual' | 'gps'
  const [manualText, setManualText] = useState(location || '');
  const [pendingMapLocation, setPendingMapLocation] = useState({
    locationName: location || 'FC Road / Deccan, Pune',
    coordinates: coordinates || { lat: 18.5196, lng: 73.8427 }
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSaveLocation = (newLoc, newCoords) => {
    setLocation(newLoc, newCoords);
    setSaveSuccess(`Location updated to ${newLoc}`);
    setIsEditingLocation(false);
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualText.trim()) {
      handleSaveLocation(manualText.trim(), null);
    }
  };

  const handleGpsDetect = async () => {
    try {
      const res = await detectCurrentLocation();
      handleSaveLocation(res.location, res.coordinates);
    } catch {
      /* error handled in context */
    }
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
              <span>{wishlist.length} Saved Items</span>
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

              {!isEditingLocation ? (
                <button
                  type="button"
                  className="customer-edit-loc-btn"
                  onClick={() => {
                    setIsEditingLocation(true);
                    setManualText(location || '');
                  }}
                  id="customer-change-location-btn"
                >
                  <MapPin size={14} />
                  <span>Change Location</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="customer-cancel-loc-btn"
                  onClick={() => setIsEditingLocation(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Current Active Location View */}
            {!isEditingLocation ? (
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

                <div className="current-loc-actions">
                  <Link to="/shops" className="customer-discover-link">
                    <Store size={15} />
                    <span>Browse Nearby Shops</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              /* Location Editor with Map, GPS, and Manual Search */
              <div className="customer-loc-editor-wrap">
                <div className="location-tabs-switch">
                  <button
                    type="button"
                    className={`location-tab-btn ${locationTab === 'map' ? 'location-tab-btn--active' : ''}`}
                    onClick={() => setLocationTab('map')}
                  >
                    <MapIcon size={14} />
                    <span>Select on Map</span>
                  </button>

                  <button
                    type="button"
                    className={`location-tab-btn ${locationTab === 'gps' ? 'location-tab-btn--active' : ''}`}
                    onClick={() => setLocationTab('gps')}
                  >
                    <LocateFixed size={14} />
                    <span>Current GPS</span>
                  </button>

                  <button
                    type="button"
                    className={`location-tab-btn ${locationTab === 'manual' ? 'location-tab-btn--active' : ''}`}
                    onClick={() => setLocationTab('manual')}
                  >
                    <MapPin size={14} />
                    <span>Search Area</span>
                  </button>
                </div>

                {/* Map Tab */}
                {locationTab === 'map' && (
                  <div className="editor-tab-pane">
                    <LocationPickerMap
                      initialCoordinates={coordinates}
                      initialLocationName={location}
                      height="260px"
                      onLocationChange={(data) => setPendingMapLocation(data)}
                    />
                    <button
                      type="button"
                      className="customer-save-loc-btn"
                      onClick={() =>
                        handleSaveLocation(
                          pendingMapLocation.locationName,
                          pendingMapLocation.coordinates
                        )
                      }
                      id="customer-confirm-map-location-btn"
                    >
                      <span>Save Selected Map Location</span>
                    </button>
                  </div>
                )}

                {/* GPS Tab */}
                {locationTab === 'gps' && (
                  <div className="editor-tab-pane customer-gps-pane">
                    <LocateFixed size={36} color="var(--primary)" />
                    <h4>Auto-detect device location</h4>
                    <p>Uses high-accuracy browser geolocation to pinpoint your position.</p>

                    {locationError && (
                      <div className="location-picker-error" style={{ margin: '10px 0' }}>
                        <span>{locationError}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="customer-save-loc-btn"
                      onClick={handleGpsDetect}
                      disabled={isLocating}
                      id="customer-detect-gps-btn"
                    >
                      <LocateFixed size={16} />
                      <span>{isLocating ? 'Detecting...' : 'Detect & Set Location'}</span>
                    </button>
                  </div>
                )}

                {/* Manual Tab */}
                {locationTab === 'manual' && (
                  <form onSubmit={handleManualSubmit} className="editor-tab-pane">
                    <div className="customer-input-group">
                      <label>Enter Locality, Landmark, or City</label>
                      <input
                        type="text"
                        className="customer-input"
                        placeholder="e.g. Kothrud, Pune"
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="customer-quick-chips">
                      {['Kothrud, Pune', 'FC Road, Pune', 'Baner, Pune', 'Viman Nagar, Pune', 'Hadapsar, Pune'].map(
                        (chip) => (
                          <button
                            key={chip}
                            type="button"
                            className="location-chip"
                            onClick={() => {
                              setManualText(chip);
                              handleSaveLocation(chip, null);
                            }}
                          >
                            {chip}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="submit"
                      className="customer-save-loc-btn"
                      disabled={!manualText.trim()}
                    >
                      Save Manual Location
                    </button>
                  </form>
                )}
              </div>
            )}
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
                  <span>{wishlist.length} items saved</span>
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
