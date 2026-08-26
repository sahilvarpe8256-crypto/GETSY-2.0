import { products as baseProducts, getProductById as getBaseProductById, filterProducts as filterBaseProducts } from '../data/products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const LOCAL_PRODUCTS_KEY = 'getsy_custom_products';
const DELETED_PRODUCTS_KEY = 'getsy_deleted_product_ids';

/**
 * Retrieve local customized products from localStorage
 */
function getLocalCustomProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieve deleted product IDs from localStorage
 */
function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get merged products (base demo products + custom added/edited products - deleted products)
 */
export function getAllMergedProducts() {
  const custom = getLocalCustomProducts();
  const deleted = getDeletedProductIds();

  // Filter base products not deleted and not overridden by custom
  const customIds = new Set(custom.map((p) => p.id));
  const activeBase = baseProducts.filter(
    (p) => !deleted.includes(p.id) && !customIds.has(p.id)
  );

  const activeCustom = custom.filter((p) => !deleted.includes(p.id));

  return [...activeCustom, ...activeBase];
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
    // Graceful fallback to merged local products
  }

  const all = getAllMergedProducts();
  let list = [...all];

  if (params.category && params.category !== 'all') {
    const norm = params.category.toLowerCase().trim();
    list = list.filter((p) => p.category?.toLowerCase() === norm);
  }

  if (params.shopId) {
    const sId = String(params.shopId).toLowerCase().trim();
    list = list.filter((p) => {
      const pShopId = String(p.shopId).toLowerCase().trim();
      return (
        pShopId === sId ||
        pShopId === `shop-${sId}` ||
        `shop-${pShopId}` === sId ||
        (pShopId.startsWith('shop-') && pShopId.replace('shop-', '') === sId)
      );
    });
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.shopName?.toLowerCase().includes(q) ||
        p.shopLocation?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  return list;
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

  const all = getAllMergedProducts();
  const strId = String(id).toLowerCase();
  return all.find((p) => String(p.id).toLowerCase() === strId || String(p._id).toLowerCase() === strId) || null;
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

  return getProducts({ search: searchQuery });
}

/**
 * Create a new product (Owner action)
 */
export async function createProduct(productData, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(productData)
    });

    if (res.ok) {
      const created = await res.json();
      return { success: true, product: created };
    }
  } catch {
    // Local persistence fallback
  }

  const newProduct = {
    ...productData,
    id: productData.id || `prod-custom-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  const custom = getLocalCustomProducts();
  custom.unshift(newProduct);
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(custom));
  } catch {
    /* storage full */
  }

  return { success: true, product: newProduct, isLocal: true };
}

/**
 * Update an existing product (Owner action)
 */
export async function updateProduct(id, productData, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(productData)
    });

    if (res.ok) {
      const updated = await res.json();
      return { success: true, product: updated };
    }
  } catch {
    // Local persistence fallback
  }

  const custom = getLocalCustomProducts();
  const existingIndex = custom.findIndex((p) => String(p.id) === String(id));

  const updatedProduct = {
    ...productData,
    id: id,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    custom[existingIndex] = updatedProduct;
  } else {
    custom.unshift(updatedProduct);
  }

  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(custom));
  } catch {
    /* ignore */
  }

  return { success: true, product: updatedProduct, isLocal: true };
}

/**
 * Delete a product (Owner action)
 */
export async function deleteProduct(id, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (res.ok) {
      return { success: true };
    }
  } catch {
    // Local persistence fallback
  }

  // Remove from custom if present
  let custom = getLocalCustomProducts();
  custom = custom.filter((p) => String(p.id) !== String(id));
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(custom));
  } catch {
    /* ignore */
  }

  // Add to deleted IDs list
  const deleted = getDeletedProductIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    try {
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
    } catch {
      /* ignore */
    }
  }

  return { success: true, isLocal: true };
}

export { API_BASE_URL };
