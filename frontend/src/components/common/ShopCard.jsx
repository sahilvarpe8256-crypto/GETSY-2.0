import { MapPin, CheckCircle, Star, Package } from 'lucide-react';
import './ShopCard.css';

function ShopImage({ type }) {
  if (type === 'clothing') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Night sky backdrop */}
        <rect width="400" height="250" fill="#182330" />
        {/* Modern building facade */}
        <rect x="30" y="20" width="340" height="200" rx="4" fill="#2d3748" />
        <rect x="40" y="30" width="320" height="40" fill="#1a202c" />
        <text x="55" y="55" fill="#e2e8f0" fontSize="16" fontWeight="700" letterSpacing="2">PUNE TRENDS</text>
        {/* Storefront large glass windows with warm glow */}
        <rect x="45" y="80" width="145" height="130" fill="#fed7aa" opacity="0.85" />
        <rect x="210" y="80" width="145" height="130" fill="#fef08a" opacity="0.8" />
        {/* Window frames */}
        <line x1="117" y1="80" x2="117" y2="210" stroke="#4a5568" strokeWidth="3" />
        <line x1="282" y1="80" x2="282" y2="210" stroke="#4a5568" strokeWidth="3" />
        <line x1="45" y1="140" x2="190" y2="140" stroke="#4a5568" strokeWidth="2" />
        <line x1="210" y1="140" x2="355" y2="140" stroke="#4a5568" strokeWidth="2" />
        {/* Mannequins / clothing displays in window */}
        <ellipse cx="90" cy="120" rx="10" ry="12" fill="#334155" />
        <path d="M80 135 L100 135 L98 175 L82 175 Z" fill="#0e8c7f" />
        <ellipse cx="145" cy="120" rx="10" ry="12" fill="#334155" />
        <path d="M135 135 L155 135 L158 175 L132 175 Z" fill="#e8922d" />
        <ellipse cx="255" cy="120" rx="10" ry="12" fill="#334155" />
        <path d="M245 135 L265 135 L263 175 L247 175 Z" fill="#3b82f6" />
        <ellipse cx="310" cy="120" rx="10" ry="12" fill="#334155" />
        <path d="M300 135 L320 135 L318 175 L302 175 Z" fill="#ec4899" />
        {/* Pavement / Street */}
        <rect y="220" width="400" height="30" fill="#0f172a" />
      </svg>
    );
  }

  if (type === 'furniture') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bright showroom ceiling & walls */}
        <rect width="400" height="250" fill="#f1f5f9" />
        {/* Recessed showroom ceiling lights */}
        <ellipse cx="100" cy="25" rx="35" ry="8" fill="#fef08a" opacity="0.9" />
        <ellipse cx="200" cy="25" rx="35" ry="8" fill="#fef08a" opacity="0.9" />
        <ellipse cx="300" cy="25" rx="35" ry="8" fill="#fef08a" opacity="0.9" />
        {/* Showroom back wall */}
        <rect y="35" width="400" height="100" fill="#e2e8f0" />
        <line x1="0" y1="135" x2="400" y2="135" stroke="#cbd5e1" strokeWidth="2" />
        {/* Polished showroom floor */}
        <polygon points="0,135 400,135 400,250 0,250" fill="#d6d3d1" />
        {/* Luxury Sofas & Seating */}
        {/* Left sectional sofa */}
        <rect x="30" y="145" width="120" height="50" rx="8" fill="#78350f" />
        <rect x="35" y="130" width="110" height="25" rx="6" fill="#92400e" />
        <rect x="25" y="140" width="20" height="55" rx="4" fill="#5c2608" />
        {/* Center coffee table */}
        <ellipse cx="200" cy="185" rx="45" ry="18" fill="#451a03" />
        <ellipse cx="200" cy="180" rx="42" ry="15" fill="#78350f" />
        {/* Right sofa & lounge chair */}
        <rect x="250" y="145" width="120" height="50" rx="8" fill="#44403c" />
        <rect x="255" y="130" width="110" height="25" rx="6" fill="#57534e" />
        <rect x="355" y="140" width="20" height="55" rx="4" fill="#292524" />
      </svg>
    );
  }

  if (type === 'grocery') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Supermarket interior aisle */}
        <rect width="400" height="250" fill="#0f172a" />
        {/* Aisle ceiling lights in perspective */}
        <polygon points="150,0 250,0 220,50 180,50" fill="#fef08a" opacity="0.9" />
        {/* Floor aisle perspective */}
        <polygon points="180,110 220,110 320,250 80,250" fill="#cbd5e1" />
        {/* Left grocery shelves */}
        <polygon points="0,0 150,50 180,110 80,250 0,250" fill="#1e293b" />
        {/* Shelves rows left */}
        <line x1="20" y1="80" x2="160" y2="80" stroke="#f59e0b" strokeWidth="6" />
        <line x1="15" y1="120" x2="170" y2="120" stroke="#ef4444" strokeWidth="8" />
        <line x1="10" y1="160" x2="180" y2="160" stroke="#10b981" strokeWidth="10" />
        <line x1="5" y1="200" x2="190" y2="200" stroke="#3b82f6" strokeWidth="12" />
        {/* Right grocery shelves */}
        <polygon points="400,0 250,50 220,110 320,250 400,250" fill="#1e293b" />
        {/* Shelves rows right */}
        <line x1="240" y1="80" x2="380" y2="80" stroke="#10b981" strokeWidth="6" />
        <line x1="230" y1="120" x2="385" y2="120" stroke="#f59e0b" strokeWidth="8" />
        <line x1="220" y1="160" x2="390" y2="160" stroke="#ef4444" strokeWidth="10" />
        <line x1="210" y1="200" x2="395" y2="200" stroke="#8b5cf6" strokeWidth="12" />
      </svg>
    );
  }

  if (type === 'electronics') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Storefront backdrop */}
        <rect width="400" height="250" fill="#0f172a" />
        {/* Blue tech signboards matching screenshot */}
        <rect x="20" y="20" width="360" height="50" rx="4" fill="#1d4ed8" />
        <rect x="25" y="25" width="105" height="40" fill="#1e40af" />
        <text x="32" y="48" fill="#ffffff" fontSize="10" fontWeight="700">MULTI-BRAND</text>
        <rect x="135" y="25" width="130" height="40" fill="#172554" />
        <text x="145" y="49" fill="#ffffff" fontSize="12" fontWeight="800" letterSpacing="1">NASHIK DIGITAL</text>
        <rect x="270" y="25" width="105" height="40" fill="#1e40af" />
        <text x="285" y="48" fill="#ffffff" fontSize="11" fontWeight="700">SAMSUNG</text>
        {/* Glass display showroom area */}
        <rect x="25" y="75" width="350" height="145" fill="#f8fafc" />
        {/* Display counters */}
        <rect x="40" y="140" width="90" height="60" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="65" y="125" width="40" height="25" rx="2" fill="#0f172a" />
        <rect x="155" y="140" width="90" height="60" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="180" y="120" width="40" height="25" rx="2" fill="#0f172a" />
        <rect x="270" y="140" width="90" height="60" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="295" y="125" width="40" height="25" rx="2" fill="#0f172a" />
        {/* Glass reflections */}
        <line x1="25" y1="75" x2="160" y2="220" stroke="#ffffff" strokeWidth="4" opacity="0.6" />
        <line x1="180" y1="75" x2="315" y2="220" stroke="#ffffff" strokeWidth="4" opacity="0.6" />
      </svg>
    );
  }

  return <div className="shop-card-fallback-image" />;
}

