import { products as baseProducts } from '../data/products.js';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT_MS = 2500;
const LOCAL_PRODUCTS_KEY = 'getsy_custom_products';
const DELETED_PRODUCTS_KEY = 'getsy_deleted_product_ids';

/**
 * Category synonym mapping for client-side rule-based fallback parser.
 * Maps common natural-language terms to normalized category IDs.
 */
export const CATEGORY_SYNONYMS = {
  // Footwear
  shoe: 'footwear',
  shoes: 'footwear',
  sneaker: 'footwear',
  sneakers: 'footwear',
  sandal: 'footwear',
  sandals: 'footwear',
  boot: 'footwear',
  boots: 'footwear',
  slipper: 'footwear',
  slippers: 'footwear',
  footwear: 'footwear',

  // Clothing
  shirt: 'clothing',
  shirts: 'clothing',
  tshirt: 'clothing',
  tshirts: 'clothing',
  pant: 'clothing',
  pants: 'clothing',
  jeans: 'clothing',
  jacket: 'clothing',
  jackets: 'clothing',
  dress: 'clothing',
  dresses: 'clothing',
  clothing: 'clothing',
  clothes: 'clothing',
  apparel: 'clothing',

  // Accessories
  belt: 'accessories',
  belts: 'accessories',
  wallet: 'accessories',
  wallets: 'accessories',
  watch: 'accessories',
  watches: 'accessories',
  bag: 'accessories',
  bags: 'accessories',
  sunglasses: 'accessories',
  accessories: 'accessories',

  // Ornaments / Jewellery
  ornament: 'ornaments',
  ornaments: 'ornaments',
  jewellery: 'ornaments',
  jewelry: 'ornaments',
  necklace: 'ornaments',
  necklaces: 'ornaments',
  ring: 'ornaments',
  rings: 'ornaments',
  bangle: 'ornaments',
  bangles: 'ornaments',
  earring: 'ornaments',
  earrings: 'ornaments',

  // Hardware
  hardware: 'hardware',
  tool: 'hardware',
  tools: 'hardware',
  drill: 'hardware',
  paint: 'hardware',
  screw: 'hardware',
  hammer: 'hardware',

  // Electronics
  phone: 'electronics',
  phones: 'electronics',
  laptop: 'electronics',
  laptops: 'electronics',
  earbuds: 'electronics',
  headphones: 'electronics',
  charger: 'electronics',
  tablet: 'electronics',
  electronics: 'electronics'
};

/**
 * Common conversational filler phrases to strip from natural-language queries.
 */
const FILLER_PATTERN = /\b(i need|i want|looking for|search for|find me|show me|get me|please find|near me|nearby)\b/gi;

/**
 * Price matching regex patterns (e.g. "under 2000", "below 500", "less than 1000", "within 2000", "upto 2000", "up to 2000")
 */
const PRICE_PATTERN = /(?:under|below|less than|within|upto|up to)\s+(\d+(?:\.\d+)?)/i;

/**
 * Retrieve local customized products from localStorage safely
 */
function getLocalCustomProducts() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieve deleted product IDs from localStorage safely
 */
function getDeletedProductIds() {
  try {
    if (typeof localStorage === 'undefined') return [];
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

  const customIds = new Set(custom.map((p) => p.id));
  const activeBase = (baseProducts || []).filter(
    (p) => !deleted.includes(p.id) && !customIds.has(p.id)
  );

  const activeCustom = custom.filter((p) => !deleted.includes(p.id));

  return [...activeCustom, ...activeBase];
}

/**
 * Parse natural-language search query into structured parameters.
 * Mirrors the backend aiService.js rule-based parser.
 *
 * @param {string} query - Natural language search query
 * @param {number|undefined} latitude - Optional latitude
 * @param {number|undefined} longitude - Optional longitude
 * @returns {object} structuredQuery with extracted category, keywords, maxPrice, coordinates
 */
export function parseQuery(query = '', latitude, longitude) {
  const structuredQuery = {};
  if (!query || typeof query !== 'string') {
    if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
      structuredQuery.latitude = Number(latitude);
    }
    if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
      structuredQuery.longitude = Number(longitude);
    }
    return structuredQuery;
  }

  let remainingQuery = query.toLowerCase().trim();

  // 1. Extract maxPrice pattern (e.g. "under 2000")
  const priceMatch = remainingQuery.match(PRICE_PATTERN);
  if (priceMatch) {
    structuredQuery.maxPrice = parseFloat(priceMatch[1]);
    remainingQuery = remainingQuery.replace(priceMatch[0], '').trim();
  }

  // 2. Remove conversational filler phrases
  remainingQuery = remainingQuery
    .replace(FILLER_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Extract category from remaining tokens and collect descriptive keywords
  const words = remainingQuery.split(/\s+/).filter((w) => w.length > 0);
  let category = null;
  const keywordWords = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (!cleanWord) continue;

    // Check if the word is a known category synonym (only first matched category is selected)
    if (!category && CATEGORY_SYNONYMS[cleanWord]) {
      category = CATEGORY_SYNONYMS[cleanWord];
    } else if (cleanWord.length > 1) {
      // Exclude single characters unless meaningful
      keywordWords.push(cleanWord);
    }
  }

  if (category) {
    structuredQuery.category = category;
  }

  if (keywordWords.length > 0) {
    structuredQuery.keywords = keywordWords;
  }

  // 4. Pass-through coordinates if provided
  if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
    structuredQuery.latitude = Number(latitude);
  }

  if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
    structuredQuery.longitude = Number(longitude);
  }

  return structuredQuery;
}

