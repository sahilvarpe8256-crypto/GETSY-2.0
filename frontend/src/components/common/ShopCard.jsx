import { MapPin, CheckCircle, Star, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ShopCard.css';

export function ShopImage({ type, name }) {
  if (type === 'footwear') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#182330" />
        <rect x="25" y="20" width="350" height="200" rx="6" fill="#1e293b" />
        {/* Store Signboard */}
        <rect x="35" y="30" width="330" height="44" fill="#0f172a" rx="4" stroke="#334155" strokeWidth="1" />
        <text x="50" y="58" fill="#10b981" fontSize="15" fontWeight="800" letterSpacing="2">
          {name ? name.toUpperCase().slice(0, 24) : 'FOOTWEAR BOUTIQUE'}
        </text>
        {/* Glass display showroom */}
        <rect x="40" y="86" width="320" height="124" fill="#f8fafc" rx="4" />
        {/* Store display stands */}
        <rect x="60" y="145" width="80" height="50" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="160" y="130" width="80" height="65" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="260" y="145" width="80" height="50" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        {/* Footwear silhouettes on display */}
        <path d="M75 140 C85 130, 110 130, 125 140 C130 142, 135 145, 120 145 L70 145 Z" fill="#0e8c7f" />
        <path d="M175 125 C185 115, 210 115, 225 125 C230 127, 235 130, 220 130 L170 130 Z" fill="#e8922d" />
        <path d="M275 140 C285 130, 310 130, 325 140 C330 142, 335 145, 320 145 L270 145 Z" fill="#3b82f6" />
        {/* Window reflection */}
        <line x1="40" y1="86" x2="160" y2="210" stroke="#ffffff" strokeWidth="3" opacity="0.6" />
        <line x1="200" y1="86" x2="320" y2="210" stroke="#ffffff" strokeWidth="3" opacity="0.6" />
        {/* Pavement */}
        <rect y="220" width="400" height="30" fill="#0f172a" />
      </svg>
    );
  }

  if (type === 'ornaments') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#201311" />
        <rect x="25" y="20" width="350" height="200" rx="6" fill="#361a15" />
        {/* Gold Trim Store Sign */}
        <rect x="35" y="30" width="330" height="44" fill="#1b0c09" rx="4" stroke="#f59e0b" strokeWidth="1" />
        <text x="50" y="58" fill="#f59e0b" fontSize="15" fontWeight="800" letterSpacing="2">
          {name ? name.toUpperCase().slice(0, 24) : 'JEWELLERY & ORNAMENTS'}
        </text>
        {/* Showroom Interior Warm Chandelier Glow */}
        <rect x="40" y="86" width="320" height="124" fill="#1c1917" rx="4" />
        {/* Chandelier */}
        <circle cx="200" cy="98" r="8" fill="#fbbf24" opacity="0.9" />
        <line x1="200" y1="86" x2="200" y2="98" stroke="#f59e0b" strokeWidth="2" />
        <polygon points="185,106 215,106 200,98" fill="#fef08a" opacity="0.7" />
        {/* Velvet Display Pedestals */}
        <rect x="65" y="140" width="70" height="55" rx="4" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
        <rect x="165" y="130" width="70" height="65" rx="4" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
        <rect x="265" y="140" width="70" height="55" rx="4" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
        {/* Jewelry Silhouettes */}
        <circle cx="100" cy="130" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="200" cy="120" r="12" fill="none" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="200" cy="122" r="4" fill="#ef4444" />
        <circle cx="300" cy="130" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" />
        {/* Pavement */}
        <rect y="220" width="400" height="30" fill="#1c1917" />
      </svg>
    );
  }

  if (type === 'clothing') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#182330" />
        <rect x="25" y="20" width="350" height="200" rx="6" fill="#2d3748" />
        <rect x="35" y="30" width="330" height="42" fill="#1a202c" rx="4" />
        <text x="50" y="56" fill="#e2e8f0" fontSize="15" fontWeight="700" letterSpacing="2">
          {name ? name.toUpperCase().slice(0, 24) : 'PUNE TRENDS'}
        </text>
        {/* Storefront large glass windows with warm glow */}
        <rect x="40" y="82" width="150" height="128" fill="#fed7aa" opacity="0.85" rx="2" />
        <rect x="210" y="82" width="150" height="128" fill="#fef08a" opacity="0.8" rx="2" />
        {/* Window frames */}
        <line x1="115" y1="82" x2="115" y2="210" stroke="#4a5568" strokeWidth="3" />
        <line x1="285" y1="82" x2="285" y2="210" stroke="#4a5568" strokeWidth="3" />
        {/* Mannequins in window */}
        <ellipse cx="90" cy="118" rx="10" ry="12" fill="#334155" />
        <path d="M80 133 L100 133 L98 175 L82 175 Z" fill="#0e8c7f" />
        <ellipse cx="140" cy="118" rx="10" ry="12" fill="#334155" />
        <path d="M130 133 L150 133 L152 175 L128 175 Z" fill="#e8922d" />
        <ellipse cx="255" cy="118" rx="10" ry="12" fill="#334155" />
        <path d="M245 133 L265 133 L263 175 L247 175 Z" fill="#3b82f6" />
        <ellipse cx="310" cy="118" rx="10" ry="12" fill="#334155" />
        <path d="M300 133 L320 133 L318 175 L302 175 Z" fill="#ec4899" />
        <rect y="220" width="400" height="30" fill="#0f172a" />
      </svg>
    );
  }

  if (type === 'hardware') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#1e293b" />
        <rect x="25" y="20" width="350" height="200" rx="6" fill="#334155" />
        <rect x="35" y="30" width="330" height="42" fill="#0f172a" rx="4" />
        <text x="50" y="56" fill="#38bdf8" fontSize="15" fontWeight="800" letterSpacing="2">
          {name ? name.toUpperCase().slice(0, 24) : 'HARDWARE TRADERS'}
        </text>
        <rect x="40" y="82" width="320" height="128" fill="#e2e8f0" rx="4" />
        {/* Tool racks and machinery */}
        <rect x="55" y="95" width="85" height="100" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
        <line x1="65" y1="115" x2="130" y2="115" stroke="#475569" strokeWidth="4" />
        <line x1="65" y1="135" x2="130" y2="135" stroke="#e8922d" strokeWidth="6" />
        <line x1="65" y1="155" x2="130" y2="155" stroke="#0e8c7f" strokeWidth="5" />
        {/* Workshop Gear */}
        <circle cx="210" cy="140" r="28" fill="none" stroke="#0e8c7f" strokeWidth="7" strokeDasharray="10 5" />
        <circle cx="210" cy="140" r="10" fill="#0e8c7f" />
        <rect x="260" y="110" width="80" height="75" rx="4" fill="#334155" />
        <polygon points="280,160 320,160 300,125" fill="#f59e0b" />
        <rect y="220" width="400" height="30" fill="#0f172a" />
      </svg>
    );
  }

  if (type === 'furniture') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#f1f5f9" />
        <ellipse cx="100" cy="25" rx="35" ry="8" fill="#fef08a" opacity="0.9" />
        <ellipse cx="200" cy="25" rx="35" ry="8" fill="#fef08a" opacity="0.9" />
        <ellipse cx="300" cy="25" rx="35" ry="8" fill="#fef08a" opacity="0.9" />
        <rect y="35" width="400" height="100" fill="#e2e8f0" />
        <line x1="0" y1="135" x2="400" y2="135" stroke="#cbd5e1" strokeWidth="2" />
        <polygon points="0,135 400,135 400,250 0,250" fill="#d6d3d1" />
        <rect x="30" y="145" width="120" height="50" rx="8" fill="#78350f" />
        <rect x="35" y="130" width="110" height="25" rx="6" fill="#92400e" />
        <rect x="25" y="140" width="20" height="55" rx="4" fill="#5c2608" />
        <ellipse cx="200" cy="185" rx="45" ry="18" fill="#451a03" />
        <ellipse cx="200" cy="180" rx="42" ry="15" fill="#78350f" />
        <rect x="250" y="145" width="120" height="50" rx="8" fill="#44403c" />
        <rect x="255" y="130" width="110" height="25" rx="6" fill="#57534e" />
        <rect x="355" y="140" width="20" height="55" rx="4" fill="#292524" />
      </svg>
    );
  }

  if (type === 'grocery') {
    return (
      <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#0f172a" />
        <polygon points="150,0 250,0 220,50 180,50" fill="#fef08a" opacity="0.9" />
        <polygon points="180,110 220,110 320,250 80,250" fill="#cbd5e1" />
        <polygon points="0,0 150,50 180,110 80,250 0,250" fill="#1e293b" />
        <line x1="20" y1="80" x2="160" y2="80" stroke="#f59e0b" strokeWidth="6" />
        <line x1="15" y1="120" x2="170" y2="120" stroke="#ef4444" strokeWidth="8" />
        <line x1="10" y1="160" x2="180" y2="160" stroke="#10b981" strokeWidth="10" />
        <line x1="5" y1="200" x2="190" y2="200" stroke="#3b82f6" strokeWidth="12" />
        <polygon points="400,0 250,50 220,110 320,250 400,250" fill="#1e293b" />
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
        <rect width="400" height="250" fill="#0f172a" />
        <rect x="20" y="20" width="360" height="50" rx="4" fill="#1d4ed8" />
        <rect x="25" y="25" width="105" height="40" fill="#1e40af" />
        <text x="32" y="48" fill="#ffffff" fontSize="10" fontWeight="700">MULTI-BRAND</text>
        <rect x="135" y="25" width="130" height="40" fill="#172554" />
        <text x="145" y="49" fill="#ffffff" fontSize="12" fontWeight="800" letterSpacing="1">
          {name ? name.toUpperCase().slice(0, 16) : 'NASHIK DIGITAL'}
        </text>
        <rect x="270" y="25" width="105" height="40" fill="#1e40af" />
        <text x="285" y="48" fill="#ffffff" fontSize="11" fontWeight="700">STORE</text>
        <rect x="25" y="75" width="350" height="145" fill="#f8fafc" />
        <rect x="40" y="140" width="90" height="60" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="65" y="125" width="40" height="25" rx="2" fill="#0f172a" />
        <rect x="155" y="140" width="90" height="60" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="180" y="120" width="40" height="25" rx="2" fill="#0f172a" />
        <rect x="270" y="140" width="90" height="60" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="295" y="125" width="40" height="25" rx="2" fill="#0f172a" />
        <line x1="25" y1="75" x2="160" y2="220" stroke="#ffffff" strokeWidth="4" opacity="0.6" />
        <line x1="180" y1="75" x2="315" y2="220" stroke="#ffffff" strokeWidth="4" opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg className="shop-card-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="250" fill="#0f172a" />
      <rect x="20" y="20" width="360" height="50" rx="4" fill="#0e8c7f" />
      <text x="35" y="50" fill="#ffffff" fontSize="14" fontWeight="800" letterSpacing="1">
        {name ? name.toUpperCase().slice(0, 24) : 'LOCAL STORE'}
      </text>
      <rect x="25" y="75" width="350" height="145" fill="#f8fafc" />
      <circle cx="100" cy="140" r="28" fill="#0e8c7f" opacity="0.2" />
      <circle cx="200" cy="140" r="28" fill="#e8922d" opacity="0.2" />
      <circle cx="300" cy="140" r="28" fill="#3b82f6" opacity="0.2" />
    </svg>
  );
}

