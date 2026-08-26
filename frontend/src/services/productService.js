import { products as mockProducts, getProductById as getMockProductById, filterProducts as filterMockProducts } from '../data/products';

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
 * Fetch all products with optional filters
 */
export async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.shopId) query.append('shopId', params.shopId);

    const qs = query.toString();
    const url = `${API_BASE_URL}/products${qs ? `?${qs}` : ''}`;
    
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

  return filterMockProducts(params);
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data._id)) {
        return data;
      }
    }
  } catch {
    // Graceful fallback
  }

  return getMockProductById(id);
}

/**
 * Search products by query keyword
 */
export async function searchProducts(searchQuery, location) {
  try {
    const query = new URLSearchParams();
    if (searchQuery) query.append('query', searchQuery);
    if (location) query.append('location', location);

    const res = await fetchWithTimeout(`${API_BASE_URL}/products/search?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Graceful fallback
  }

  return filterMockProducts({ search: searchQuery });
}

export { API_BASE_URL };
