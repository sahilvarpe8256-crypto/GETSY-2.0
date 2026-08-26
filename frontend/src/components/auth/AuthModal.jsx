import { useState, useEffect } from 'react';
import { X, User, Store, Mail, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import getsyLogo from '../../assets/getsy-logo.png.png';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthModalOpen, authModalConfig, closeAuthModal, login, register } = useAuth();
  
  const [role, setRole] = useState('customer'); // 'customer' | 'owner'
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validations
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

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

    setLoading(true);

    try {
      if (role === 'owner' && mode === 'register') {
        setSuccessMsg('Shop owner onboarding registration recorded for future phase!');
        setTimeout(() => {
          login({ email, password });
          setLoading(false);
        }, 1000);
        return;
      }

      if (mode === 'login') {
        const res = await login({ email, password });
        if (res.success) {
          setSuccessMsg(`Welcome back, ${res.user.name || 'Shopper'}!`);
        } else {
          setError(res.error || 'Login failed. Check your credentials.');
        }
      } else {
        const res = await register({ name, email, password, phone, role });
        if (res.success) {
          setSuccessMsg(`Account created successfully! Welcome to Getsy, ${res.user.name}!`);
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal} id="auth-modal-overlay">
      <div
        className="auth-modal-container"
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
            <img
              src={getsyLogo}
              alt="Getsy Logo"
              className="auth-modal-logo-img"
            />
          </div>
          <h2 className="auth-modal-title">Welcome to Getsy</h2>
          <p className="auth-modal-subtitle">Discover locally. Shop confidently.</p>
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

          {role === 'owner' && mode === 'register' && (
            <div className="auth-owner-hint">
              <span>Note: Full shop catalog management will unlock in Owner Phase.</span>
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
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
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
