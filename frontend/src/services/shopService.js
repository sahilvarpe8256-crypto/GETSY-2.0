import { shops as mockShops, getShopById as getMockShopById, filterShops as filterMockShops } from '../data/shops';
import { getProducts } from './productService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

  return filterMockShops(params);
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

  return mockShops;
}

/**
 * Fetch single shop by ID
 */
export async function getShopById(id) {
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

  return getMockShopById(id);
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

export { API_BASE_URL };
