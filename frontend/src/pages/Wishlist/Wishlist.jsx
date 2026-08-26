import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { getProductById } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all(wishlistItems.map((id) => getProductById(id))).then((list) => {
      if (isMounted) {
        setProducts(list.filter(Boolean));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [wishlistItems]);

  return (
    <main className="wishlist-page" id="wishlist-page">
      <div className="container">
        {/* Page Header */}
        <div className="wishlist-header">
          <div>
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="wishlist-subtitle">
              Products you saved from verified local shops in your area.
            </p>
          </div>
          <span className="wishlist-counter-badge">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </span>
        </div>

        {/* Guest prompt notice */}
        {!isAuthenticated && (
          <div className="wishlist-guest-banner">
            <div className="guest-banner-text">
              <Lock size={18} className="guest-banner-icon" />
              <span>Sign in to sync your wishlist across all your devices and local visits.</span>
            </div>
            <button
              type="button"
              className="guest-login-btn"
              onClick={() => openAuthModal({ mode: 'login' })}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="wishlist-loading-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="product-skeleton-card" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="wishlist-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id || p._id}
                product={p}
                showDelete={true}
                onDelete={(id) => removeFromWishlist(id)}
              />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty-card" id="wishlist-empty">
            <div className="wishlist-empty-heart">
              <Heart size={44} />
            </div>
            <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
            <p className="wishlist-empty-desc">
              Discover unique local products from neighborhood merchants and tap the heart icon to save them here.
            </p>
            <Link to="/categories" className="wishlist-explore-btn">
              <ShoppingBag size={18} />
              <span>Explore Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
