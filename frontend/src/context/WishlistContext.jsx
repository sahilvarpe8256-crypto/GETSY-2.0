import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'getsy_customer_wishlist';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function WishlistProvider({ children }) {
  const { isAuthenticated, token, openAuthModal } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Synchronize with backend when user is authenticated
  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && token && !token.startsWith('mock-')) {
      fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch wishlist');
        })
        .then((data) => {
          if (isMounted && data && Array.isArray(data.products)) {
            setWishlistItems(data.products);
          }
        })
        .catch(() => {
          // Fallback to existing localStorage state
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch {
      /* storage error ignore */
    }
  }, [wishlistItems]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const strId = String(productId);
      return wishlistItems.some((id) => String(id) === strId);
    },
    [wishlistItems]
  );

  const toggleWishlist = async (product) => {
    if (!product) return false;
    const rawId = product.id || product._id;
    const prodId = String(rawId);

    if (!isAuthenticated) {
      // User is not logged in: trigger auth modal
      openAuthModal({
        mode: 'login',
        onSuccess: () => {
          setWishlistItems((prev) => {
            const exists = prev.some((id) => String(id) === prodId);
            return exists ? prev : [...prev, prodId];
          });
        }
      });
      return false;
    }

    // Optimistically update frontend state
    setWishlistItems((prev) => {
      const exists = prev.some((id) => String(id) === prodId);
      if (exists) {
        return prev.filter((id) => String(id) !== prodId);
      } else {
        return [...prev, prodId];
      }
    });

    // Call backend API if real token is available
    if (token && !token.startsWith('mock-')) {
      try {
        const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: prodId })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products)) {
            setWishlistItems(data.products);
          }
        }
      } catch {
        // Retain optimistic state
      }
    }

    return true;
  };

  const removeFromWishlist = async (productId) => {
    if (!productId) return;
    const prodId = String(productId);

    // Optimistically update frontend state
    setWishlistItems((prev) => prev.filter((id) => String(id) !== prodId));

    // Call backend API if real token is available
    if (token && !token.startsWith('mock-')) {
      try {
        const res = await fetch(`${API_BASE_URL}/wishlist/${prodId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products)) {
            setWishlistItems(data.products);
          }
        }
      } catch {
        // Retain optimistic state
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
