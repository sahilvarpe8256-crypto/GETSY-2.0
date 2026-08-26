import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Store,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Eye,
  Edit3,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProducts } from '../../services/productService';
import { getShopById } from '../../services/shopService';
import OwnerLayout from '../../components/owner/OwnerLayout';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const ownerShopId = user?.shopId || 'shop-1';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getShopById(ownerShopId),
      getProducts({ shopId: ownerShopId })
    ]).then(([shopData, prodsData]) => {
      if (isMounted) {
        setShop(shopData);
        setProducts(prodsData || []);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [ownerShopId]);

  // Derived metrics
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => {
    if (p.quantity !== undefined) return Number(p.quantity) > 5;
    const status = (p.stockStatus || '').toLowerCase();
    return status.includes('in stock') || (!status.includes('low') && !status.includes('out'));
  }).length;

  const lowStockCount = products.filter((p) => {
    if (p.quantity !== undefined) return Number(p.quantity) <= 5;
    const status = (p.stockStatus || '').toLowerCase();
    return status.includes('low') || status.includes('out');
  }).length;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <OwnerLayout
      activePageTitle="Owner Dashboard"
      actionButton={
        <Link to="/owner/products/new" className="owner-top-add-btn" id="owner-header-add-btn">
          <PlusCircle size={16} />
          <span>Add Product</span>
        </Link>
      }
    >
      <div className="owner-dashboard-container">
        {/* Welcome Banner */}
        <section className="owner-welcome-card">
          <div className="owner-welcome-content">
            <div className="owner-welcome-badge">
              <Sparkles size={14} />
              <span>Merchant Control Center</span>
            </div>
            <h2 className="owner-welcome-title">
              Welcome back, {user?.name || 'Store Owner'}!
            </h2>
            <p className="owner-welcome-sub">
              Manage your inventory for <strong>{shop?.name || user?.shopName || 'Your Store'}</strong>, track stock levels, and customize your storefront profile.
            </p>
          </div>

          <div className="owner-welcome-actions">
            <Link
              to={`/shops/${ownerShopId}`}
              className="owner-welcome-view-btn"
              id="owner-welcome-view-shop-btn"
            >
              <Eye size={16} />
              <span>View Live Storefront</span>
            </Link>
          </div>
        </section>

        {/* Metrics Overview Grid */}
        <section className="owner-metrics-grid">
          {/* Total Products */}
          <div className="owner-metric-card">
            <div className="owner-metric-icon-wrap icon-teal">
              <Boxes size={22} />
            </div>
            <div className="owner-metric-info">
              <span className="owner-metric-label">Total Products</span>
              <span className="owner-metric-val">{loading ? '-' : totalProducts}</span>
              <span className="owner-metric-note">Listed in your catalog</span>
            </div>
          </div>

          {/* In Stock Products */}
          <div className="owner-metric-card">
            <div className="owner-metric-icon-wrap icon-green">
              <CheckCircle size={22} />
            </div>
            <div className="owner-metric-info">
              <span className="owner-metric-label">Products In Stock</span>
              <span className="owner-metric-val">{loading ? '-' : inStockCount}</span>
              <span className="owner-metric-note">Available for local orders</span>
            </div>
          </div>

          {/* Low / Out of Stock */}
          <div className="owner-metric-card">
            <div className="owner-metric-icon-wrap icon-amber">
              <AlertTriangle size={22} />
            </div>
            <div className="owner-metric-info">
              <span className="owner-metric-label">Low / Out of Stock</span>
              <span className="owner-metric-val">{loading ? '-' : lowStockCount}</span>
              <span className="owner-metric-note">Need replenishment</span>
            </div>
          </div>

          {/* Store Status */}
          <div className="owner-metric-card">
            <div className="owner-metric-icon-wrap icon-blue">
              <Store size={22} />
            </div>
            <div className="owner-metric-info">
              <span className="owner-metric-label">Storefront Status</span>
              <span className="owner-metric-val status-badge-val">
                <span className="status-live-dot" />
                Active
              </span>
              <span className="owner-metric-note">{shop?.openingHours || 'Open today'}</span>
            </div>
          </div>
        </section>

        {/* Quick Action Tiles */}
        <section className="owner-quick-actions-section">
          <h3 className="owner-section-heading">Quick Actions</h3>
          <div className="owner-quick-grid">
            <Link to="/owner/products/new" className="owner-quick-card" id="quick-add-product">
              <div className="owner-quick-icon bg-primary-light">
                <PlusCircle size={20} color="var(--primary)" />
              </div>
              <div className="owner-quick-text">
                <strong>Add New Product</strong>
                <span>Upload items, set prices & manage inventory</span>
              </div>
              <ArrowRight size={16} className="owner-quick-arrow" />
            </Link>

            <Link to="/owner/products" className="owner-quick-card" id="quick-manage-products">
              <div className="owner-quick-icon bg-blue-light">
                <Package size={20} color="#0284c7" />
              </div>
              <div className="owner-quick-text">
                <strong>Manage Inventory</strong>
                <span>Edit stock, update prices, and review items</span>
              </div>
              <ArrowRight size={16} className="owner-quick-arrow" />
            </Link>

            <Link to="/owner/shop-profile" className="owner-quick-card" id="quick-edit-profile">
              <div className="owner-quick-icon bg-purple-light">
                <Store size={20} color="#7c3aed" />
              </div>
              <div className="owner-quick-text">
                <strong>Edit Shop Profile</strong>
                <span>Update hours, category tags & description</span>
              </div>
              <ArrowRight size={16} className="owner-quick-arrow" />
            </Link>

            <Link to={`/shops/${ownerShopId}`} className="owner-quick-card" id="quick-view-shop">
              <div className="owner-quick-icon bg-amber-light">
                <ExternalLink size={20} color="#d97706" />
              </div>
              <div className="owner-quick-text">
                <strong>View Customer Shop</strong>
                <span>See your store as shoppers see it</span>
              </div>
              <ArrowRight size={16} className="owner-quick-arrow" />
            </Link>
          </div>
        </section>

        {/* Recent Products Preview */}
        <section className="owner-recent-products-section">
          <div className="owner-section-header">
            <div>
              <h3 className="owner-section-heading">Your Store Inventory</h3>
              <p className="owner-section-sub">
                Items currently listed under {shop?.name || 'your store'}
              </p>
            </div>
            {products.length > 0 && (
              <Link to="/owner/products" className="owner-view-all-link">
                <span>View all ({products.length})</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="owner-loading-skeleton">
              <div className="owner-skeleton-bar" />
              <div className="owner-skeleton-bar" />
            </div>
          ) : products.length === 0 ? (
            <div className="owner-empty-products-card">
              <Package size={48} className="owner-empty-icon" />
              <h4>No products in your catalog yet</h4>
              <p>Add your first item to start showcasing products to local shoppers.</p>
              <Link to="/owner/products/new" className="owner-empty-btn">
                <PlusCircle size={16} />
                <span>Add Your First Product</span>
              </Link>
            </div>
          ) : (
            <div className="owner-products-table-wrap">
              <table className="owner-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th className="th-actions">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((prod) => (
                    <tr key={prod.id || prod._id}>
                      <td>
                        <div className="owner-table-product-cell">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="owner-table-prod-img"
                            />
                          ) : (
                            <div className="owner-table-prod-fallback">
                              <Package size={16} />
                            </div>
                          )}
                          <div className="owner-table-prod-meta">
                            <span className="owner-table-prod-name">{prod.name}</span>
                            <span className="owner-table-prod-sub">ID: {prod.id || prod._id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="owner-table-category-badge">
                          {prod.categoryLabel || prod.category}
                        </span>
                      </td>
                      <td>
                        <strong className="owner-table-price">
                          {formatPrice(prod.price)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`owner-table-stock-badge ${
                            (prod.stockStatus || '').toLowerCase().includes('low')
                              ? 'badge-low'
                              : (prod.stockStatus || '').toLowerCase().includes('out')
                              ? 'badge-out'
                              : 'badge-in'
                          }`}
                        >
                          {prod.stockStatus || 'In Stock'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <Link
                          to={`/owner/products/${prod.id || prod._id}/edit`}
                          className="owner-table-edit-btn"
                          title="Edit product"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </OwnerLayout>
  );
}
