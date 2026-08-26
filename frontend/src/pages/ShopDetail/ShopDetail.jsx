import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  CheckCircle,
  Star,
  Clock,
  Navigation,
  Share2,
  Package,
  Store,
  ShieldCheck,
  Truck,
  Check
} from 'lucide-react';
import { getShopById, getShops } from '../../services/shopService';
import { getProducts } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import ShopCard, { ShopImage } from '../../components/common/ShopCard';
import './ShopDetail.css';

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [directionsNotice, setDirectionsNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    window.scrollTo(0, 0);

    getShopById(id).then((foundShop) => {
      if (!isMounted) return;
      setShop(foundShop);

      if (foundShop) {
        // Fetch only products specifically belonging to this shop
        getProducts({ shopId: foundShop.id || foundShop._id }).then((shopProds) => {
          if (isMounted) {
            setProducts(shopProds || []);
          }
        });

        // Fetch nearby / related shops of similar or general categories
        getShops().then((allShops) => {
          if (isMounted) {
            const currentId = String(foundShop.id || foundShop._id).toLowerCase();
            const filtered = allShops.filter(
              (s) => String(s.id || s._id).toLowerCase() !== currentId
            ).slice(0, 3);
            setNearbyShops(filtered);
          }
        });
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetDirections = () => {
    setDirectionsNotice(true);
    setTimeout(() => setDirectionsNotice(false), 4000);

    if (shop) {
      const destination = shop.coordinates
        ? `${shop.coordinates.lat},${shop.coordinates.lng}`
        : encodeURIComponent(`${shop.name || shop.shopName}, ${shop.address || shop.area || ''}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  };

  if (loading) {
    return (
      <main className="shop-detail-page">
        <div className="container">
          <div className="shop-detail-loading-skeleton">
            <div className="shop-skeleton-hero" />
            <div className="shop-skeleton-grid" />
          </div>
        </div>
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="shop-detail-page">
        <div className="container">
          <div className="shop-not-found">
            <Store size={48} className="shop-not-found-icon" />
            <h2>Shop Not Found</h2>
            <p>The shop you are looking for does not exist or could not be loaded.</p>
            <Link to="/shops" className="shop-return-btn">
              Browse All Shops
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shop-detail-page" id="shop-detail-page">
      {/* Breadcrumbs & Actions Header */}
      <div className="shop-detail-top-nav">
        <div className="container">
          <div className="shop-top-nav-inner">
            <div className="shop-breadcrumbs">
              <Link to="/" className="shop-breadcrumb-link">Home</Link>
              <ChevronRight size={14} className="shop-breadcrumb-sep" />
              <Link to="/shops" className="shop-breadcrumb-link">Shops</Link>
              <ChevronRight size={14} className="shop-breadcrumb-sep" />
              <span className="shop-breadcrumb-current">{shop.name || shop.shopName}</span>
            </div>

            <div className="shop-top-actions">
              <button
                type="button"
                className="shop-back-link-btn"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="shop-share-btn"
                onClick={handleShare}
                title="Share store link"
              >
                {copied ? <Check size={16} color="var(--verified-green)" /> : <Share2 size={16} />}
                <span>{copied ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Storefront Banner */}
      <section className="shop-hero-banner">
        <div className="container">
          <div className="shop-hero-card">
            {/* Storefront Visual Image (Not product image) */}
            <div className="shop-hero-image-wrap">
              <ShopImage
                type={shop.imageType}
                name={shop.name || shop.shopName}
              />

              <div className="shop-hero-badge-overlay">
                <span className="shop-hero-category-tag">
                  {shop.category || shop.shopType}
                </span>
                {shop.verified && (
                  <span className="shop-hero-verified-tag">
                    <CheckCircle size={13} />
                    <span>GETSY Verified Merchant</span>
                  </span>
                )}
              </div>
            </div>

            <div className="shop-hero-details">
              <div className="shop-hero-title-row">
                <h1 className="shop-hero-title">{shop.name || shop.shopName}</h1>
                <div className="shop-hero-rating-badge">
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span className="shop-hero-rating-val">{shop.rating || '4.8'}</span>
                  {shop.reviewsCount && (
                    <span className="shop-hero-reviews-count">({shop.reviewsCount} reviews)</span>
                  )}
                </div>
              </div>

              <p className="shop-hero-desc">
                {shop.description || 'Welcome to our store! Browse our verified local inventory with in-store pickup available.'}
              </p>

              {/* Contact and Location Meta Grid */}
              <div className="shop-hero-meta-grid">
                <div className="shop-hero-meta-item">
                  <MapPin size={16} className="shop-meta-icon" />
                  <div className="shop-meta-text">
                    <strong>Location</strong>
                    <span>{shop.address || shop.area || 'Pune'}, {shop.city || 'India'}</span>
                  </div>
                </div>

                <div className="shop-hero-meta-item">
                  <Clock size={16} className="shop-meta-icon" />
                  <div className="shop-meta-text">
                    <strong>Opening Hours</strong>
                    <span>{shop.openingHours || 'Open Today • 9:30 AM - 9:00 PM'}</span>
                  </div>
                </div>

                {shop.distance && (
                  <div className="shop-hero-meta-item">
                    <Navigation size={16} className="shop-meta-icon" />
                    <div className="shop-meta-text">
                      <strong>Distance</strong>
                      <span className="shop-meta-dist-highlight">{shop.distance} from your location</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="shop-hero-actions">
                <button
                  type="button"
                  className="shop-directions-btn"
                  onClick={handleGetDirections}
                  id="shop-get-directions"
                >
                  <Navigation size={16} />
                  <span>Get Store Directions</span>
                </button>
              </div>

              {directionsNotice && (
                <div className="shop-directions-toast">
                  <CheckCircle size={15} />
                  <span>Opening directions in Google Maps...</span>
                </div>
              )}
            </div>
          </div>

          {/* Highlights bar */}
          <div className="shop-highlights-bar">
            <div className="shop-highlight-item">
              <ShieldCheck size={20} className="shop-highlight-icon" />
              <div>
                <h4>Verified Inventory</h4>
                <p>All products verified directly by store manager</p>
              </div>
            </div>
            <div className="shop-highlight-item">
              <Package size={20} className="shop-highlight-icon" />
              <div>
                <h4>In-Store Pickup</h4>
                <p>Reserve online & collect directly in store</p>
              </div>
            </div>
            <div className="shop-highlight-item">
              <Truck size={20} className="shop-highlight-icon" />
              <div>
                <h4>Fast Local Access</h4>
                <p>Shop locally and support neighborhood stores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Products Section */}
      <section className="shop-products-section">
        <div className="container">
          <div className="shop-products-header">
            <div>
              <h2 className="shop-products-title">Store Products & Inventory</h2>
              <p className="shop-products-subtitle">
                Available items from {shop.name || shop.shopName}
              </p>
            </div>
            <span className="shop-products-count-badge">
              {products.length} Products
            </span>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="shop-products-empty">
              <Package size={40} className="shop-products-empty-icon" />
              <h3>No products currently listed</h3>
              <p>This store has not added products to their online catalog yet. Please check back soon or visit in person.</p>
            </div>
          ) : (
            <div className="shop-products-grid">
              {products.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related / Nearby Shops Section */}
      {nearbyShops.length > 0 && (
        <section className="shop-nearby-section">
          <div className="container">
            <div className="shop-nearby-header">
              <div>
                <h2 className="shop-nearby-title">Other Nearby Merchants</h2>
                <p className="shop-nearby-subtitle">Explore more verified local stores in your area</p>
              </div>
              <Link to="/shops" className="shop-view-all-link">
                <span>View all shops</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            <div className="shop-nearby-grid">
              {nearbyShops.map((nearby) => (
                <ShopCard key={nearby.id || nearby._id} shop={nearby} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
