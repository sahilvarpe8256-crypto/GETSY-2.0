import { products as baseProducts } from '../data/products.js';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT_MS = 2500;
const LOCAL_PRODUCTS_KEY = 'getsy_custom_products';
const DELETED_PRODUCTS_KEY = 'getsy_deleted_product_ids';

/**
 * Known Maharashtra locations with coordinates for offline client-side fallback.
 */
const KNOWN_LOCATIONS = {
  sangamner: { latitude: 19.57, longitude: 74.21 },
  pune: { latitude: 18.52, longitude: 73.86 },
  mumbai: { latitude: 19.08, longitude: 72.88 },
  nashik: { latitude: 20.00, longitude: 73.78 },
  nagpur: { latitude: 21.15, longitude: 79.09 },
  aurangabad: { latitude: 19.88, longitude: 75.34 },
  thane: { latitude: 19.22, longitude: 72.98 },
  solapur: { latitude: 17.68, longitude: 75.91 },
  kolhapur: { latitude: 16.70, longitude: 74.24 },
  ahmednagar: { latitude: 19.09, longitude: 74.74 },
  shirdi: { latitude: 19.77, longitude: 74.48 },
  akola: { latitude: 20.71, longitude: 77.00 },
  latur: { latitude: 18.40, longitude: 76.57 },
  navi_mumbai: { latitude: 19.03, longitude: 73.03 },
  satara: { latitude: 17.68, longitude: 73.99 },
  sangli: { latitude: 16.85, longitude: 74.56 },
  jalgaon: { latitude: 21.01, longitude: 75.57 },
  ratnagiri: { latitude: 16.99, longitude: 73.30 },
  amravati: { latitude: 20.93, longitude: 77.75 },
  nanded: { latitude: 19.16, longitude: 77.30 },
  kopargaon: { latitude: 19.88, longitude: 74.48 }
};

/**
 * Category synonym mapping for client-side rule-based fallback parser.
 * Maps common natural-language terms to normalized category IDs.
 *
 * CANONICAL SOURCE: ai/src/data/categories.js
 * Inverted index of CATEGORIES: synonym -> canonicalCategory
 */
