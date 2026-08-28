import { shops as baseShops, getShopById as getBaseShopById, filterShops as filterBaseShops } from '../data/shops';
import { getProducts } from './productService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const LOCAL_SHOPS_KEY = 'getsy_custom_shops';

/**
 * Retrieve custom local shop updates from localStorage
 */
function getLocalCustomShops() {
  try {
    const raw = localStorage.getItem(LOCAL_SHOPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get merged shops (base shops + custom updates)
 */
export function getAllMergedShops() {
  const customShops = getLocalCustomShops();
  const baseIds = new Set(baseShops.map((s) => s.id));

  // Base shops with any local custom updates applied
  const mergedBase = baseShops.map((shop) => {
    const override = customShops[shop.id];
    return override ? { ...shop, ...override } : shop;
  });

  // Any newly created custom registered shops not present in baseShops
  const customOnly = Object.values(customShops).filter(
    (s) => s && s.id && !baseIds.has(s.id)
  );

  return [...customOnly, ...mergedBase];
}

/**
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 2500 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetch all shops with optional filters
 */
export async function getShops(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    const url = `${API_BASE_URL}/shops${qs ? `?${qs}` : ''}`;

    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Graceful fallback to mock data
  }

  const merged = getAllMergedShops();
  let list = [...merged];

  if (params.category && params.category !== 'all') {
    const normCat = params.category.toLowerCase().trim();
    list = list.filter((s) => s.category?.toLowerCase() === normCat);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.area?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }

  if (params.verifiedOnly) {
    list = list.filter((s) => s.verified);
  }

  if (params.maxDistance && params.maxDistance !== 'all') {
    list = list.filter((s) => {
      const distNum = parseFloat(s.distance);
      return isNaN(distNum) || distNum <= Number(params.maxDistance);
    });
  }

  return list;
}

/**
 * Fetch nearby shops by coordinates
 */
export async function getNearbyShops({ latitude, longitude, radius = 10 }) {
  try {
    const query = new URLSearchParams();
    if (latitude !== undefined) query.append('latitude', latitude);
    if (longitude !== undefined) query.append('longitude', longitude);
    if (radius !== undefined) query.append('radius', radius);

    const res = await fetchWithTimeout(`${API_BASE_URL}/shops/nearby?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Graceful fallback
  }

  return getAllMergedShops();
}

/**
 * Fetch single shop by ID
 */
export async function getShopById(id) {
  if (!id) return null;
  const strId = String(id).toLowerCase().trim();

  // 1. Try fetching from backend API first for fresh MongoDB data
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/shops/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data._id)) {
        return data;
      }
    }
  } catch {
    // Graceful fallback
  }

  // 2. Check custom shops in localStorage
  const customShops = getLocalCustomShops();
  if (customShops[id]) return customShops[id];
  const customMatch = Object.values(customShops).find(
    (s) =>
      s &&
      (String(s.id).toLowerCase() === strId ||
        String(s.numericId) === strId ||
        `shop-${s.numericId}`.toLowerCase() === strId)
  );
  if (customMatch) return customMatch;

  const merged = getAllMergedShops();
  return (
    merged.find(
      (s) =>
        s &&
        (String(s.id).toLowerCase() === strId ||
          String(s.numericId) === strId ||
          `shop-${s.numericId}`.toLowerCase() === strId ||
          (s.name && s.name.toLowerCase() === strId))
    ) || null
  );
}

/**
 * Fetch all products belonging to a specific shop
 */
export async function getShopProducts(shopId) {
  try {
    const products = await getProducts({ shopId });
    if (Array.isArray(products) && products.length > 0) {
      return products;
    }
  } catch {
    // Fallback handled in getProducts
  }

  return [];
}

/**
 * Update shop profile details (Owner action)
 */
export async function updateShopProfile(shopId, updateData, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updateData)
    });

    if (res.ok) {
      const updated = await res.json();
      return { success: true, shop: updated };
    }
  } catch {
    // Fallback persistence
  }

  const custom = getLocalCustomShops();
  custom[shopId] = {
    ...(custom[shopId] || {}),
    ...updateData,
    id: shopId,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(LOCAL_SHOPS_KEY, JSON.stringify(custom));
  } catch {
    /* ignore */
  }

  const updatedShop = await getShopById(shopId);
  return { success: true, shop: updatedShop, isLocal: true };
}

/**
 * Delete a shop with complete cascade (Owner action)
 */
export async function deleteShop(shopId, token) {
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (res.ok) {
      // Remove from custom local storage if present
      const custom = getLocalCustomShops();
      if (custom[shopId]) {
        delete custom[shopId];
        try {
          localStorage.setItem(LOCAL_SHOPS_KEY, JSON.stringify(custom));
        } catch {
          /* ignore */
        }
      }
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to delete shop.' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export { API_BASE_URL };