export default function ShopCard({ shop, onClick }) {
  return (
    <div
      className="shop-card"
      onClick={() => onClick && onClick(shop)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick(shop)}
      id={`shop-card-${shop.id}`}
    >
      {/* Image area with storefront visual */}
      <div className="shop-card-image">
        <ShopImage type={shop.imageType} />

        {/* Category badge — top left */}
        <span className="shop-card-category-badge">{shop.category}</span>

        {/* Verified badge — top right */}
        {shop.verified && (
          <span className="shop-card-verified">
            <CheckCircle size={13} />
            <span>Verified</span>
          </span>
        )}
      </div>

      {/* Info */}
      <div className="shop-card-info">
        <h3 className="shop-card-name">{shop.name}</h3>
        <div className="shop-card-location">
          <div className="shop-card-address">
            <MapPin size={13} />
            <span>{shop.address}</span>
          </div>
          <span className="shop-card-distance">{shop.distance}</span>
        </div>

        {/* Optional rating & items stats row (from footer.png reference) */}
        {(shop.rating || shop.itemsCount) && (
          <div className="shop-card-stats">
            {shop.rating && (
              <div className="shop-card-rating">
                <Star size={13} className="shop-card-star" fill="#f59e0b" />
                <span>{shop.rating}</span>
              </div>
            )}
            {shop.itemsCount && (
              <div className="shop-card-items">
                <Package size={13} />
                <span>{shop.itemsCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


