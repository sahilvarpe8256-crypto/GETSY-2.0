import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getShopById, updateShopProfile } from '../../services/shopService';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { ShopImage } from '../../components/common/ShopCard';
import LocationPickerMap from '../../components/common/LocationPickerMap';
import './OwnerShopProfile.css';

export default function OwnerShopProfile() {
  const { user, token } = useAuth();
  const ownerShopId = user?.shopId || 'shop-1';
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [serverError, setServerError] = useState('');

  const [shopData, setShopData] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.shopName || 'Kothrud Shoes & Boots',
    category: 'footwear',
    description: 'Welcome to our verified local store.',
    address: 'Shop 4, Kothrud Plaza, Paud Road',
    area: 'Kothrud',
    city: 'Pune',
    openingHours: 'Open Today • 9:30 AM - 9:00 PM',
    imageType: 'footwear',
    image: null,
    coordinates: { lat: 18.5074, lng: 73.8077 }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getShopById(ownerShopId)
      .then((shop) => {
        if (!isMounted) return;

        if (shop) {
          const rawCat = shop.category || shop.shopCategory || 'footwear';
          const safeCategory = String(rawCat).toLowerCase().trim() || 'footwear';
          const safeName = shop.name || shop.shopName || user?.shopName || 'My Store';
          const safeAddress = shop.address || shop.shopAddress || 'Shop 4, Kothrud Plaza, Paud Road';
          const safeArea = shop.area || shop.landmark || shop.shopLandmark || shop.locationName || 'Kothrud';
          const safeCity = shop.city || 'Pune';
          const safeHours = shop.openingHours || 'Open Today • 9:30 AM - 9:00 PM';
          const safeImage = shop.image || shop.shopPhoto || shop.photo || null;
          const rawCoords = shop.coordinates;
          const safeCoords = rawCoords
            ? {
                lat: typeof rawCoords.lat === 'number' ? rawCoords.lat : typeof rawCoords.latitude === 'number' ? rawCoords.latitude : 18.5074,
                lng: typeof rawCoords.lng === 'number' ? rawCoords.lng : typeof rawCoords.longitude === 'number' ? rawCoords.longitude : 73.8077
              }
            : { lat: 18.5074, lng: 73.8077 };

          setShopData(shop);
          setFormData({
            name: safeName,
            category: safeCategory,
            description: shop.description || 'Welcome to our verified local store.',
            address: safeAddress,
            area: safeArea,
            city: safeCity,
            openingHours: safeHours,
            imageType: (shop.imageType || safeCategory || 'footwear').toLowerCase(),
            image: safeImage,
            coordinates: safeCoords
          });
        } else {
          // Fallback if shop is not found in storage
          setFormData((prev) => ({
            ...prev,
            name: user?.shopName || 'My Store'
          }));
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [ownerShopId, user?.shopName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'category') {
        next.imageType = value;
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle storefront photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setServerError('Please select a valid image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFormData((prev) => ({ ...prev, image: loadEvent.target.result }));
        setServerError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Shop name is required';
    }
    if (!formData.address || !formData.address.trim()) {
      newErrors.address = 'Store address is required';
    }
    if (!formData.area || !formData.area.trim()) {
      newErrors.area = 'Locality / Area is required';
    }
    if (!formData.openingHours || !formData.openingHours.trim()) {
      newErrors.openingHours = 'Opening hours are required';
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Shop description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessNotice('');
    setServerError('');

    if (!validate()) return;

    setSaveLoading(true);

    const updatePayload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      address: formData.address.trim(),
      area: formData.area.trim(),
      city: formData.city.trim(),
      openingHours: formData.openingHours.trim(),
      imageType: formData.imageType,
      image: formData.image,
      coordinates: formData.coordinates
    };

    try {
      const res = await updateShopProfile(ownerShopId, updatePayload, token);
      if (res.success) {
        setShopData((prev) => ({ ...(prev || {}), ...updatePayload }));
        setSuccessNotice('Storefront profile updated successfully! Changes are now live.');
        setTimeout(() => setSuccessNotice(''), 4500);
      } else {
        setServerError('Failed to save profile changes. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred while saving.');
    } finally {
      setSaveLoading(false);
    }
  };

  const categoryLabel = formData.category
    ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1)
    : 'Store';

  if (loading) {
    return (
      <OwnerLayout activePageTitle="Shop Profile">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={32} className="spin-anim" color="var(--primary)" />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading shop profile...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout
      activePageTitle="Shop Profile Management"
      actionButton={
        <Link
          to={`/shops/${ownerShopId}`}
          className="owner-profile-live-btn"
          id="owner-profile-view-live-btn"
        >
          <ExternalLink size={16} />
          <span>View Live Storefront</span>
        </Link>
      }
    >
      <div className="owner-profile-page-grid">
        {/* Left: Profile Form Card */}
        <div className="owner-profile-form-card">
          <div className="owner-profile-card-header">
            <h2 className="owner-profile-title">Storefront Information</h2>
            <p className="owner-profile-sub">
              Customize how your store appears to nearby shoppers in discovery and map views.
            </p>
          </div>

          {successNotice && (
            <div className="auth-alert auth-alert--success" style={{ marginBottom: '20px' }}>
              <CheckCircle2 size={16} />
              <span>{successNotice}</span>
            </div>
          )}

          {serverError && (
            <div className="auth-alert auth-alert--error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="owner-profile-form" id="owner-shop-profile-form">
            {/* Shop Name */}
            <div className="product-form-group">
              <label className="product-form-label" htmlFor="shop-name-input">
                Store / Business Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="shop-name-input"
                name="name"
                className={`product-form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="product-form-error-msg">{errors.name}</span>}
            </div>

            {/* Category and City */}
            <div className="product-form-row">
              <div className="product-form-group">
                <label className="product-form-label" htmlFor="shop-category-select">
                  Store Category <span className="required-star">*</span>
                </label>
                <select
                  id="shop-category-select"
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
                <label className="product-form-label" htmlFor="shop-city-input">
                  City <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="shop-city-input"
                  name="city"
                  className="product-form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address and Locality */}
            <div className="product-form-row">
              <div className="product-form-group">
                <label className="product-form-label" htmlFor="shop-address-input">
                  Street Address <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="shop-address-input"
                  name="address"
                  className={`product-form-input ${errors.address ? 'has-error' : ''}`}
                  placeholder="e.g. Shop 4, Kothrud Plaza, Paud Road"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <span className="product-form-error-msg">{errors.address}</span>}
              </div>

              <div className="product-form-group">
                <label className="product-form-label" htmlFor="shop-area-input">
                  Locality / Area <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="shop-area-input"
                  name="area"
                  className={`product-form-input ${errors.area ? 'has-error' : ''}`}
                  placeholder="e.g. Kothrud"
                  value={formData.area}
                  onChange={handleChange}
                />
                {errors.area && <span className="product-form-error-msg">{errors.area}</span>}
              </div>
            </div>

            {/* Storefront Custom Photo Upload */}
            <div className="product-form-group">
              <label className="product-form-label">
                Storefront Photo <span className="product-form-hint">(Optional custom photo from computer)</span>
              </label>
              <div className="owner-profile-photo-upload-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                  id="owner-profile-photo-input"
                />
                <button
                  type="button"
                  className="owner-photo-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={15} />
                  <span>Upload Storefront Photo</span>
                </button>

                {formData.image && (
                  <button
                    type="button"
                    className="owner-photo-clear-btn"
                    onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                  >
                    Reset to Default Graphic
                  </button>
                )}
              </div>
            </div>

            {/* Shop Map Location Picker */}
            <div className="product-form-group">
              <label className="product-form-label">
                Pinpoint Storefront on Map
              </label>
              <LocationPickerMap
                initialCoordinates={formData.coordinates || shopData?.coordinates}
                initialLocationName={formData.area || shopData?.name}
                height="220px"
                onLocationChange={(locData) => {
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: locData.coordinates,
                    area: prev.area || locData.locationName
                  }));
                }}
              />
            </div>

            {/* Opening Hours */}
            <div className="product-form-group">
              <label className="product-form-label" htmlFor="shop-hours-input">
                Opening Hours / Operating Timings <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="shop-hours-input"
                name="openingHours"
                className={`product-form-input ${errors.openingHours ? 'has-error' : ''}`}
                placeholder="e.g. Open Today • 9:30 AM - 9:00 PM"
                value={formData.openingHours}
                onChange={handleChange}
              />
              {errors.openingHours && (
                <span className="product-form-error-msg">{errors.openingHours}</span>
              )}
            </div>

            {/* Description */}
            <div className="product-form-group">
              <label className="product-form-label" htmlFor="shop-desc-input">
                Storefront Description & Highlights <span className="required-star">*</span>
              </label>
              <textarea
                id="shop-desc-input"
                name="description"
                className={`product-form-textarea ${errors.description ? 'has-error' : ''}`}
                placeholder="Share your store specialties, genuine brands, and in-store perks..."
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <span className="product-form-error-msg">{errors.description}</span>
              )}
            </div>

            {/* Submit */}
            <div className="product-form-actions">
              <button
                type="submit"
                className="product-form-submit-btn"
                disabled={saveLoading}
                id="save-shop-profile-btn"
              >
                {saveLoading ? (
                  <>
                    <Loader2 size={16} className="auth-spinner" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Store Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Storefront Card Preview */}
        <div className="owner-profile-preview-card">
          <div className="owner-preview-header">
            <ShieldCheck size={16} color="var(--primary)" />
            <span>Live Storefront Preview</span>
          </div>

          <div className="owner-preview-storefront-box">
            <ShopImage
              type={formData.category}
              imageType={formData.category}
              name={formData.name || 'Your Store'}
              shopName={formData.name || 'Your Store'}
              image={formData.image}
            />
          </div>

          <div className="owner-preview-meta">
            <div className="owner-preview-name-row">
              <h3 className="owner-preview-name">{formData.name || 'Store Name'}</h3>
              <span className="owner-preview-verified-badge">
                <CheckCircle2 size={12} />
                <span>Verified</span>
              </span>
            </div>

            <span className="owner-preview-category-tag">
              {categoryLabel}
            </span>

            <p className="owner-preview-desc">
              {formData.description || 'Welcome to our verified local store.'}
            </p>

            <div className="owner-preview-details-list">
              <div className="owner-preview-detail-row">
                <MapPin size={14} className="preview-icon" />
                <span>{formData.address ? `${formData.address}, ${formData.city}` : 'Pune, India'}</span>
              </div>
              <div className="owner-preview-detail-row">
                <Clock size={14} className="preview-icon" />
                <span>{formData.openingHours}</span>
              </div>
            </div>

            <Link
              to={`/shops/${ownerShopId}`}
              className="owner-preview-full-btn"
            >
              <span>Preview Customer View</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