export default function ShopCard({ shop, onClick }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(shop);
    } else {
      navigate(`/shops/${shop.id || shop._id}`);
    }
  };

  return (
    <div
      className="shop-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick(e)}
      id={`shop-card-${shop.id || shop._id}`}
    >
      {/* Image area */}
      <div className="shop-card-image">
        <ShopImage
          type={shop.imageType}
          name={shop.name || shop.shopName}
        />

        {/* Category badge */}
        <span className="shop-card-category-badge">
          {shop.category || shop.shopType}
        </span>

        {/* Verified badge */}
        {shop.verified && (
          <span className="shop-card-verified">
            <CheckCircle size={13} />
            <span>Verified</span>
          </span>
        )}
      </div>

      {/* Info */}
      <div className="shop-card-info">
        <h3 className="shop-card-name">{shop.name || shop.shopName}</h3>

        <div className="shop-card-location">
          <div className="shop-card-address">
            <MapPin size={13} />
            <span>{shop.address || shop.area || 'Pune'}</span>
          </div>
          {shop.distance && (
            <span className="shop-card-distance">{shop.distance}</span>
          )}
        </div>

        {/* Rating and item stats */}
        <div className="shop-card-stats">
          <div className="shop-card-rating">
            <Star size={13} className="shop-card-star" fill="#f59e0b" />
            <span>{shop.rating || '4.8'}</span>
            {shop.reviewsCount && (
              <span className="shop-card-reviews-count">({shop.reviewsCount})</span>
            )}
          </div>

          <div className="shop-card-items">
            <Package size={13} />
            <span>{shop.itemsCount || '20+'} items</span>
          </div>
        </div>

        <div className="shop-card-action-row">
          <span className="shop-card-view-btn">
            <span>View Store</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
