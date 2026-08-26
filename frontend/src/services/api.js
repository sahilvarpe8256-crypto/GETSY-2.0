/**
 * API service foundation.
 * Base URL from environment variable, defaults to api-contract.md value.
 * No actual API calls in Phase 1 — stubs only.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function fetchNearbyShops(location) {
  // Phase 1: returns nothing — will use mock data
  // Future: GET /shops/nearby?location=...
  return [];
}

export async function fetchShopDetails(id) {
  // Future: GET /shops/:id
  return null;
}

export async function searchProducts(query, location) {
  // Future: GET /products/search?q=...&location=...
  return [];
}

export async function fetchProductDetails(id) {
  // Future: GET /products/:id
  return null;
}

export { API_BASE_URL };
