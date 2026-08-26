import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Star,
  CheckCircle,
  Plus,
  Minus,
  RotateCcw,
  Store,
  Layers,
  ArrowRight,
  LocateFixed,
  Clock
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import './ShopMap.css';

export default function ShopMap({
  shops = [],
  selectedShopId,
  onSelectShop,
  onOpenLocationModal
}) {
  const navigate = useNavigate();
  const { location, coordinates, isLocating, detectCurrentLocation } = useLocation();

  const [activeShop, setActiveShop] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapTheme, setMapTheme] = useState('modern'); // 'modern' | 'satellite'

  const mapContainerRef = useRef(null);

  // Sync selectedShopId prop with activeShop state
  useEffect(() => {
    if (selectedShopId) {
      const found = shops.find((s) => (s.id || s._id) === selectedShopId);
      if (found) setActiveShop(found);
    }
  }, [selectedShopId, shops]);

  // Compute map bounding box from shops coordinates or fallback
  const mapCenter = useMemo(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      return coordinates;
    }
    // Default to Pune city center
    return { lat: 18.5204, lng: 73.8567 };
  }, [coordinates]);

  // Map coordinates projection to SVG percentage positions (0% to 100%)
  const projectedShops = useMemo(() => {
    // Determine coordinate bounds
    const lats = shops.map((s) => s.coordinates?.lat || 18.52);
    const lngs = shops.map((s) => s.coordinates?.lng || 73.85);

    const minLat = Math.min(...lats, mapCenter.lat - 0.05);
    const maxLat = Math.max(...lats, mapCenter.lat + 0.05);
    const minLng = Math.min(...lngs, mapCenter.lng - 0.06);
    const maxLng = Math.max(...lngs, mapCenter.lng + 0.06);

    const latSpan = maxLat - minLat || 0.1;
    const lngSpan = maxLng - minLng || 0.1;

    return shops.map((shop, idx) => {
      const sLat = shop.coordinates?.lat || (mapCenter.lat + (idx % 3 - 1) * 0.02);
      const sLng = shop.coordinates?.lng || (mapCenter.lng + (idx % 2 === 0 ? 0.025 : -0.025));

      // X: left to right (lng), Y: top to bottom (lat inverted)
      const xPercent = 12 + ((sLng - minLng) / lngSpan) * 76;
      const yPercent = 15 + ((maxLat - sLat) / latSpan) * 70;

      return {
        ...shop,
        mapX: Math.max(8, Math.min(92, xPercent)),
        mapY: Math.max(12, Math.min(88, yPercent))
      };
    });
  }, [shops, mapCenter]);

  // Calculate user position on projected map
  const userMapPos = useMemo(() => {
    return { x: 50, y: 52 };
  }, []);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMarkerClick = (shop, e) => {
    e.stopPropagation();
    setActiveShop(shop);
    if (onSelectShop) onSelectShop(shop);
  };

  const handleShopDetailsClick = (shop) => {
    navigate(`/shops/${shop.id || shop._id}`);
  };

  // Drag to pan map
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFindMe = () => {
    detectCurrentLocation()
      .then(() => {
        handleResetView();
      })
      .catch(() => {
        if (onOpenLocationModal) onOpenLocationModal();
      });
  };

  return (
    <div className="shop-map-container" id="shop-map-container">
      {/* Top Map Action Bar */}
      <div className="shop-map-action-bar">
        <div className="shop-map-status">
          <span className="shop-map-live-dot" />
          <span className="shop-map-area-name">
            {location ? `Exploring ${location}` : 'Exploring Nearby Local Area'}
          </span>
          <span className="shop-map-shop-count">
            ({shops.length} verified stores)
          </span>
        </div>

        <div className="shop-map-view-controls">
          <button
            type="button"
            className="shop-map-ctrl-btn"
            onClick={handleFindMe}
            title="Locate me"
            disabled={isLocating}
          >
            <LocateFixed size={16} className={isLocating ? 'spin-anim' : ''} />
            <span className="shop-map-btn-text">
              {isLocating ? 'Locating...' : 'My Location'}
            </span>
          </button>

          <button
            type="button"
            className={`shop-map-ctrl-btn ${mapTheme === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapTheme((t) => (t === 'modern' ? 'satellite' : 'modern'))}
            title="Toggle Map Style"
          >
            <Layers size={16} />
            <span className="shop-map-btn-text">
              {mapTheme === 'modern' ? 'Roads' : 'Satellite'}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Viewport */}
      <div
        className={`shop-map-viewport ${isDragging ? 'is-dragging' : ''} theme-${mapTheme}`}
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setActiveShop(null)}
      >
        <div
          className="shop-map-canvas"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
          }}
        >
          {/* Vector Map Canvas Roads & Topography */}
          <svg className="shop-map-svg-roads" viewBox="0 0 1000 650" preserveAspectRatio="none">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 140, 127, 0.05)" strokeWidth="1" />
              </pattern>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            <rect width="1000" height="650" fill="url(#grid)" />

            {/* River / Natural curve */}
            <path
              d="M 0,220 C 300,180 500,320 800,280 C 900,260 950,290 1000,310 L 1000,360 C 950,340 900,310 800,330 C 500,370 300,230 0,270 Z"
              fill="url(#riverGrad)"
            />

            {/* Major Arterial Highways */}
            <path
              d="M 50,0 L 400,320 L 750,420 L 1000,600"
              stroke="#e2e8f0"
              strokeWidth="24"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 50,0 L 400,320 L 750,420 L 1000,600"
              stroke="#cbd5e1"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
            />

            <path
              d="M 0,480 C 250,420 600,200 950,50"
              stroke="#e2e8f0"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 0,480 C 250,420 600,200 950,50"
              stroke="#f1f5f9"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />

            {/* Commercial Avenues & Local Streets */}
            <path d="M 120,100 L 880,100" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <path d="M 80,240 L 920,240" stroke="#f1f5f9" strokeWidth="10" fill="none" />
            <path d="M 100,380 L 900,380" stroke="#f1f5f9" strokeWidth="9" fill="none" />
            <path d="M 60,520 L 940,520" stroke="#f1f5f9" strokeWidth="8" fill="none" />

            <path d="M 220,50 L 220,600" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <path d="M 450,50 L 450,600" stroke="#f1f5f9" strokeWidth="11" fill="none" />
            <path d="M 680,50 L 680,600" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <path d="M 850,50 L 850,600" stroke="#f1f5f9" strokeWidth="8" fill="none" />

            {/* Commercial Area Zones */}
            <rect x="230" y="250" width="210" height="120" rx="8" fill="#e6f7f2" opacity="0.6" />
            <text x="245" y="275" fill="#0e8c7f" fontSize="12" fontWeight="700" opacity="0.7">
              CENTRAL COMMERCIAL MARKET
            </text>

            <rect x="460" y="110" width="210" height="120" rx="8" fill="#fef3c7" opacity="0.4" />
            <text x="475" y="135" fill="#d97706" fontSize="12" fontWeight="700" opacity="0.7">
              HIGH STREET & BAZAAR
            </text>
          </svg>

          {/* User Location Radar Pulse & Beacon */}
          <div
            className="shop-map-user-beacon"
            style={{ left: `${userMapPos.x}%`, top: `${userMapPos.y}%` }}
            title="Your current location"
          >
            <div className="shop-map-pulse-ring" />
            <div className="shop-map-user-dot" />
            <div className="shop-map-user-label">You Are Here</div>
          </div>

          {/* Shop Markers */}
          {projectedShops.map((shop) => {
            const isSelected = activeShop && (activeShop.id || activeShop._id) === (shop.id || shop._id);

            return (
              <button
                key={shop.id || shop._id}
                type="button"
                className={`shop-map-pin ${isSelected ? 'is-active' : ''}`}
                style={{ left: `${shop.mapX}%`, top: `${shop.mapY}%` }}
                onClick={(e) => handleMarkerClick(shop, e)}
                title={`${shop.name || shop.shopName} (${shop.category || shop.shopType})`}
              >
                <div className="shop-map-pin-icon-wrap">
                  <Store size={15} />
                </div>
                <div className="shop-map-pin-badge">
                  <span>{shop.name || shop.shopName}</span>
                  {shop.distance && <span className="pin-dist">{shop.distance}</span>}
                </div>
                <div className="shop-map-pin-arrow" />
              </button>
            );
          })}
        </div>

        {/* Floating Zoom Controls */}
        <div className="shop-map-floating-controls">
          <button
            type="button"
            className="shop-map-float-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            title="Zoom In"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            className="shop-map-float-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            title="Zoom Out"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            className="shop-map-float-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleResetView();
            }}
            title="Reset Map View"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Active Shop Popup / Preview Card */}
        {activeShop && (
          <div
            className="shop-map-popup-card"
            onClick={(e) => e.stopPropagation()}
            id={`map-popup-${activeShop.id || activeShop._id}`}
          >
            <div className="shop-map-popup-header">
              <div className="shop-map-popup-tags">
                <span className="shop-map-popup-category">
                  {activeShop.category || activeShop.shopType}
                </span>
                {activeShop.verified && (
                  <span className="shop-map-popup-verified">
                    <CheckCircle size={11} />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                className="shop-map-popup-close"
                onClick={() => setActiveShop(null)}
              >
                ✕
              </button>
            </div>

            <h4
              className="shop-map-popup-title"
              onClick={() => handleShopDetailsClick(activeShop)}
              style={{ cursor: 'pointer' }}
            >
              {activeShop.name || activeShop.shopName}
            </h4>

            <div className="shop-map-popup-meta">
              <div className="shop-map-popup-row">
                <MapPin size={13} className="shop-map-meta-icon" />
                <span>{activeShop.address || activeShop.area || 'Local Area'}</span>
              </div>
              {activeShop.distance && (
                <div className="shop-map-popup-row">
                  <Navigation size={13} className="shop-map-meta-icon" />
                  <span className="shop-map-distance-val">{activeShop.distance} away</span>
                </div>
              )}
              {activeShop.openingHours && (
                <div className="shop-map-popup-row">
                  <Clock size={13} className="shop-map-meta-icon" />
                  <span>{activeShop.openingHours}</span>
                </div>
              )}
            </div>

            <div className="shop-map-popup-footer">
              <div className="shop-map-popup-rating">
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span>{activeShop.rating || '4.8'}</span>
                {activeShop.reviewsCount && (
                  <span className="shop-map-rating-count">({activeShop.reviewsCount})</span>
                )}
              </div>

              <button
                type="button"
                className="shop-map-popup-btn"
                onClick={() => handleShopDetailsClick(activeShop)}
              >
                <span>Visit Store</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend / Bottom Bar */}
      <div className="shop-map-legend">
        <div className="shop-map-legend-item">
          <span className="shop-map-legend-icon legend-user" />
          <span>Your Location</span>
        </div>
        <div className="shop-map-legend-item">
          <span className="shop-map-legend-icon legend-store" />
          <span>Local Merchant</span>
        </div>
        <div className="shop-map-legend-item">
          <span className="shop-map-legend-icon legend-verified" />
          <span>GETSY Verified</span>
        </div>
      </div>
    </div>
  );
}
