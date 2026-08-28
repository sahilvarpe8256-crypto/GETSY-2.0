import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  Package,
  Upload,
  Link2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createProduct } from '../../services/productService';
import OwnerLayout from '../../components/owner/OwnerLayout';
import '../../components/owner/ProductForm.css';

export default function AddProduct() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const ownerShopId = user?.shopId || 'shop-1';
  const ownerShopName = user?.shopName || 'Kothrud Shoes & Boots';

  // Image mode: 'upload' | 'url'
  const [imageMode, setImageMode] = useState('upload');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'footwear',
    price: '',
    originalPrice: '',
    quantity: 15,
    stockStatus: 'In Stock',
    inStorePickup: true,
    sizes: 'UK 7, UK 8, UK 9, UK 10',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle stockStatus derivation when quantity changes
  const handleQuantityChange = (val) => {
    const qty = parseInt(val, 10);
    let autoStock = 'In Stock';
    if (isNaN(qty) || qty <= 0) {
      autoStock = 'Out of Stock';
    } else if (qty <= 5) {
      autoStock = `Low Stock (${qty} left)`;
    } else {
      autoStock = 'In Stock';
    }

    setFormData((prev) => ({
      ...prev,
      quantity: isNaN(qty) ? '' : qty,
      stockStatus: autoStock
    }));

    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'quantity') {
      handleQuantityChange(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFormData((prev) => ({ ...prev, image: loadEvent.target.result }));
        setErrors((prev) => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (formData.quantity === '' || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    if (formData.originalPrice && Number(formData.originalPrice) < Number(formData.price)) {
      newErrors.originalPrice = 'Original price should be >= sale price';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 8) {
      newErrors.description = 'Description should be at least 8 characters';
    }

    if (!formData.image || !formData.image.trim()) {
      newErrors.image = 'Product image is required (upload or enter URL)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);

    const categoryLabels = {
      footwear: 'Footwear',
      clothing: 'Clothing',
      ornaments: 'Ornaments',
      accessories: 'Accessories',
      hardware: 'Hardware',
      home: 'Home & Living',
      electronics: 'Electronics'
    };

    const newProductPayload = {
      name: formData.name.trim(),
      category: formData.category,
      categoryLabel: categoryLabels[formData.category] || formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.quantity) || 0,
      quantity: Number(formData.quantity) || 0,
      stockStatus: formData.stockStatus,
      inStorePickup: formData.inStorePickup,
      sizes: formData.sizes
        ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      size: formData.sizes ? formData.sizes.trim() : '',
      image: formData.image.trim(),
      description: formData.description.trim(),
      shopId: ownerShopId,
      shopName: ownerShopName,
      shopLocation: 'Pune, Maharashtra',
      rating: 5.0,
      reviewsCount: 1,
      badge: 'New Arrival',
      verified: true
    };

    try {
      const res = await createProduct(newProductPayload, token);
      if (res.success) {
        navigate('/owner/products');
      } else {
        setServerError('Failed to save product. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout
      activePageTitle="Add New Product"
      actionButton={
        <Link to="/owner/products" className="product-form-cancel-btn">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      }
    >
      <div className="product-form-container">
        <div className="product-form-header">
          <h2 className="product-form-title">Product Details</h2>
          <p className="product-form-subtitle">
            List a new product item under <strong>{ownerShopName}</strong> for nearby customers.
          </p>
        </div>

        {serverError && (
          <div className="auth-alert auth-alert--error" style={{ marginBottom: '18px' }}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form-body" id="add-product-form">
          {/* Product Name */}
          <div className="product-form-group">
            <label className="product-form-label" htmlFor="prod-name">
              Product Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="prod-name"
              name="name"
              className={`product-form-input ${errors.name ? 'has-error' : ''}`}
              placeholder="e.g. Premium Leather Chelsea Boots"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="product-form-error-msg">{errors.name}</span>}
          </div>

          {/* Category, Quantity & Stock Status */}
          <div className="product-form-row-3">
            <div className="product-form-group">
              <label className="product-form-label" htmlFor="prod-category">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="prod-category"
                name="category"
                className="product-form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="footwear">Footwear</option>
                <option value="clothing">Clothing</option>
                <option value="ornaments">Ornaments</option>
                <option value="accessories">Accessories</option>
                <option value="hardware">Hardware</option>
                <option value="home">Home & Living</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>

            <div className="product-form-group">
              <label className="product-form-label" htmlFor="prod-quantity">
                Product Quantity <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="prod-quantity"
                name="quantity"
                min="0"
                step="1"
                className={`product-form-input ${errors.quantity ? 'has-error' : ''}`}
                placeholder="e.g. 15"
                value={formData.quantity}
                onChange={handleChange}
              />
              {errors.quantity && (
                <span className="product-form-error-msg">{errors.quantity}</span>
              )}
            </div>

            <div className="product-form-group">
              <label className="product-form-label" htmlFor="prod-stock-status">
                Stock Status
              </label>
              <select
                id="prod-stock-status"
                name="stockStatus"
                className="product-form-select"
                value={formData.stockStatus}
                onChange={handleChange}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock (3 left)">Low Stock (3 left)</option>
                <option value="Low Stock (5 left)">Low Stock (5 left)</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Price and Original Price */}
          <div className="product-form-row">
            <div className="product-form-group">
              <label className="product-form-label" htmlFor="prod-price">
                Selling Price (₹) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="prod-price"
                name="price"
                min="1"
                step="1"
                className={`product-form-input ${errors.price ? 'has-error' : ''}`}
                placeholder="e.g. 1999"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <span className="product-form-error-msg">{errors.price}</span>}
            </div>

            <div className="product-form-group">
              <label className="product-form-label" htmlFor="prod-orig-price">
                Original / MRP Price (₹) <span className="product-form-hint">(Optional)</span>
              </label>
              <input
                type="number"
                id="prod-orig-price"
                name="originalPrice"
                min="1"
                step="1"
                className={`product-form-input ${errors.originalPrice ? 'has-error' : ''}`}
                placeholder="e.g. 2499"
                value={formData.originalPrice}
                onChange={handleChange}
              />
              {errors.originalPrice && (
                <span className="product-form-error-msg">{errors.originalPrice}</span>
              )}
            </div>
          </div>

          {/* Sizes / Options */}
          <div className="product-form-group">
            <label className="product-form-label" htmlFor="prod-sizes">
              Available Sizes / Variants
            </label>
            <input
              type="text"
              id="prod-sizes"
              name="sizes"
              className="product-form-input"
              placeholder="e.g. UK 7, UK 8, UK 9, UK 10 or Small, Medium, Large"
              value={formData.sizes}
              onChange={handleChange}
            />
            <span className="product-form-hint">Separate multiple sizes/options with commas</span>
          </div>

          {/* Product Image: Upload File OR Image URL */}
          <div className="product-form-group">
            <label className="product-form-label">
              Product Image <span className="required-star">*</span>
            </label>

            {/* Mode Switch Tabs */}
            <div className="product-image-mode-tabs">
              <button
                type="button"
                className={`product-image-tab-btn ${imageMode === 'upload' ? 'product-image-tab-btn--active' : ''}`}
                onClick={() => setImageMode('upload')}
              >
                <Upload size={14} />
                <span>Upload from Computer</span>
              </button>

              <button
                type="button"
                className={`product-image-tab-btn ${imageMode === 'url' ? 'product-image-tab-btn--active' : ''}`}
                onClick={() => setImageMode('url')}
              >
                <Link2 size={14} />
                <span>Image URL</span>
              </button>
            </div>

            {/* Upload from Computer */}
            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="product-file-upload-input"
                />
                <div
                  className="product-file-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <button type="button" className="product-file-btn">
                    <Upload size={16} />
                    <span>Choose File from Computer</span>
                  </button>
                  <span>Supports PNG, JPG, JPEG, WEBP image formats</span>
                </div>
              </div>
            ) : (
              /* Image URL Input */
              <input
                type="url"
                id="prod-image-url"
                name="image"
                className={`product-form-input ${errors.image ? 'has-error' : ''}`}
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={handleChange}
              />
            )}

            {errors.image && <span className="product-form-error-msg">{errors.image}</span>}

            {/* Live Image Preview */}
            {formData.image && (
              <div className="product-image-preview-wrap">
                <div className="product-image-preview-box">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="product-preview-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/100x100?text=Invalid+Image';
                    }}
                  />
                </div>
                <div className="product-image-preview-info">
                  <strong>Selected Product Image</strong>
                  <span>Ready to display on your storefront and search results</span>
                </div>
                <button
                  type="button"
                  className="product-remove-img-btn"
                  onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="product-form-group">
            <label className="product-form-label" htmlFor="prod-desc">
              Description <span className="required-star">*</span>
            </label>
            <textarea
              id="prod-desc"
              name="description"
              className={`product-form-textarea ${errors.description ? 'has-error' : ''}`}
              placeholder="Describe the material, features, and in-store highlights..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <span className="product-form-error-msg">{errors.description}</span>
            )}
          </div>

          {/* In-Store Pickup Option */}
          <div className="product-form-group">
            <label className="product-form-checkbox-label">
              <input
                type="checkbox"
                name="inStorePickup"
                checked={formData.inStorePickup}
                onChange={handleChange}
              />
              <span>In-Store Pickup Available (Customers can reserve and collect in person)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="product-form-actions">
            <Link to="/owner/products" className="product-form-cancel-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="product-form-submit-btn"
              disabled={loading}
              id="submit-add-product"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="auth-spinner" />
                  <span>Adding Product...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Save & Publish Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}
