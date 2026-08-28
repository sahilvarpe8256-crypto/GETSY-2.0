import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, deleteProduct } from '../../services/productService';
import OwnerLayout from '../../components/owner/OwnerLayout';
import './OwnerProducts.css';

export default function OwnerProducts() {
  const { user, token } = useAuth();
  const ownerShopId = user?.shopId || 'shop-1';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    getProducts({ shopId: ownerShopId }).then((data) => {
      setProducts(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
  }, [ownerShopId]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Stock status filter
      if (stockFilter !== 'all') {
        const s = (p.stockStatus || '').toLowerCase();
        if (stockFilter === 'in_stock' && (s.includes('low') || s.includes('out'))) return false;
        if (stockFilter === 'low_stock' && !s.includes('low')) return false;
        if (stockFilter === 'out_of_stock' && !s.includes('out')) return false;
      }

      return true;
    });
  }, [products, searchQuery, stockFilter]);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);

    const res = await deleteProduct(productToDelete.id || productToDelete._id, token);
    if (res.success) {
      setActionNotice(`Product "${productToDelete.name}" was removed successfully.`);
      setTimeout(() => setActionNotice(null), 3500);
      setProductToDelete(null);
      loadProducts();
    }
    setDeleteLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <OwnerLayout
      activePageTitle="Product Management"
      actionButton={
        <Link to="/owner/products/new" className="owner-top-add-btn" id="owner-add-product-btn">
          <PlusCircle size={16} />
          <span>Add New Product</span>
        </Link>
      }
    >
      <div className="owner-products-page">
        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="owner-action-notice">
            <CheckCircle size={16} />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Toolbar: Search, Filters, Stats */}
        <div className="owner-products-toolbar">
          <div className="owner-toolbar-search-wrap">
            <Search size={16} className="owner-toolbar-search-icon" />
            <input
              type="text"
              className="owner-toolbar-search-input"
              placeholder="Search your products by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="owner-products-search"
            />
            {searchQuery && (
              <button
                type="button"
                className="owner-search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="owner-toolbar-controls">
            <select
              className="owner-toolbar-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter by stock status"
              id="owner-stock-filter"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock Only</option>
              <option value="low_stock">Low Stock (Needs Attention)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <span className="owner-products-count-tag">
              {filteredProducts.length} of {products.length} Products
            </span>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="owner-products-table-card">
          {loading ? (
            <div className="owner-loading-wrap">
              <Boxes size={32} className="spin-anim" />
              <p>Loading your products catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="owner-empty-state-box">
              <Package size={48} className="owner-empty-icon" />
              <h3>No products found</h3>
              <p>
                {products.length === 0
                  ? 'Your store does not have any items listed yet.'
                  : 'No items match your current search or filter.'}
              </p>
              {products.length === 0 ? (
                <Link to="/owner/products/new" className="owner-empty-btn">
                  <PlusCircle size={16} />
                  <span>Add First Product</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="owner-reset-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('all');
                  }}
                >
                  Clear search and filters
                </button>
              )}
            </div>
          ) : (
            <div className="owner-products-table-wrap">
              <table className="owner-products-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock & Quantity</th>
                    <th>Pickup</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
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
                              <Package size={18} />
                            </div>
                          )}
                          <div className="owner-table-prod-meta">
                            <span className="owner-table-prod-name">{prod.name}</span>
                            <span className="owner-table-prod-sub">
                              ID: {prod.id || prod._id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="owner-table-category-badge">
                          {prod.categoryLabel || prod.category}
                        </span>
                      </td>
                      <td>
                        <div className="owner-price-cell">
                          <strong className="owner-table-price">
                            {formatPrice(prod.price)}
                          </strong>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="owner-orig-price">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {(() => {
                            const qty = prod.stock !== undefined
                              ? prod.stock
                              : (prod.quantity !== undefined ? prod.quantity : 0);
                            const isOut = qty <= 0 || prod.available === false;
                            const isLow = !isOut && qty <= 5;
                            const badgeClass = isOut ? 'badge-out' : (isLow ? 'badge-low' : 'badge-in');
                            const badgeText = isOut
                              ? 'Out of Stock'
                              : isLow
                              ? `Low Stock (${qty})`
                              : 'In Stock';

                            return (
                              <>
                                <span className={`owner-table-stock-badge ${badgeClass}`}>
                                  {badgeText}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Stock: {qty} {qty === 1 ? 'unit' : 'units'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td>
                        <span className="owner-pickup-tag">
                          {prod.inStorePickup !== false ? 'In-Store Available' : 'Online Only'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <div className="owner-row-actions">
                          <Link
                            to={`/owner/products/${prod.id || prod._id}/edit`}
                            className="owner-action-icon-btn edit-btn"
                            title="Edit product"
                            id={`edit-prod-${prod.id || prod._id}`}
                          >
                            <Edit3 size={15} />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            className="owner-action-icon-btn delete-btn"
                            onClick={() => setProductToDelete(prod)}
                            title="Delete product"
                            id={`delete-prod-${prod.id || prod._id}`}
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {productToDelete && (
          <div className="owner-modal-backdrop" onClick={() => setProductToDelete(null)}>
            <div className="owner-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="owner-modal-header">
                <div className="owner-modal-danger-icon">
                  <AlertTriangle size={24} />
                </div>
                <button
                  type="button"
                  className="owner-modal-close"
                  onClick={() => setProductToDelete(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="owner-modal-title">Delete Product?</h3>
              <p className="owner-modal-desc">
                Are you sure you want to remove <strong>{productToDelete.name}</strong> from your shop inventory? This action cannot be undone.
              </p>

              <div className="owner-modal-footer">
                <button
                  type="button"
                  className="owner-modal-cancel-btn"
                  onClick={() => setProductToDelete(null)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="owner-modal-delete-btn"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  id="confirm-delete-btn"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