export const CATEGORY_SYNONYMS = {
  // footwear
  footwear: 'footwear',
  shoe: 'footwear',
  shoes: 'footwear',
  sneaker: 'footwear',
  sneakers: 'footwear',
  sandal: 'footwear',
  sandals: 'footwear',
  slipper: 'footwear',
  slippers: 'footwear',
  boot: 'footwear',
  boots: 'footwear',
  heel: 'footwear',
  heels: 'footwear',
  loafer: 'footwear',
  loafers: 'footwear',
  chappal: 'footwear',
  chappals: 'footwear',
  jogger: 'footwear',
  joggers: 'footwear',
  floater: 'footwear',
  floaters: 'footwear',
  'flip-flop': 'footwear',
  'flip-flops': 'footwear',

  // clothing
  clothing: 'clothing',
  shirt: 'clothing',
  shirts: 'clothing',
  't-shirt': 'clothing',
  't-shirts': 'clothing',
  tshirt: 'clothing',
  tshirts: 'clothing',
  pant: 'clothing',
  pants: 'clothing',
  trouser: 'clothing',
  trousers: 'clothing',
  jeans: 'clothing',
  jean: 'clothing',
  dress: 'clothing',
  dresses: 'clothing',
  kurta: 'clothing',
  kurtas: 'clothing',
  saree: 'clothing',
  sarees: 'clothing',
  sari: 'clothing',
  saris: 'clothing',
  jacket: 'clothing',
  jackets: 'clothing',
  hoodie: 'clothing',
  hoodies: 'clothing',
  sweater: 'clothing',
  sweaters: 'clothing',
  top: 'clothing',
  tops: 'clothing',
  skirt: 'clothing',
  skirts: 'clothing',
  shorts: 'clothing',
  blazer: 'clothing',
  blazers: 'clothing',
  clothes: 'clothing',
  garment: 'clothing',
  garments: 'clothing',
  apparel: 'clothing',

  // electronics
  electronics: 'electronics',
  phone: 'electronics',
  phones: 'electronics',
  mobile: 'electronics',
  mobiles: 'electronics',
  smartphone: 'electronics',
  smartphones: 'electronics',
  laptop: 'electronics',
  laptops: 'electronics',
  tablet: 'electronics',
  tablets: 'electronics',
  headphone: 'electronics',
  headphones: 'electronics',
  earphone: 'electronics',
  earphones: 'electronics',
  earbuds: 'electronics',
  earbud: 'electronics',
  charger: 'electronics',
  chargers: 'electronics',
  camera: 'electronics',
  cameras: 'electronics',
  speaker: 'electronics',
  speakers: 'electronics',
  television: 'electronics',
  tv: 'electronics',
  electronic: 'electronics',
  gadget: 'electronics',
  gadgets: 'electronics',

  // accessories
  accessories: 'accessories',
  wallet: 'accessories',
  wallets: 'accessories',
  belt: 'accessories',
  belts: 'accessories',
  watch: 'accessories',
  watches: 'accessories',
  sunglasses: 'accessories',
  sunglass: 'accessories',
  bag: 'accessories',
  bags: 'accessories',
  purse: 'accessories',
  purses: 'accessories',
  backpack: 'accessories',
  backpacks: 'accessories',
  handbag: 'accessories',
  handbags: 'accessories',
  cap: 'accessories',
  caps: 'accessories',
  hat: 'accessories',
  hats: 'accessories',
  scarf: 'accessories',
  scarves: 'accessories',
  tie: 'accessories',
  ties: 'accessories',
  accessory: 'accessories',
  jewellery: 'accessories',
  jewelry: 'accessories',
  bracelet: 'accessories',
  bracelets: 'accessories',
  necklace: 'accessories',
  necklaces: 'accessories',
  ring: 'accessories',
  rings: 'accessories',

  // grocery
  grocery: 'grocery',
  groceries: 'grocery',
  vegetable: 'grocery',
  vegetables: 'grocery',
  fruit: 'grocery',
  fruits: 'grocery',
  rice: 'grocery',
  wheat: 'grocery',
  dal: 'grocery',
  oil: 'grocery',
  sugar: 'grocery',
  salt: 'grocery',
  spice: 'grocery',
  spices: 'grocery',
  atta: 'grocery',
  flour: 'grocery',
  milk: 'grocery',
  bread: 'grocery',
  egg: 'grocery',
  eggs: 'grocery',

  // beauty
  beauty: 'beauty',
  cosmetic: 'beauty',
  cosmetics: 'beauty',
  makeup: 'beauty',
  skincare: 'beauty',
  lipstick: 'beauty',
  foundation: 'beauty',
  cream: 'beauty',
  lotion: 'beauty',
  shampoo: 'beauty',
  conditioner: 'beauty',
  perfume: 'beauty',
  fragrance: 'beauty',
  serum: 'beauty',

  // sports
  sports: 'sports',
  sport: 'sports',
  cricket: 'sports',
  football: 'sports',
  badminton: 'sports',
  bat: 'sports',
  ball: 'sports',
  racket: 'sports',
  gym: 'sports',
  fitness: 'sports',
  yoga: 'sports',
  dumbbell: 'sports',
  treadmill: 'sports',
  sportswear: 'sports',

  // books
  books: 'books',
  book: 'books',
  novel: 'books',
  novels: 'books',
  textbook: 'books',
  textbooks: 'books',
  notebook: 'books',
  notebooks: 'books',
  stationery: 'books',
  pen: 'books',
  pens: 'books',
  pencil: 'books',
  pencils: 'books',
  diary: 'books',
  diaries: 'books',

  // home
  home: 'home',
  furniture: 'home',
  sofa: 'home',
  table: 'home',
  chair: 'home',
  bed: 'home',
  mattress: 'home',
  curtain: 'home',
  curtains: 'home',
  pillow: 'home',
  pillows: 'home',
  lamp: 'home',
  lamps: 'home',
  decor: 'home',
  decoration: 'home',
  kitchen: 'home',
  utensil: 'home',
  utensils: 'home'
};

