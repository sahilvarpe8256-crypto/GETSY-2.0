import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Search,
  Grid,
  Map as MapIcon,
  Columns,
  LocateFixed,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { categories } from '../../data/categories';
import { getShops } from '../../services/shopService';
import CategoryPill from '../../components/common/CategoryPill';
import ShopCard from '../../components/common/ShopCard';
import ShopMap from '../../components/shop/ShopMap';
import LocationModal from '../../components/common/LocationModal';
import './Shops.css';

export default function Shops() {
  const { location, detectCurrentLocation, isLocating, locationError } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryParam = searchParams.get('cat') || 'all';
  const queryParam = searchParams.get('q') || '';
  const viewParam = searchParams.get('view') || 'split'; // 'grid' | 'map' | 'split'

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [viewMode, setViewMode] = useState(viewParam);
  const [maxDistance, setMaxDistance] = useState('all'); // 'all' | '2' | '5' | '10'
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);

  // Sync state from searchParams
  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (queryParam !== undefined) setSearchQuery(queryParam);
  }, [queryParam]);

  // Fetch shops when filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getShops({
      category: activeCategory === 'all' ? undefined : activeCategory,
      search: searchQuery || undefined,
      maxDistance: maxDistance === 'all' ? undefined : maxDistance,
      verifiedOnly
    }).then((data) => {
      if (isMounted) {
        setShops(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery, maxDistance, verifiedOnly]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', catId);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setMaxDistance('all');
    setVerifiedOnly(false);
    setSearchParams({});
  };

  const handleLocateMe = () => {
    detectCurrentLocation()
      .then((res) => {
        setGeoNotice(`Location updated to ${res.location}`);
        setTimeout(() => setGeoNotice(null), 3000);
      })
      .catch((err) => {
        setLocationModalOpen(true);
      });
  };

  const handleShopSelectFromList = (shop) => {
    setSelectedShopId(shop.id || shop._id);
    if (viewMode === 'map' || viewMode === 'split') {
      const mapEl = document.getElementById('shop-map-container');
      if (mapEl && viewMode === 'grid') {
        mapEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <main className="shops-page" id="shops-page">
      {/* Header / Hero Banner */}
      <section className="shops-hero">
        <div className="container">
          <div className="shops-hero-content">
            <div className="shops-hero-tag">
              <Store size={15} />
              <span>Merchant Network</span>
            </div>
            <h1 className="shops-hero-title">Discover Nearby Shops</h1>
            <p className="shops-hero-subtitle">
              Browse trusted local stores, check real-time product availability, and get in-store directions.
            </p>

            {/* Search and Location bar */}
            <div className="shops-search-bar-wrap">
              <form className="shops-search-bar" onSubmit={handleSearchSubmit}>
                <Search size={18} className="shops-search-icon" />
                <input
                  type="text"
                  placeholder="Search shops by name, category, or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shops-search-input"
                  id="shops-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="shops-search-clear"
                    onClick={() => {
                      setSearchQuery('');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('q');
                      setSearchParams(newParams);
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="shops-search-btn" id="shops-search-btn">
                  Search
                </button>
              </form>

              {/* Geolocation Button */}
              <button
                type="button"
                className="shops-locate-btn"
                onClick={handleLocateMe}
                disabled={isLocating}
                id="shops-locate-btn"
                title="Use current location"
              >
                <LocateFixed size={16} className={isLocating ? 'spin-anim' : ''} />
                <span>{isLocating ? 'Locating...' : (location || 'Near Me')}</span>
              </button>
            </div>

            {geoNotice && (
              <div className="shops-geo-notice">
                <CheckCircle2 size={15} />
                <span>{geoNotice}</span>
              </div>
            )}

            {locationError && (
              <div className="shops-geo-error">
                <AlertCircle size={15} />
                <span>{locationError}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="shops-controls-section">
        <div className="container">
          <div className="shops-controls-inner">
            {/* Category Pills */}
            <div className="shops-category-pills">
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  label={cat.label}
                  isActive={activeCategory === cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                />
              ))}
            </div>

            {/* Secondary Filters & View Switcher */}
            <div className="shops-toolbar">
              <div className="shops-filter-group">
                {/* Distance Filter */}
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="shops-select-filter"
                  id="shops-distance-filter"
                  aria-label="Filter by distance"
                >
                  <option value="all">Any Distance</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                </select>

                {/* Verified Toggle */}
                <button
                  type="button"
                  className={`shops-toggle-filter ${verifiedOnly ? 'is-active' : ''}`}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  id="shops-verified-filter"
                >
                  <CheckCircle2 size={14} />
                  <span>Verified Only</span>
                </button>
              </div>

              {/* View Switcher: Split / Grid / Map */}
              <div className="shops-view-switcher" role="tablist">
                <button
                  type="button"
                  className={`shops-view-btn ${viewMode === 'split' ? 'is-active' : ''}`}
                  onClick={() => handleViewModeChange('split')}
                  title="Split View (List + Map)"
                  aria-label="Split View"
                >
                  <Columns size={16} />
                  <span className="shops-view-label">Split</span>
                </button>
                <button
                  type="button"
                  className={`shops-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                  onClick={() => handleViewModeChange('grid')}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <Grid size={16} />
                  <span className="shops-view-label">List</span>
                </button>
                <button
                  type="button"
                  className={`shops-view-btn ${viewMode === 'map' ? 'is-active' : ''}`}
                  onClick={() => handleViewModeChange('map')}
                  title="Map View"
                  aria-label="Map View"
                >
                  <MapIcon size={16} />
                  <span className="shops-view-label">Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="shops-content-section">
        <div className="container">
          {/* Results Summary */}
          <div className="shops-results-header">
            <div>
              <h2 className="shops-results-count">
                {loading ? 'Finding shops...' : `${shops.length} Local Merchant${shops.length === 1 ? '' : 's'} Found`}
              </h2>
              {location && (
                <p className="shops-results-location-text">
                  <MapPin size={13} />
                  <span>Showing merchants serving {location}</span>
                </p>
              )}
            </div>

            {(activeCategory !== 'all' || searchQuery || maxDistance !== 'all' || verifiedOnly) && (
              <button
                type="button"
                className="shops-reset-btn"
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="shops-grid-loading">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="shops-card-skeleton" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && shops.length === 0 && (
            <div className="shops-empty-state">
              <div className="shops-empty-icon">
                <Store size={36} />
              </div>
              <h3 className="shops-empty-title">No shops found</h3>
              <p className="shops-empty-desc">
                We couldn't find any local stores matching your current criteria. Try expanding your search radius or switching categories.
              </p>
              <button
                type="button"
                className="shops-empty-action-btn"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Non-empty layout based on View Mode */}
          {!loading && shops.length > 0 && (
            <div className={`shops-layout-container view-${viewMode}`}>
              {/* Left/Main Column: Shop Cards Grid */}
              {(viewMode === 'split' || viewMode === 'grid') && (
                <div className="shops-cards-column">
                  <div className="shops-cards-grid">
                    {shops.map((shop) => (
                      <ShopCard
                        key={shop.id || shop._id}
                        shop={shop}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Right Column / Full Map View: Interactive Map */}
              {(viewMode === 'split' || viewMode === 'map') && (
                <div className="shops-map-column">
                  <div className="shops-map-sticky-wrap">
                    <ShopMap
                      shops={shops}
                      selectedShopId={selectedShopId}
                      onSelectShop={(shop) => setSelectedShopId(shop.id || shop._id)}
                      onOpenLocationModal={() => setLocationModalOpen(true)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Global Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </main>
  );
}
