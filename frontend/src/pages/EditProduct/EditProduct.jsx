import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Package,
  Upload,
  Link2,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProductById, updateProduct } from '../../services/productService';
import OwnerLayout from '../../components/owner/OwnerLayout';
import '../../components/owner/ProductForm.css';

export default function EditProduct() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [productData, setProductData] = useState(null);

  // Image mode: 'upload' | 'url'
  const [imageMode, setImageMode] = useState('upload');

  const [formData, setFormData] = useState({
    name: '',
    category: 'footwear',
    price: '',
    originalPrice: '',
    quantity: 10,
    stockStatus: 'In Stock',
    inStorePickup: true,
    sizes: '',
    image: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProductById(id).then((prod) => {
      if (isMounted) {
        if (!prod) {
          setServerError('Product not found.');
          setLoading(false);
          return;
        }

        setProductData(prod);
        const prodQty = prod.quantity !== undefined ? prod.quantity : (prod.stockStatus?.includes('Out') ? 0 : 12);
        setFormData({
          name: prod.name || '',
          category: prod.category || 'footwear',
          price: prod.price || '',
          originalPrice: prod.originalPrice || '',
          quantity: prodQty,
          stockStatus: prod.stockStatus || 'In Stock',
          inStorePickup: prod.inStorePickup !== false,
          sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : '',
          image: prod.image || '',
          description: prod.description || ''
        });

        if (prod.image && prod.image.startsWith('http')) {
          setImageMode('url');
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

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
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.quantity === '' || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.image || !formData.image.trim()) {
      newErrors.image = 'Product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSaveLoading(true);

    const categoryLabels = {
      footwear: 'Footwear',
      clothing: 'Clothing',
      ornaments: 'Ornaments',
      accessories: 'Accessories',
      hardware: 'Hardware'
    };

    const updatedPayload = {
      ...(productData || {}),
      name: formData.name.trim(),
      category: formData.category,
      categoryLabel: categoryLabels[formData.category] || formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      quantity: Number(formData.quantity) || 0,
      stockStatus: formData.stockStatus,
      inStorePickup: formData.inStorePickup,
      sizes: formData.sizes
        ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      image: formData.image.trim(),
      description: formData.description.trim()
    };

    try {
      const res = await updateProduct(id, updatedPayload, token);
      if (res.success) {
        navigate('/owner/products');
      } else {
        setServerError('Failed to update product. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred while saving.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <OwnerLayout activePageTitle="Edit Product">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={32} className="spin-anim" color="var(--primary)" />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading product data...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout
      activePageTitle="Edit Product"
      actionButton={
        <Link to="/owner/products" className="product-form-cancel-btn">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      }
    >
      <div className="product-form-container">
        <div className="product-form-header">
          <h2 className="product-form-title">Edit Product Details</h2>
          <p className="product-form-subtitle">
            Update pricing, stock availability, and specifications for <strong>{productData?.name}</strong>.
          </p>
        </div>

        {serverError && (
          <div className="auth-alert auth-alert--error" style={{ marginBottom: '18px' }}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form-body" id="edit-product-form">
          {/* Product Name */}
          <div className="product-form-group">
            <label className="product-form-label" htmlFor="edit-prod-name">
              Product Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="edit-prod-name"
              name="name"
              className={`product-form-input ${errors.name ? 'has-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="product-form-error-msg">{errors.name}</span>}
          </div>

          {/* Category, Quantity & Stock Status */}
          <div className="product-form-row-3">
            <div className="product-form-group">
              <label className="product-form-label" htmlFor="edit-prod-category">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="edit-prod-category"
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
              </select>
            </div>

            <div className="product-form-group">
              <label className="product-form-label" htmlFor="edit-prod-quantity">
                Product Quantity <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="edit-prod-quantity"
                name="quantity"
                min="0"
                step="1"
                className={`product-form-input ${errors.quantity ? 'has-error' : ''}`}
                value={formData.quantity}
                onChange={handleChange}
              />
              {errors.quantity && (
                <span className="product-form-error-msg">{errors.quantity}</span>
              )}
            </div>

            <div className="product-form-group">
              <label className="product-form-label" htmlFor="edit-prod-stock-status">
                Stock Status
              </label>
              <select
                id="edit-prod-stock-status"
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
              <label className="product-form-label" htmlFor="edit-prod-price">
                Selling Price (₹) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="edit-prod-price"
                name="price"
                min="1"
                step="1"
                className={`product-form-input ${errors.price ? 'has-error' : ''}`}
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <span className="product-form-error-msg">{errors.price}</span>}
            </div>

            <div className="product-form-group">
              <label className="product-form-label" htmlFor="edit-prod-orig-price">
                Original / MRP Price (₹) <span className="product-form-hint">(Optional)</span>
              </label>
              <input
                type="number"
                id="edit-prod-orig-price"
                name="originalPrice"
                min="1"
                step="1"
                className="product-form-input"
                value={formData.originalPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Sizes / Options */}
          <div className="product-form-group">
            <label className="product-form-label" htmlFor="edit-prod-sizes">
              Available Sizes / Variants
            </label>
            <input
              type="text"
              id="edit-prod-sizes"
              name="sizes"
              className="product-form-input"
              value={formData.sizes}
              onChange={handleChange}
            />
            <span className="product-form-hint">Comma separated list of sizes</span>
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
                  id="product-file-upload-input-edit"
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
                id="edit-prod-image"
                name="image"
                className={`product-form-input ${errors.image ? 'has-error' : ''}`}
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
                  <span>Displaying on store catalog and discovery search</span>
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
            <label className="product-form-label" htmlFor="edit-prod-desc">
              Description <span className="required-star">*</span>
            </label>
            <textarea
              id="edit-prod-desc"
              name="description"
              className={`product-form-textarea ${errors.description ? 'has-error' : ''}`}
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
              disabled={saveLoading}
              id="submit-edit-product"
            >
              {saveLoading ? (
                <>
                  <Loader2 size={16} className="auth-spinner" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}
