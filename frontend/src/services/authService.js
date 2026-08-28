const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'getsy_auth_token';
const USER_KEY = 'getsy_auth_user';
const LOCAL_SHOPS_KEY = 'getsy_custom_shops';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(user, token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore storage errors */
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Validate and fetch current authenticated user profile from backend
 */
export async function fetchCurrentUser(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        saveAuthSession(data.user, token);
        return data.user;
      }
    }

    if (res.status === 401 || res.status === 403) {
      clearAuthSession();
      return null;
    }
  } catch {
    // Network offline: retain existing stored session
  }

  return getStoredUser();
}

/**
 * Login user
 */
export async function loginUser({ email, password, role = 'customer' }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();
    if (res.ok && data.user) {
      saveAuthSession(data.user, data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Invalid credentials. Please try again.' };
  } catch {
    // Graceful fallback simulation only if backend is unreachable
    const isOwner = role === 'owner' || email.toLowerCase().includes('owner');
    const mockUser = {
      id: isOwner ? 'usr-demo-owner' : 'usr-demo-customer',
      name: isOwner ? 'GETSY Demo Owner' : (email.split('@')[0] ? (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)) : 'Sahil'),
      email: email,
      role: isOwner ? 'owner' : 'customer',
      shopId: isOwner ? 'shop-1' : null,
      shopName: isOwner ? 'Kothrud Shoes & Boots' : null
    };
    const mockToken = isOwner ? 'mock-jwt-owner-token' : 'mock-jwt-customer-token';
    saveAuthSession(mockUser, mockToken);
    return { success: true, user: mockUser, token: mockToken, isMock: true };
  }
}

/**
 * Register user (Customer or Shop Owner)
 */
export async function registerUser({
  name,
  email,
  password,
  role = 'customer',
  phone,
  shopData = null
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, shopData })
    });

    const data = await res.json();
    if (res.ok && data.user) {
      saveAuthSession(data.user, data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Registration failed. Please try again.' };
  } catch {
    // Fallback simulation only if backend is unreachable
    const isOwner = role === 'owner';
    const uniqueShopId = isOwner ? `shop-${Date.now().toString().slice(-6)}` : null;

    if (isOwner && shopData) {
      const newShop = {
        id: uniqueShopId,
        numericId: Date.now(),
        name: shopData.shopName || `${name}'s Store`,
        category: shopData.shopCategory || 'footwear',
        imageType: shopData.shopCategory || 'footwear',
        image: shopData.shopImage || null,
        address: shopData.shopAddress || 'Local Market, Pune',
        area: shopData.shopLandmark || shopData.locationName || 'Pune',
        city: 'Pune',
        landmark: shopData.shopLandmark || '',
        gstNumber: shopData.shopGst || '',
        coordinates: shopData.coordinates || { lat: 18.5196, lng: 73.8427 },
        distance: '0.3 km',
        rating: 5.0,
        reviewsCount: 1,
        verified: true,
        openingHours: 'Open Today • 9:30 AM - 9:00 PM',
        description: `Welcome to ${shopData.shopName || 'our shop'}! Browse verified local stock and reserve in-store.`
      };

      try {
        const customShops = JSON.parse(localStorage.getItem(LOCAL_SHOPS_KEY) || '{}');
        customShops[uniqueShopId] = newShop;
        localStorage.setItem(LOCAL_SHOPS_KEY, JSON.stringify(customShops));
      } catch {
        /* storage error */
      }
    }

    const mockUser = {
      id: `usr-${Date.now()}`,
      name: name || (isOwner ? 'Shop Owner' : 'Customer'),
      email,
      phone: phone || '',
      role: isOwner ? 'owner' : 'customer',
      shopId: isOwner ? (uniqueShopId || 'shop-1') : null,
      shopName: isOwner ? (shopData?.shopName || 'My Store') : null
    };

    const mockToken = `mock-token-${Date.now()}`;
    saveAuthSession(mockUser, mockToken);
    return { success: true, user: mockUser, token: mockToken, isMock: true };
  }
}

export { API_BASE_URL };
