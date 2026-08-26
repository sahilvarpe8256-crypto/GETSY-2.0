import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Heart,
  Navigation,
  CheckCircle2,
  Share2,
  Star,
  Check,
  AlertCircle,
  PackageCheck,
  Store
} from 'lucide-react';
import { getProductById, getProducts } from '../../services/productService';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation } from '../../context/LocationContext';
import ProductReviews from '../../components/product/ProductReviews';
import ProductCard from '../../components/product/ProductCard';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { location } = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [copied, setCopied] = useState(false);
  const [directionsNotice, setDirectionsNotice] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    window.scrollTo(0, 0);

    getProductById(id).then((found) => {
      if (!isMounted) return;
      setProduct(found);
      if (found && found.availableSizes && found.availableSizes.length > 0) {
        setSelectedSize(found.availableSizes[0]);
      }

      if (found) {
        // Fetch related products
        getProducts({ category: found.category }).then((list) => {
          if (isMounted) {
            setRelatedProducts(
              list.filter((p) => (p.id || p._id) !== (found.id || found._id)).slice(0, 3)
            );
          }
        });
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isLiked = product ? isInWishlist(product.id || product._id) : false;

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDirections = () => {
    setDirectionsNotice(true);
    setTimeout(() => setDirectionsNotice(false), 5000);
  };

  const formatPrice = (val) => {
    if (!val && val !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <main className="product-page">
        <div className="container">
          <div className="product-skeleton-detail">
            <div className="product-skeleton-image" />
            <div className="product-skeleton-info" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page">
        <div className="container">
          <div className="product-not-found">
            <AlertCircle size={48} className="product-not-found-icon" />
            <h2>Product Not Found</h2>
            <p>The product you are looking for does not exist or has been removed.</p>
            <button
              type="button"
              className="product-back-btn"
              onClick={() => navigate('/categories')}
            >
              Browse All Categories
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="product-page" id="product-page">
      <div className="container">
        {/* Breadcrumb Navigation matching product page.png */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <button
            type="button"
            className="breadcrumb-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link to="/categories" className="breadcrumb-link">
            Discover
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Two-Column Product Detail Layout */}
        <div className="product-detail-layout">
          {/* Left Column: Product Visual */}
          <div className="product-media-column">
            <div className="product-image-container">
              {!imgError && product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-main-image"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="product-main-fallback">
                  <span className="fallback-tag">{product.category}</span>
                </div>
              )}

              {/* Verified badge top-left matching screenshot */}
              <div className="product-image-verified-badge">
                <CheckCircle2 size={15} />
                <span>Verified</span>
              </div>

              {/* Share button overlay */}
              <button
                type="button"
                className="product-image-share-btn"
                onClick={handleShare}
                title={copied ? 'Link copied!' : 'Share product'}
                aria-label="Share product"
              >
                {copied ? <Check size={16} color="#16a34a" /> : <Share2 size={16} />}
              </button>
            </div>
          </div>

          {/* Right Column: Product Information */}
          <div className="product-info-column">
            {/* Shop Name in uppercase teal */}
            <div className="product-shop-header">
              {product.shopId ? (
                <Link to={`/shops/${product.shopId}`} className="product-shop-tag product-shop-link">
                  <Store size={13} />
                  <span>{product.shopName ? product.shopName.toUpperCase() : 'GETSY VERIFIED STORE'}</span>
                </Link>
              ) : (
                <span className="product-shop-tag">
                  {product.shopName ? product.shopName.toUpperCase() : 'GETSY VERIFIED STORE'}
                </span>
              )}
              <div className="product-shop-distance">
                <MapPin size={13} />
                <span>{product.shopLocation || location || 'Sangamner'} ({product.distance || '1.2 km'})</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="product-title" id="product-title">
              {product.name}
            </h1>

            {/* Price and Stock Badge Row */}
            <div className="product-price-stock-row">
              <div className="product-price-group">
                <span className="product-current-price">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="product-original-price">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <span
                className={`product-stock-pill ${
                  product.stockStatus && product.stockStatus.toLowerCase().includes('low')
                    ? 'product-stock-pill--low'
                    : 'product-stock-pill--in'
                }`}
              >
                {product.stockStatus || 'In Stock'}
              </span>
            </div>

            {/* Size / Variant Selector if available */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="product-size-section">
                <label className="product-section-label">SELECT SIZE</label>
                <div className="product-size-pills">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`size-pill ${selectedSize === size ? 'size-pill--active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Wishlist & Directions */}
            <div className="product-actions-group">
              {/* Wishlist Button matching screenshot */}
              <button
                type="button"
                className={`product-wishlist-btn ${isLiked ? 'product-wishlist-btn--active' : ''}`}
                onClick={handleWishlistToggle}
                id="product-wishlist-toggle-btn"
              >
                <Heart
                  size={18}
                  fill={isLiked ? '#ef4444' : 'none'}
                  color={isLiked ? '#ef4444' : 'currentColor'}
                />
                <span>{isLiked ? 'In Your Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {/* Visit Shop / Directions CTA Button matching screenshot */}
              <button
                type="button"
                className="product-directions-btn"
                onClick={handleDirections}
                id="product-directions-btn"
              >
                <Navigation size={18} />
                <span>Visit Shop / Directions</span>
              </button>
            </div>

            {/* Directions Alert Notification */}
            {directionsNotice && (
              <div className="product-directions-card">
                <Store size={20} className="directions-card-icon" />
                <div className="directions-card-content">
                  <strong>{product.shopName || 'Partner Shop'}</strong>
                  <p>{product.shopLocation || 'Station Road, Sangamner'}</p>
                  <span className="directions-eta">Estimated travel: 5–8 mins away</span>
                </div>
              </div>
            )}

            {/* Merchant Trust Badges matching screenshot */}
            <div className="product-merchant-trust-box">
              <div className="trust-item">
                <div className="trust-icon-circle">
                  <CheckCircle2 size={16} />
                </div>
                <span>Verified Local Merchant</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon-circle">
                  <PackageCheck size={16} />
                </div>
                <span>In-Store Pickup Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section matching screenshot */}
        <section className="product-description-section" id="product-description">
          <h2 className="product-section-heading">Product Description</h2>
          <div className="product-description-card">
            <p>{product.description}</p>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <ProductReviews
          reviews={product.reviews || []}
          rating={product.rating || 4.8}
          reviewsCount={product.reviewsCount || 0}
        />

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <section className="product-related-section">
            <h2 className="product-section-heading">More from this Category</h2>
            <div className="product-related-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id || rel._id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
