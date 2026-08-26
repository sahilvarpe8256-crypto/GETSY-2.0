import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole = 'owner' }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal({ role: requiredRole, mode: 'login' });
    }
  }, [isAuthenticated, requiredRole, openAuthModal]);

  if (!isAuthenticated) {
    return (
      <main className="container" style={{ paddingTop: '60px', paddingBottom: '60px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px 24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <Store size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            Shop Owner Access Required
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
            Please log in with a Shop Owner account to manage your store products and profile.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal({ role: 'owner', mode: 'login' })}
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <span>Log In as Shop Owner</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <main className="container" style={{ paddingTop: '60px', paddingBottom: '60px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px 24px',
          border: '1px solid #fee2e2',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
            You are logged in as a <strong>Customer ({user?.name})</strong>. Only registered <strong>Shop Owners</strong> can access this management portal.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openAuthModal({ role: 'owner', mode: 'login' })}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Switch to Owner Account
            </button>
            <a
              href="/"
              style={{
                background: '#f1f5f9',
                color: '#374151',
                padding: '10px 20px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'inline-block'
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
