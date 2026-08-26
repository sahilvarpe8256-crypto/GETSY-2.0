import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Eye, Share2, Star, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

export default function ProductCard({ product, showDelete = false, onDelete }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isLiked = isInWishlist(product.id || product._id);

  const handleCardClick = () => {
    navigate(`/product/${product.id || product._id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id || product._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStockBadgeClass = (status, stock) => {
    if (status && status.toLowerCase().includes('low')) return 'product-badge--low';
    if (stock !== undefined && stock <= 2 && stock > 0) return 'product-badge--low';
    if (stock === 0) return 'product-badge--out';
    return 'product-badge--in';
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      id={`product-card-${product.id || product._id}`}
    >
      {/* Image Container */}
      <div className="product-card-image-wrap">
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-card-fallback-svg">
            <div className="fallback-pattern" />
            <span className="fallback-category">{product.category}</span>
          </div>
        )}

        {/* Stock Badge */}
        <span className={`product-card-badge ${getStockBadgeClass(product.stockStatus, product.stock)}`}>
          {product.stockStatus || (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
        </span>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          className={`product-card-heart ${isLiked ? 'product-card-heart--active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isLiked ? 'In Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            size={18}
            fill={isLiked ? '#ef4444' : 'none'}
            color={isLiked ? '#ef4444' : '#4b5563'}
          />
        </button>
      </div>

      {/* Info Container */}
      <div className="product-card-body">
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-shop">
          <MapPin size={13} className="product-card-shop-icon" />
          <span className="product-card-shop-name">
            {product.shopLocation || product.shopName || 'Local Partner Store'}
          </span>
        </div>

        <div className="product-card-price-row">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          {product.rating && (
            <div className="product-card-rating">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="product-card-view-btn"
            onClick={handleCardClick}
            id={`view-details-${product.id || product._id}`}
          >
            <Eye size={15} />
            <span>View Details</span>
          </button>

          {showDelete ? (
            <button
              type="button"
              className="product-card-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(product.id || product._id);
              }}
              title="Remove"
              aria-label="Remove item"
            >
              <Heart size={16} fill="#ef4444" color="#ef4444" />
            </button>
          ) : (
            <button
              type="button"
              className="product-card-icon-btn"
              onClick={handleShareClick}
              title={copied ? 'Link Copied!' : 'Share Product'}
              aria-label="Share product"
            >
              {copied ? <Check size={15} color="#16a34a" /> : <Share2 size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
