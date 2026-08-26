import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Store,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  MapPin,
  FileText
} from 'lucide-react';
import getsyLogo from '../../assets/getsy-logo.png.png';
import { useAuth } from '../../context/AuthContext';
import LocationPickerMap from '../common/LocationPickerMap';
import './AuthModal.css';

export default function AuthModal() {
  const navigate = useNavigate();
  const { isAuthModalOpen, authModalConfig, closeAuthModal, login, register } = useAuth();

  const [role, setRole] = useState('customer'); // 'customer' | 'owner'
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Customer Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Owner Registration Extra Fields
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('footwear');
  const [shopAddress, setShopAddress] = useState('');
  const [shopLandmark, setShopLandmark] = useState('');
  const [shopGst, setShopGst] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopImagePreview, setShopImagePreview] = useState(null);
  const [shopCoordinates, setShopCoordinates] = useState({ lat: 18.5196, lng: 73.8427 });
  const [shopLocationName, setShopLocationName] = useState('FC Road / Deccan, Pune');

  const fileInputRef = useRef(null);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setRole(authModalConfig.role || 'customer');
      setMode(authModalConfig.mode || 'login');
      setError('');
      setSuccessMsg('');
    }
  }, [isAuthModalOpen, authModalConfig]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Handle local shop photo file selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setShopImagePreview(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Common Email & Password validation
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Customer Registration Validation
    if (mode === 'register' && role === 'customer') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!phone.trim() || phone.trim().length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    // Owner Registration Validation
    if (mode === 'register' && role === 'owner') {
      if (!name.trim()) {
        setError('Please enter Owner Full Name.');
        return;
      }
      if (!shopName.trim()) {
        setError('Please enter Shop Name.');
        return;
      }
      if (!shopAddress.trim()) {
        setError('Please enter Shop Address / Street.');
        return;
      }
      if (!shopLandmark.trim()) {
        setError('Please enter Landmark / Area.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await login({ email, password, role });
      } else {
        const ownerShopPayload =
          role === 'owner'
            ? {
                shopName: shopName.trim(),
                shopCategory,
                shopAddress: shopAddress.trim(),
                shopLandmark: shopLandmark.trim(),
                shopGst: shopGst.trim(),
                shopImage: shopImagePreview,
                coordinates: shopCoordinates,
                locationName: shopLocationName
              }
            : null;

        res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
          shopData: ownerShopPayload
        });
      }

      if (res && res.success) {
        setSuccessMsg(
          mode === 'login'
            ? `Welcome back, ${res.user.name || (role === 'owner' ? 'Merchant' : 'Shopper')}!`
            : `Registration successful! Welcome to Getsy, ${res.user.name}!`
        );

        setTimeout(() => {
          if (res.user?.role === 'owner') {
            navigate('/owner/dashboard');
          }
        }, 500);
      } else {
        setError(res?.error || 'Authentication failed. Please check your details.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOwnerRegistration = role === 'owner' && mode === 'register';

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal} id="auth-modal-overlay">
      <div
        className={`auth-modal-container ${isOwnerRegistration ? 'auth-modal-container--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        id="auth-modal"
      >
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Close modal"
          id="auth-modal-close-btn"
        >
          <X size={20} />
        </button>

        {/* Logo icon */}
        <div className="auth-modal-brand">
          <div className="auth-modal-logo-icon">
            <img src={getsyLogo} alt="Getsy Logo" className="auth-modal-logo-img" />
          </div>
          <h2 className="auth-modal-title">Welcome to Getsy</h2>
          <p className="auth-modal-subtitle">
            {role === 'owner'
              ? 'Merchant Portal: Grow your local neighborhood store'
              : 'Discover locally. Shop confidently.'}
          </p>
        </div>

        {/* Role Selector Tabs (Customer vs Shop Owner) */}
        <div className="auth-pill-switch" id="auth-role-switch">
          <button
            type="button"
            className={`auth-pill-btn ${role === 'customer' ? 'auth-pill-btn--active' : ''}`}
            onClick={() => {
              setRole('customer');
              setError('');
            }}
            id="auth-role-customer"
          >
            <User size={16} />
            <span>Customer</span>
          </button>
          <button
            type="button"
            className={`auth-pill-btn ${role === 'owner' ? 'auth-pill-btn--active' : ''}`}
            onClick={() => {
              setRole('owner');
              setError('');
            }}
            id="auth-role-owner"
          >
            <Store size={16} />
            <span>Shop Owner</span>
          </button>
        </div>

        {/* Mode Selector Tabs (Log In vs Create Account) */}
        <div className="auth-mode-switch" id="auth-mode-switch">
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'login' ? 'auth-mode-btn--active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
            id="auth-mode-login"
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'register' ? 'auth-mode-btn--active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
            id="auth-mode-register"
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="auth-alert auth-alert--error" id="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert auth-alert--success" id="auth-success-alert">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" id="auth-form">
          {/* CUSTOMER REGISTER OR COMMON LOGIN */}
          {!isOwnerRegistration && (
            <>
              {mode === 'register' && (
                <>
                  <div className="auth-input-group">
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-wrapper">
                      <User size={18} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="e.g. Sahil Varpe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        id="auth-name-input"
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Mobile Number</label>
                    <div className="auth-input-wrapper">
                      <Phone size={18} className="auth-input-icon" />
                      <input
                        type="tel"
                        className="auth-input"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        id="auth-phone-input"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="auth-email-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="auth-password-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* SHOP OWNER REGISTRATION (11 REQUIRED FIELDS) */}
          {isOwnerRegistration && (
            <div className="auth-owner-reg-grid">
              <div className="auth-owner-section-title">Owner & Store Information</div>

              {/* 1. Full Name & 2. Shop Name */}
              <div className="auth-row-2">
                <div className="auth-input-group">
                  <label className="auth-label">
                    Full Name <span className="req-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      id="owner-reg-name"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">
                    Shop Name <span className="req-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Store size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Rahul's Footwear Hub"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                      id="owner-reg-shopname"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Shop Category */}
              <div className="auth-input-group">
                <label className="auth-label">
                  Shop Category <span className="req-star">*</span>
                </label>
                <select
                  className="auth-select"
                  value={shopCategory}
                  onChange={(e) => setShopCategory(e.target.value)}
                  id="owner-reg-category"
                >
                  <option value="footwear">Footwear</option>
                  <option value="clothing">Clothing</option>
                  <option value="ornaments">Ornaments</option>
                  <option value="accessories">Accessories</option>
                  <option value="hardware">Hardware</option>
                </select>
              </div>

              {/* 4. Shop Address & 5. Landmark */}
              <div className="auth-row-2">
                <div className="auth-input-group">
                  <label className="auth-label">
                    Shop Address / Street <span className="req-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <MapPin size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Shop 12, Paud Road"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      required
                      id="owner-reg-address"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">
                    Landmark / Area <span className="req-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <MapPin size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Near Kothrud Bus Stand"
                      value={shopLandmark}
                      onChange={(e) => setShopLandmark(e.target.value)}
                      required
                      id="owner-reg-landmark"
                    />
                  </div>
                </div>
              </div>

              {/* 6. GST Number (OPTIONAL) */}
              <div className="auth-input-group">
                <label className="auth-label">
                  GST Number <span className="opt-tag">(Optional)</span>
                </label>
                <div className="auth-input-wrapper">
                  <FileText size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={shopGst}
                    onChange={(e) => setShopGst(e.target.value)}
                    id="owner-reg-gst"
                  />
                </div>
              </div>

              {/* 7. Shop Photo (File Upload from Computer) */}
              <div className="auth-input-group">
                <label className="auth-label">
                  Shop Storefront Photo <span className="opt-tag">(Optional)</span>
                </label>
                <div className="auth-file-upload-box">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                    id="owner-reg-photo-file"
                  />
                  <button
                    type="button"
                    className="auth-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>Select Photo from Computer</span>
                  </button>

                  {shopImagePreview && (
                    <div className="auth-photo-preview">
                      <img src={shopImagePreview} alt="Shop Preview" />
                      <button
                        type="button"
                        className="auth-photo-remove"
                        onClick={() => setShopImagePreview(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 11. Interactive Shop Location Map */}
              <div className="auth-input-group">
                <label className="auth-label">
                  Pinpoint Shop on Map <span className="req-star">*</span>
                </label>
                <LocationPickerMap
                  initialCoordinates={shopCoordinates}
                  initialLocationName={shopLocationName}
                  height="200px"
                  onLocationChange={(data) => {
                    setShopCoordinates(data.coordinates);
                    setShopLocationName(data.locationName);
                  }}
                />
              </div>

              <div className="auth-owner-section-title" style={{ marginTop: '12px' }}>
                Account Credentials
              </div>

              {/* 8. Email Address */}
              <div className="auth-input-group">
                <label className="auth-label">
                  Email Address <span className="req-star">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="merchant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="owner-reg-email"
                  />
                </div>
              </div>

              {/* 9. Password & 10. Confirm Password */}
              <div className="auth-row-2">
                <div className="auth-input-group">
                  <label className="auth-label">
                    Password <span className="req-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      id="owner-reg-password"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">
                    Confirm Password <span className="req-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      id="owner-reg-confirm-password"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="auth-spinner" />
                <span>Processing Account...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Log In to Getsy'
                    : role === 'owner'
                    ? 'Complete Merchant Registration'
                    : 'Create Customer Account'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-modal-footer-note">
          Trusted by local shops across Indian towns & cities.
        </p>
      </div>
    </div>
  );
}