/**
 * Filter local products using structured search parameters.
 *
 * @param {object} structuredQuery - Parsed structured parameters
 * @returns {Array} List of matching products
 */
export function filterProductsByStructuredQuery(structuredQuery = {}) {
  const allProducts = getAllMergedProducts();
  if (!allProducts || allProducts.length === 0) {
    return [];
  }

  return allProducts.filter((product) => {
    // 1. Category filter
    if (structuredQuery.category) {
      const prodCategory = (product.category || '').toLowerCase().trim();
      const targetCategory = structuredQuery.category.toLowerCase().trim();
      if (prodCategory !== targetCategory) {
        return false;
      }
    }

    // 2. Max price filter
    if (structuredQuery.maxPrice !== undefined && structuredQuery.maxPrice !== null) {
      const price = Number(product.price);
      if (isNaN(price) || price > structuredQuery.maxPrice) {
        return false;
      }
    }

    // 3. Keywords filter (matches name, description, category, or shopName)
    if (structuredQuery.keywords && structuredQuery.keywords.length > 0) {
      const name = (product.name || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();
      const shop = (product.shopName || '').toLowerCase();

      const matchesAnyKeyword = structuredQuery.keywords.some((kw) => {
        const cleanKw = kw.toLowerCase().trim();
        return (
          name.includes(cleanKw) ||
          desc.includes(cleanKw) ||
          cat.includes(cleanKw) ||
          shop.includes(cleanKw)
        );
      });

      if (!matchesAnyKeyword) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Helper to execute HTTP fetch with an explicit abort timeout.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

/**
 * Intelligent AI-powered product search.
 * Attempts POST /api/search/ai first with a short timeout.
 * Automatically falls back to client-side rule-based parsing on failure/offline.
 *
 * @param {string} query - Natural language query (e.g. "black formal shoes under 2000 near me")
 * @param {object|null} coordinates - Optional coordinates { latitude, longitude } or { lat, lng }
 * @returns {Promise<{ structuredQuery: object, products: Array, source: 'backend'|'fallback' }>}
 */
export async function intelligentSearch(query = '', coordinates = null) {
  const cleanQuery = typeof query === 'string' ? query.trim() : '';

  // Normalize coordinates
  let latitude;
  let longitude;
  if (coordinates) {
    if (coordinates.latitude !== undefined) latitude = coordinates.latitude;
    else if (coordinates.lat !== undefined) latitude = coordinates.lat;

    if (coordinates.longitude !== undefined) longitude = coordinates.longitude;
    else if (coordinates.lng !== undefined) longitude = coordinates.lng;
  }

  // Attempt Backend AI endpoint if query is non-empty
  if (cleanQuery) {
    try {
      const payload = { query: cleanQuery };
      if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
        payload.latitude = Number(latitude);
      }
      if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
        payload.longitude = Number(longitude);
      }

      const res = await fetchWithTimeout(
        `${API_BASE_URL}/search/ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        },
        DEFAULT_TIMEOUT_MS
      );

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          return {
            structuredQuery: data.structuredQuery || {},
            products: Array.isArray(data.products) ? data.products : [],
            source: 'backend'
          };
        }
      }
    } catch {
      // Backend unavailable, timed out, or network unreachable -> proceed to fallback
    }
  }

  // Client-Side Fallback Parser & Filtering
  const structuredQuery = parseQuery(cleanQuery, latitude, longitude);

  let products = [];
  if (cleanQuery) {
    products = filterProductsByStructuredQuery(structuredQuery);
  } else {
    // If empty query, return all merged products without filter
    products = getAllMergedProducts();
  }

  return {
    structuredQuery,
    products,
    source: 'fallback'
  };
}
