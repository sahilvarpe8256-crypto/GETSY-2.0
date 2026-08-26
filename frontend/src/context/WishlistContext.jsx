import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'getsy_customer_wishlist';

export function WishlistProvider({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['prod-2', 'prod-5']; // Default matching screenshots
    } catch {
      return ['prod-2', 'prod-5'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch {
      /* storage error ignore */
    }
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.includes(productId) || wishlistItems.includes(String(productId));
  };

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      // User is not logged in: trigger auth modal as required
      openAuthModal({
        mode: 'login',
        onSuccess: () => {
          // Add after login
          setWishlistItems((prev) => {
            const id = product.id || product._id;
            return prev.includes(id) ? prev : [...prev, id];
          });
        }
      });
      return false;
    }

    const id = product.id || product._id;
    setWishlistItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
    return true;
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((id) => id !== productId && id !== String(productId)));
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
