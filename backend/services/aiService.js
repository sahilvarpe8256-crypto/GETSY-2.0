const productService = require('./productService');

/**
 * Common category synonyms for deterministic rule-based mapping.
 * Maps common natural-language terms to normalized category names.
 * Designed to be extended or replaced by a real AI provider in future phases.
 */
const CATEGORY_SYNONYMS = {
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
  phone: 'electronics',
  laptop: 'electronics',
  earbuds: 'electronics',
  headphones: 'electronics',
  charger: 'electronics',
  tablet: 'electronics',
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
  belt: 'accessories',
  belts: 'accessories',
  wallet: 'accessories',
  wallets: 'accessories',
  watch: 'accessories',
  watches: 'accessories',
  bag: 'accessories',
  bags: 'accessories',
  sunglasses: 'accessories'
};

/**
 * Parse a natural-language query into structured search parameters.
 * Uses deterministic rule-based extraction (no external AI provider).
 *
 * @param {string} query - Natural language search query
 * @param {number|undefined} latitude - Optional latitude from request body
 * @param {number|undefined} longitude - Optional longitude from request body
 * @returns {object} structuredQuery with available fields only
 */
const parseQuery = (query, latitude, longitude) => {
  const structuredQuery = {};
  let remainingQuery = query.toLowerCase().trim();

  // Extract maxPrice from patterns like "under 2000", "below 500", "less than 1000"
  const pricePattern = /(?:under|below|less than|within|upto|up to)\s+(\d+(?:\.\d+)?)/i;
  const priceMatch = remainingQuery.match(pricePattern);
  if (priceMatch) {
    structuredQuery.maxPrice = parseFloat(priceMatch[1]);
    remainingQuery = remainingQuery.replace(priceMatch[0], '').trim();
  }

  // Remove common filler phrases
  remainingQuery = remainingQuery
    .replace(/\b(i need|i want|looking for|search for|find me|show me|get me|near me|nearby)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract category from remaining words using synonym map
  const words = remainingQuery.split(/\s+/).filter((w) => w.length > 0);
  let category = null;
  const keywordWords = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (!category && CATEGORY_SYNONYMS[cleanWord]) {
      category = CATEGORY_SYNONYMS[cleanWord];
    } else if (cleanWord.length > 0) {
      keywordWords.push(cleanWord);
    }
  }

  if (category) {
    structuredQuery.category = category;
  }

  if (keywordWords.length > 0) {
    structuredQuery.keywords = keywordWords;
  }

  // Pass through location coordinates if provided
  if (latitude !== undefined && latitude !== null) {
    structuredQuery.latitude = parseFloat(latitude);
  }

  if (longitude !== undefined && longitude !== null) {
    structuredQuery.longitude = parseFloat(longitude);
  }

  return structuredQuery;
};

/**
 * Perform intelligent search by parsing the natural-language query
 * and delegating database access to the existing productService.
 *
 * AI service does NOT access MongoDB directly.
 *
 * @param {object} params
 * @param {string} params.query - Natural language search query
 * @param {number|undefined} params.latitude - Optional latitude
 * @param {number|undefined} params.longitude - Optional longitude
 * @returns {object} { structuredQuery, products }
 */
const intelligentSearch = async ({ query, latitude, longitude }) => {
  // Step 1: Parse the natural language query into structured parameters
  const structuredQuery = parseQuery(query, latitude, longitude);

  // Step 2: Build productService search parameters from structured query
  const searchParams = {};

  if (structuredQuery.category) {
    searchParams.category = structuredQuery.category;
  }

  // Combine keywords into a single search term for productService
  if (structuredQuery.keywords && structuredQuery.keywords.length > 0) {
    searchParams.search = structuredQuery.keywords.join(' ');
  }

  // Step 3: Delegate database query to existing productService
  let products = await productService.getProducts(searchParams);

  // Step 4: Apply maxPrice filter in-memory (productService does not support price filtering)
  if (structuredQuery.maxPrice !== undefined) {
    products = products.filter((product) => product.price <= structuredQuery.maxPrice);
  }

  return {
    structuredQuery,
    products
  };
};

module.exports = {
  parseQuery,
  intelligentSearch
};