const ATTRIBUTE_VALUES = {
  colors: [
    'black', 'white', 'red', 'blue', 'brown', 'green', 'yellow',
    'grey', 'gray', 'pink', 'orange', 'purple', 'beige', 'maroon',
    'navy', 'teal', 'cream', 'olive'
  ],
  styles: ['formal', 'casual', 'sports', 'sporty', 'party', 'ethnic', 'traditional', 'vintage', 'modern', 'classic', 'designer'],
  materials: [
    'leather', 'cotton', 'denim', 'silk', 'gold', 'silver',
    'wool', 'woolen', 'linen', 'polyester', 'nylon', 'velvet',
    'canvas', 'plastic', 'metal', 'wood', 'wooden', 'ceramic',
    'brass', 'copper'
  ],
  sizes: ['xxxl', 'xxl', 'xl', 'xs', 's', 'm', 'l']
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'with', 'in', 'on', 'at', 'to',
  'from', 'by', 'near', 'around', 'about', 'me', 'my', 'i', 'we', 'you', 'it',
  'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could',
  'should', 'want', 'need', 'please', 'some', 'any', 'all', 'item', 'items',
  'product', 'products', 'good', 'best', 'cheap', 'affordable', 'top', 'buy',
  'purchase', 'shop', 'shops', 'store', 'stores',
  'than', 'more', 'less', 'under', 'below', 'above', 'over', 'between',
  'upto', 'within', 'max', 'min', 'greater', 'starting'
]);

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
 * Computes Damerau-Levenshtein distance (insertions, deletions, substitutions, transpositions).
 * Pure and deterministic ₹0 string metric.
 */
function damerauLevenshtein(a, b) {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix = [];
  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let min = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );

      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        min = Math.min(min, matrix[i - 2][j - 2] + 1);
      }

      matrix[i][j] = min;
    }
  }

  return matrix[lenA][lenB];
}

/**
 * Returns maximum allowed edit distance based on target word length:
 * - <= 3 chars: 0 (exact only)
 * - 4-6 chars: 1
 * - >= 7 chars: 2
 */
function getMaxEditDistance(target) {
  const len = typeof target === 'string' ? target.length : 0;
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

/**
 * Finds the closest matching dictionary term for a candidate token.
 */
function findFuzzyMatch(token, dictionary) {
  if (!token || typeof token !== 'string') return null;
  const clean = token.toLowerCase().trim();
  if (clean.length < 3) return null;
  if (STOP_WORDS.has(clean) || !isNaN(Number(clean))) return null;

  let bestMatch = null;
  let bestDistance = Infinity;

  for (const term of dictionary) {
    const termClean = term.toLowerCase().trim();
    const maxDist = getMaxEditDistance(termClean);
    if (maxDist === 0) continue;

    if (Math.abs(clean.length - termClean.length) > maxDist) continue;

    const dist = damerauLevenshtein(clean, termClean);
    if (dist <= maxDist && dist < bestDistance) {
      bestDistance = dist;
      bestMatch = {
        term: termClean,
        originalTerm: term,
        distance: dist,
        matchedToken: clean
      };
      if (dist === 1 && termClean.length <= 6) break;
    }
  }

  return bestMatch;
}

/**
 * Parse natural-language search query into structured parameters for client-side fallback.
 * Aligns 100% with the standalone /ai query parser contract.
 *
 * @param {string} query - Natural language search query
 * @param {number|undefined} latitude - Optional latitude
 * @param {number|undefined} longitude - Optional longitude
 * @returns {object} Normalized structuredQuery
 */
export function parseQuery(query = '', latitude, longitude) {
  const originalQuery = typeof query === 'string' ? query : (query ? String(query) : '');

  const structuredQuery = {
    intent: 'product_search',
    category: null,
    keywords: [],
    attributes: {
      color: null,
      style: null,
      material: null,
      size: null
    },
    price: {
      min: null,
      max: null
    },
    location: null,
    confidence: 0,
    originalQuery
  };

  if (!query || typeof query !== 'string' || !query.trim()) {
    if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
      structuredQuery.location = {
        name: null,
        latitude: Number(latitude),
        longitude: longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : null
      };
      structuredQuery.latitude = Number(latitude);
      if (structuredQuery.location.longitude !== null) structuredQuery.longitude = structuredQuery.location.longitude;
    }
    structuredQuery.intent = 'browse';
    return structuredQuery;
  }

  let text = ' ' + originalQuery.toLowerCase().trim() + ' ';
  let tokensRemoved = [];
  let fuzzyMatchCount = 0;

  // 1. Intent
  const isShopSearch = /\b(shops|shop|stores|store|outlets|outlet|dealers|dealer|showrooms|showroom|market|markets|boutique|boutiques)\b/i.test(text);
  const isBrowse = /^\s*(browse|explore|show all|view all|list all)\b/i.test(originalQuery.trim()) ||
    /^\s*(show me|view|browse|explore)\s+(all\s+)?(footwear|clothing|electronics|accessories|grocery|beauty|sports|books|home|products|items)\s*$/i.test(originalQuery.trim());

  if (isShopSearch) structuredQuery.intent = 'shop_search';
  else if (isBrowse) structuredQuery.intent = 'browse';
  else structuredQuery.intent = 'product_search';

  // 2. Location (Exact + Fuzzy)
  let extractedLocName = null;
  const locPrepMatch = text.match(/\b(?:near|in|around|at|from|to)\s+([a-z]+(?:\s+[a-z]+)?)\b/i);
  if (locPrepMatch) {
    const candidate = locPrepMatch[1].trim();
    const candidateKey = candidate.replace(/\s+/g, '_');
    if (KNOWN_LOCATIONS[candidateKey] || KNOWN_LOCATIONS[candidate]) {
      extractedLocName = candidate;
      text = text.replace(locPrepMatch[0], ' ');
      tokensRemoved.push(locPrepMatch[0]);
    } else {
      const fuzzyLoc = findFuzzyMatch(candidateKey, Object.keys(KNOWN_LOCATIONS)) ||
        findFuzzyMatch(candidate.split(/\s+/)[0], Object.keys(KNOWN_LOCATIONS));

      if (fuzzyLoc && KNOWN_LOCATIONS[fuzzyLoc.term]) {
        extractedLocName = fuzzyLoc.term.replace(/_/g, ' ');
        fuzzyMatchCount++;
        text = text.replace(locPrepMatch[0], ' ');
        tokensRemoved.push(locPrepMatch[0]);
      } else {
        const firstWord = candidate.split(/\s+/)[0];
        if (!CATEGORY_SYNONYMS[firstWord] && !STOP_WORDS.has(firstWord) && !ATTRIBUTE_VALUES.colors.includes(firstWord)) {
          extractedLocName = candidate;
          text = text.replace(locPrepMatch[0], ' ');
          tokensRemoved.push(locPrepMatch[0]);
        }
      }
    }
  }

  // Fallback location check
  if (!extractedLocName) {
    for (const locKey of Object.keys(KNOWN_LOCATIONS)) {
      const locDisplay = locKey.replace(/_/g, ' ');
      const locRegex = new RegExp(`\\b${locDisplay}\\b`, 'i');
      if (locRegex.test(text)) {
        extractedLocName = locDisplay;
        text = text.replace(locRegex, ' ');
        tokensRemoved.push(locDisplay);
        break;
      }
    }

    if (!extractedLocName) {
      const words = text.replace(/[^a-z\s]/gi, ' ').split(/\s+/).filter((w) => w.length >= 4);
      for (const w of words) {
        const fuzzyStandalone = findFuzzyMatch(w, Object.keys(KNOWN_LOCATIONS));
        if (fuzzyStandalone && KNOWN_LOCATIONS[fuzzyStandalone.term]) {
          extractedLocName = fuzzyStandalone.term.replace(/_/g, ' ');
          fuzzyMatchCount++;
          const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
          text = text.replace(wordRegex, ' ');
          tokensRemoved.push(w);
          break;
        }
      }
    }
  }

  if (extractedLocName) {
    const locKey = extractedLocName.toLowerCase().replace(/\s+/g, '_');
    if (KNOWN_LOCATIONS[locKey]) {
      structuredQuery.location = {
        name: extractedLocName.toLowerCase(),
        latitude: KNOWN_LOCATIONS[locKey].latitude,
        longitude: KNOWN_LOCATIONS[locKey].longitude
      };
      structuredQuery.latitude = KNOWN_LOCATIONS[locKey].latitude;
      structuredQuery.longitude = KNOWN_LOCATIONS[locKey].longitude;
    } else {
      structuredQuery.location = {
        name: extractedLocName.toLowerCase(),
        latitude: null,
        longitude: null
      };
    }
  } else if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
    structuredQuery.location = {
      name: null,
      latitude: Number(latitude),
      longitude: longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : null
    };
    structuredQuery.latitude = Number(latitude);
    if (structuredQuery.location.longitude !== null) structuredQuery.longitude = structuredQuery.location.longitude;
  }

  // 3. Price (Range, Max, Min)
  const rangePattern = /\b(?:between|from)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\b/i;
  const rangeMatch = text.match(rangePattern);
  if (rangeMatch) {
    structuredQuery.price.min = parseFloat(rangeMatch[1]);
    structuredQuery.price.max = parseFloat(rangeMatch[2]);
    structuredQuery.minPrice = structuredQuery.price.min;
    structuredQuery.maxPrice = structuredQuery.price.max;
    text = text.replace(rangeMatch[0], ' ');
    tokensRemoved.push(rangeMatch[0]);
  } else {
    const maxPattern = /\b(?:under|below|less than|upto|up to|within|max|maximum of)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\b/i;
    const maxMatch = text.match(maxPattern);
    if (maxMatch) {
      structuredQuery.price.max = parseFloat(maxMatch[1]);
      structuredQuery.maxPrice = structuredQuery.price.max;
      text = text.replace(maxMatch[0], ' ');
      tokensRemoved.push(maxMatch[0]);
    }

    const minPattern = /\b(?:above|over|more than|exceeding|min|minimum of|starting from|greater than)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\b/i;
    const minMatch = text.match(minPattern);
    if (minMatch) {
      structuredQuery.price.min = parseFloat(minMatch[1]);
      structuredQuery.minPrice = structuredQuery.price.min;
      text = text.replace(minMatch[0], ' ');
      tokensRemoved.push(minMatch[0]);
    }
  }

  // 4. Attributes (Exact + Fuzzy)
  for (const color of ATTRIBUTE_VALUES.colors) {
    const colorRegex = new RegExp(`\\b${color}\\b`, 'i');
    if (colorRegex.test(text)) {
      structuredQuery.attributes.color = color;
      text = text.replace(colorRegex, ' ');
      break;
    }
  }
  if (!structuredQuery.attributes.color) {
    const words = text.replace(/[^a-z\s]/gi, ' ').split(/\s+/).filter((w) => w.length >= 3);
    for (const w of words) {
      const fuzzyColor = findFuzzyMatch(w, ATTRIBUTE_VALUES.colors);
      if (fuzzyColor) {
        structuredQuery.attributes.color = fuzzyColor.term;
        fuzzyMatchCount++;
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        text = text.replace(wordRegex, ' ');
        break;
      }
    }
  }

  for (const style of ATTRIBUTE_VALUES.styles) {
    const styleRegex = new RegExp(`\\b${style}\\b`, 'i');
    if (styleRegex.test(text)) {
      structuredQuery.attributes.style = (style === 'sporty' || style === 'sport') ? 'sports' : style;
      text = text.replace(styleRegex, ' ');
      break;
    }
  }
  if (!structuredQuery.attributes.style) {
    const words = text.replace(/[^a-z\s]/gi, ' ').split(/\s+/).filter((w) => w.length >= 4);
    for (const w of words) {
      const fuzzyStyle = findFuzzyMatch(w, ATTRIBUTE_VALUES.styles);
      if (fuzzyStyle) {
        structuredQuery.attributes.style = (fuzzyStyle.term === 'sporty' || fuzzyStyle.term === 'sport') ? 'sports' : fuzzyStyle.term;
        fuzzyMatchCount++;
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        text = text.replace(wordRegex, ' ');
        break;
      }
    }
  }

  for (const mat of ATTRIBUTE_VALUES.materials) {
    const matRegex = new RegExp(`\\b${mat}\\b`, 'i');
    if (matRegex.test(text)) {
      structuredQuery.attributes.material = mat;
      text = text.replace(matRegex, ' ');
      break;
    }
  }
  if (!structuredQuery.attributes.material) {
    const words = text.replace(/[^a-z\s]/gi, ' ').split(/\s+/).filter((w) => w.length >= 4);
    for (const w of words) {
      const fuzzyMat = findFuzzyMatch(w, ATTRIBUTE_VALUES.materials);
      if (fuzzyMat) {
        structuredQuery.attributes.material = fuzzyMat.term;
        fuzzyMatchCount++;
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        text = text.replace(wordRegex, ' ');
        break;
      }
    }
  }

  const sizeExplicitMatch = text.match(/\bsize\s*[:\s]\s*([a-z0-9]+)\b/i);
  if (sizeExplicitMatch) {
    structuredQuery.attributes.size = sizeExplicitMatch[1].toUpperCase();
    text = text.replace(sizeExplicitMatch[0], ' ');
  } else {
    const sizeStandaloneMatch = text.match(/\b(xxxl|xxl|xl|xs)\b/i);
    if (sizeStandaloneMatch) {
      structuredQuery.attributes.size = sizeStandaloneMatch[1].toUpperCase();
      text = text.replace(sizeStandaloneMatch[0], ' ');
    }
  }

  // 5. Category (Exact + Fuzzy)
  const sortedSynonyms = Object.keys(CATEGORY_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const syn of sortedSynonyms) {
    const synRegex = new RegExp(`\\b${syn}\\b`, 'i');
    if (synRegex.test(text)) {
      structuredQuery.category = CATEGORY_SYNONYMS[syn];
      text = text.replace(synRegex, ' ');
      break;
    }
  }

  if (!structuredQuery.category) {
    const words = text.replace(/[^a-z\s]/gi, ' ').split(/\s+/).filter((w) => w.length >= 4);
    for (const w of words) {
      const fuzzySyn = findFuzzyMatch(w, sortedSynonyms);
      if (fuzzySyn && CATEGORY_SYNONYMS[fuzzySyn.term]) {
        structuredQuery.category = CATEGORY_SYNONYMS[fuzzySyn.term];
        fuzzyMatchCount++;
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        text = text.replace(wordRegex, ' ');
        break;
      }
    }
  }

  // 6. Filler Phrases Removal
  const fillerPattern = /\b(i am looking for|i'm looking for|i need|i want|looking for|search for|find me|show me|get me|please find|tell me|bring me|give me|can you find|can you show|near me|nearby|search|find)\b/gi;
  text = text.replace(fillerPattern, ' ');

  // 7. Keywords
  const extractedKeywords = [];
  if (structuredQuery.attributes.color) extractedKeywords.push(structuredQuery.attributes.color);
  if (structuredQuery.attributes.style) extractedKeywords.push(structuredQuery.attributes.style);
  if (structuredQuery.attributes.material && !extractedKeywords.includes(structuredQuery.attributes.material)) {
    extractedKeywords.push(structuredQuery.attributes.material);
  }

  const residualWords = text
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w) && isNaN(Number(w)));

  for (const w of residualWords) {
    if (!extractedKeywords.includes(w)) {
      extractedKeywords.push(w);
    }
  }

  structuredQuery.keywords = extractedKeywords;

  // 8. Confidence Score
  let score = 0.30;
  if (structuredQuery.category) score += 0.25;
  if (structuredQuery.price.min !== null || structuredQuery.price.max !== null) score += 0.15;
  if (structuredQuery.location) {
    score += 0.15;
    if (structuredQuery.location.latitude !== null && structuredQuery.location.longitude !== null) {
      score += 0.05;
    }
  }
  let attributeCount = 0;
  if (structuredQuery.attributes.color) attributeCount++;
  if (structuredQuery.attributes.style) attributeCount++;
  if (structuredQuery.attributes.material) attributeCount++;
  if (structuredQuery.attributes.size) attributeCount++;
  score += Math.min(0.20, attributeCount * 0.10);
  if (structuredQuery.keywords.length > 0) score += 0.05;

  let finalConfidence = Math.min(0.98, Math.max(0.1, Math.round(score * 100) / 100));

  if (fuzzyMatchCount > 0) {
    finalConfidence = Math.max(0.10, Math.round((finalConfidence - Math.min(0.15, fuzzyMatchCount * 0.05)) * 100) / 100);
  }

  structuredQuery.confidence = finalConfidence;

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
    const maxPrice = structuredQuery.price?.max !== undefined && structuredQuery.price?.max !== null
      ? structuredQuery.price.max
      : structuredQuery.maxPrice;
    if (maxPrice !== undefined && maxPrice !== null) {
      const price = Number(product.price);
      if (isNaN(price) || price > maxPrice) {
        return false;
      }
    }

    // 3. Min price filter
    const minPrice = structuredQuery.price?.min !== undefined && structuredQuery.price?.min !== null
      ? structuredQuery.price.min
      : structuredQuery.minPrice;
    if (minPrice !== undefined && minPrice !== null) {
      const price = Number(product.price);
      if (isNaN(price) || price < minPrice) {
        return false;
      }
    }

    // 4. Color Attribute Filter
    if (structuredQuery.attributes?.color) {
      const targetColor = structuredQuery.attributes.color.toLowerCase();
      const prodColor = product.attributes?.color?.toLowerCase();
      const inNameOrDesc = (product.name || '').toLowerCase().includes(targetColor) ||
        (product.description || '').toLowerCase().includes(targetColor);
      if (prodColor !== targetColor && !inNameOrDesc) {
        return false;
      }
    }

    // 5. Style Attribute Filter
    if (structuredQuery.attributes?.style) {
      const targetStyle = structuredQuery.attributes.style.toLowerCase();
      const prodStyle = product.attributes?.style?.toLowerCase();
      const inNameOrDesc = (product.name || '').toLowerCase().includes(targetStyle) ||
        (product.description || '').toLowerCase().includes(targetStyle);
      if (prodStyle !== targetStyle && !inNameOrDesc) {
        return false;
      }
    }

    // 6. Material Attribute Filter
    if (structuredQuery.attributes?.material) {
      const targetMat = structuredQuery.attributes.material.toLowerCase();
      const prodMat = product.attributes?.material?.toLowerCase();
      const inNameOrDesc = (product.name || '').toLowerCase().includes(targetMat) ||
        (product.description || '').toLowerCase().includes(targetMat);
      if (prodMat !== targetMat && !inNameOrDesc) {
        return false;
      }
    }

    // 7. Size Attribute Filter
    if (structuredQuery.attributes?.size) {
      const targetSize = structuredQuery.attributes.size.toUpperCase();
      const prodSize = (product.attributes?.size || '').toUpperCase();
      const inNameOrDesc = (product.name || '').toUpperCase().includes(targetSize);
      if (prodSize !== targetSize && !inNameOrDesc) {
        return false;
      }
    }

    // 8. Keywords filter (matches name, description, category, or shopName)
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
            shops: Array.isArray(data.shops) ? data.shops : [],
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
