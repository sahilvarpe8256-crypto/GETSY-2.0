/**
 * GETSY 2.0 — Deterministic Rule-Based Natural Language Query Parser
 * =================================================================
 * Pure function parser that transforms natural language search queries into
 * normalized, structured parameters.
 *
 * Characteristics:
 * - Pure & deterministic: No side effects, no I/O, no DB/network access.
 * - ₹0 cost: Fully offline, no external API keys or LLM dependencies.
 * - Extensible: Relies on data-driven categories and location maps.
 */

const { CATEGORIES } = require('../data/categories');
const { LOCATIONS } = require('../data/locations');

// Build inverted synonym index: { synonym -> canonicalCategory }
const SYNONYM_MAP = {};
for (const [canonical, synonyms] of Object.entries(CATEGORIES)) {
  // Map canonical category name to itself
  SYNONYM_MAP[canonical.toLowerCase()] = canonical;
  for (const synonym of synonyms) {
    SYNONYM_MAP[synonym.toLowerCase()] = canonical;
  }
}

// Sorted synonym list (longer phrases first to avoid greedy substring collisions)
const SORTED_SYNONYMS = Object.keys(SYNONYM_MAP).sort((a, b) => b.length - a.length);

// Known attribute dictionaries
const ATTRIBUTE_VALUES = {
  colors: [
    'black', 'white', 'red', 'blue', 'brown', 'green', 'yellow',
    'grey', 'gray', 'pink', 'orange', 'purple', 'beige', 'maroon',
    'navy', 'teal', 'cream', 'olive'
  ],
  styles: [
    'formal', 'casual', 'sports', 'sporty', 'party', 'ethnic',
    'traditional', 'vintage', 'modern', 'classic', 'designer'
  ],
  materials: [
    'leather', 'cotton', 'denim', 'silk', 'gold', 'silver',
    'wool', 'woolen', 'linen', 'polyester', 'nylon', 'velvet',
    'canvas', 'plastic', 'metal', 'wood', 'wooden', 'ceramic',
    'brass', 'copper'
  ],
  sizes: [
    'xxxl', 'xxl', 'xl', 'xs', 's', 'm', 'l'
  ]
};

// Conversational filler phrases
const FILLER_PHRASES = [
  'i am looking for', "i'm looking for", 'i need', 'i want',
  'looking for', 'search for', 'find me', 'show me', 'get me',
  'please find', 'tell me', 'bring me', 'give me', 'can you find',
  'can you show', 'near me', 'nearby', 'search', 'find'
];

// Common stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'with', 'in', 'on',
  'at', 'to', 'from', 'by', 'near', 'around', 'about', 'me', 'my',
  'i', 'we', 'you', 'it', 'this', 'that', 'these', 'those', 'is',
  'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do',
  'does', 'did', 'will', 'would', 'can', 'could', 'should', 'want',
  'need', 'please', 'some', 'any', 'all', 'item', 'items', 'product',
  'products', 'good', 'best', 'cheap', 'affordable', 'top', 'buy',
  'purchase', 'shop', 'shops', 'store', 'stores'
]);

/**
 * Parses a natural-language query into a structured object.
 *
 * @param {string} query - Natural language search query (e.g. "I need black formal shoes under 2000 near Sangamner")
 * @param {object} [options] - Optional context options (e.g. { latitude, longitude })
 * @returns {object} Normalized structured query
 */
function parseQuery(query, options = {}) {
  const originalQuery = typeof query === 'string' ? query : (query ? String(query) : '');

  // Default empty structure
  const result = {
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
    originalQuery: originalQuery
  };

  if (!query || typeof query !== 'string' || !query.trim()) {
    // If external coordinates provided with empty query, pass through location
    if (options && (options.latitude !== undefined || options.longitude !== undefined)) {
      result.location = {
        name: null,
        latitude: options.latitude !== undefined && options.latitude !== null ? Number(options.latitude) : null,
        longitude: options.longitude !== undefined && options.longitude !== null ? Number(options.longitude) : null
      };
    }
    result.intent = 'browse';
    return result;
  }

  let text = ' ' + originalQuery.toLowerCase().trim() + ' ';
  let tokensRemoved = [];

  // =========================================================================
  // 1. INTENT CLASSIFICATION
  // =========================================================================
  const isShopSearch = /\b(shops|shop|stores|store|outlets|outlet|dealers|dealer|showrooms|showroom|market|markets|boutique|boutiques)\b/i.test(text);
  const isBrowse = /^\s*(browse|explore|show all|view all|list all)\b/i.test(originalQuery.trim()) ||
    /^\s*(show me|view|browse|explore)\s+(all\s+)?(footwear|clothing|electronics|accessories|grocery|beauty|sports|books|home|products|items)\s*$/i.test(originalQuery.trim());

  if (isShopSearch) {
    result.intent = 'shop_search';
  } else if (isBrowse) {
    result.intent = 'browse';
  } else {
    result.intent = 'product_search';
  }

  // =========================================================================
  // 2. LOCATION EXTRACTION & RESOLUTION
  // =========================================================================
  // Try pattern: (near|in|around|at|from|to)\s+([a-z_]+(?:\s+[a-z_]+)?)
  let extractedLocName = null;
  const locationPrepMatch = text.match(/\b(?:near|in|around|at|from|to)\s+([a-z]+(?:\s+[a-z]+)?)\b/i);

  if (locationPrepMatch) {
    const candidate = locationPrepMatch[1].trim();
    const candidateKey = candidate.replace(/\s+/g, '_');
    
    if (LOCATIONS[candidateKey] || LOCATIONS[candidate]) {
      extractedLocName = candidate;
      text = text.replace(locationPrepMatch[0], ' ');
      tokensRemoved.push(locationPrepMatch[0]);
    } else {
      // Check if candidate is not a common category/stopword before treating as unknown location
      const firstWord = candidate.split(/\s+/)[0];
      if (!SYNONYM_MAP[firstWord] && !STOP_WORDS.has(firstWord) && !ATTRIBUTE_VALUES.colors.includes(firstWord)) {
        extractedLocName = candidate;
        text = text.replace(locationPrepMatch[0], ' ');
        tokensRemoved.push(locationPrepMatch[0]);
      }
    }
  }

  // Fallback: check if any known location name appears standalone in text
  if (!extractedLocName) {
    for (const locKey of Object.keys(LOCATIONS)) {
      const locDisplay = locKey.replace(/_/g, ' ');
      const locRegex = new RegExp(`\\b${locDisplay}\\b`, 'i');
      if (locRegex.test(text)) {
        extractedLocName = locDisplay;
        text = text.replace(locRegex, ' ');
        tokensRemoved.push(locDisplay);
        break;
      }
    }
  }

  if (extractedLocName) {
    const locKey = extractedLocName.toLowerCase().replace(/\s+/g, '_');
    if (LOCATIONS[locKey]) {
      result.location = {
        name: extractedLocName.toLowerCase(),
        latitude: LOCATIONS[locKey].latitude,
        longitude: LOCATIONS[locKey].longitude
      };
    } else {
      result.location = {
        name: extractedLocName.toLowerCase(),
        latitude: null,
        longitude: null
      };
    }
  } else if (options && (options.latitude !== undefined || options.longitude !== undefined)) {
    result.location = {
      name: null,
      latitude: options.latitude !== undefined && options.latitude !== null ? Number(options.latitude) : null,
      longitude: options.longitude !== undefined && options.longitude !== null ? Number(options.longitude) : null
    };
  }

  // =========================================================================
  // 3. PRICE PARSING (Range, Max, Min)
  // =========================================================================
  // A. Price range: "between 500 and 2000", "from 500 to 2000", "500 - 2000"
  const rangePattern = /\b(?:between|from)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\b/i;
  const rangeMatch = text.match(rangePattern);

  if (rangeMatch) {
    result.price.min = parseFloat(rangeMatch[1]);
    result.price.max = parseFloat(rangeMatch[2]);
    text = text.replace(rangeMatch[0], ' ');
    tokensRemoved.push(rangeMatch[0]);
  } else {
    // B. Max price: "under 2000", "below 500", "less than 1000", "upto 2000", "up to 2000", "within 1500"
    const maxPattern = /\b(?:under|below|less than|upto|up to|within|max|maximum of)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\b/i;
    const maxMatch = text.match(maxPattern);
    if (maxMatch) {
      result.price.max = parseFloat(maxMatch[1]);
      text = text.replace(maxMatch[0], ' ');
      tokensRemoved.push(maxMatch[0]);
    }

    // C. Min price: "above 1000", "over 1000", "more than 1000", "exceeding 500", "min 500", "starting from 500"
    const minPattern = /\b(?:above|over|more than|exceeding|min|minimum of|starting from|greater than)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\b/i;
    const minMatch = text.match(minPattern);
    if (minMatch) {
      result.price.min = parseFloat(minMatch[1]);
      text = text.replace(minMatch[0], ' ');
      tokensRemoved.push(minMatch[0]);
    }
  }

  // =========================================================================
  // 4. PRODUCT ATTRIBUTES EXTRACTION (Color, Style, Material, Size)
  // =========================================================================
  // A. Color
  for (const color of ATTRIBUTE_VALUES.colors) {
    const colorRegex = new RegExp(`\\b${color}\\b`, 'i');
    if (colorRegex.test(text)) {
      result.attributes.color = color;
      text = text.replace(colorRegex, ' ');
      break;
    }
  }

  // B. Style
  for (const style of ATTRIBUTE_VALUES.styles) {
    const styleRegex = new RegExp(`\\b${style}\\b`, 'i');
    if (styleRegex.test(text)) {
      result.attributes.style = (style === 'sporty' || style === 'sport') ? 'sports' : style;
      text = text.replace(styleRegex, ' ');
      break;
    }
  }

  // C. Material
  for (const material of ATTRIBUTE_VALUES.materials) {
    const matRegex = new RegExp(`\\b${material}\\b`, 'i');
    if (matRegex.test(text)) {
      result.attributes.material = material;
      text = text.replace(matRegex, ' ');
      break;
    }
  }

  // D. Size
  // Pattern 1: "size L", "size 8", "size 42", "size XL"
  const sizeExplicitMatch = text.match(/\bsize\s*[:\s]\s*([a-z0-9]+)\b/i);
  if (sizeExplicitMatch) {
    result.attributes.size = sizeExplicitMatch[1].toUpperCase();
    text = text.replace(sizeExplicitMatch[0], ' ');
  } else {
    // Pattern 2: Standalone size tokens (xxl, xl, xs, xxxl) or "size L"
    const sizeStandaloneMatch = text.match(/\b(xxxl|xxl|xl|xs)\b/i);
    if (sizeStandaloneMatch) {
      result.attributes.size = sizeStandaloneMatch[1].toUpperCase();
      text = text.replace(sizeStandaloneMatch[0], ' ');
    }
  }

  // =========================================================================
  // 5. CATEGORY EXTRACTION
  // =========================================================================
  for (const synonym of SORTED_SYNONYMS) {
    const synRegex = new RegExp(`\\b${synonym}\\b`, 'i');
    if (synRegex.test(text)) {
      result.category = SYNONYM_MAP[synonym];
      text = text.replace(synRegex, ' ');
      break;
    }
  }

  // =========================================================================
  // 6. FILLER PHRASES REMOVAL
  // =========================================================================
  for (const filler of FILLER_PHRASES) {
    const fillerRegex = new RegExp(`\\b${filler}\\b`, 'gi');
    text = text.replace(fillerRegex, ' ');
  }

  // =========================================================================
  // 7. KEYWORDS EXTRACTION
  // =========================================================================
  // Gather non-filler, non-stopword tokens from original query that add search value
  // Also keep detected attributes (like color/style) in keywords for broad text search compatibility
  const extractedKeywords = [];

  // Add recognized descriptive attributes to keywords if present in original query
  if (result.attributes.color) extractedKeywords.push(result.attributes.color);
  if (result.attributes.style) extractedKeywords.push(result.attributes.style);
  if (result.attributes.material && !extractedKeywords.includes(result.attributes.material)) {
    extractedKeywords.push(result.attributes.material);
  }

  // Extract any remaining non-trivial descriptive tokens from residual text
  const residualWords = text
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w) && isNaN(Number(w)));

  for (const word of residualWords) {
    if (!extractedKeywords.includes(word)) {
      extractedKeywords.push(word);
    }
  }

  result.keywords = extractedKeywords;

  // =========================================================================
  // 8. HEURISTIC CONFIDENCE SCORING (Deterministic 0.0 - 1.0)
  // =========================================================================
  let score = 0.30; // Baseline for any non-empty query

  if (result.category) score += 0.25;
  if (result.price.min !== null || result.price.max !== null) score += 0.15;
  if (result.location) {
    score += 0.15;
    if (result.location.latitude !== null && result.location.longitude !== null) {
      score += 0.05;
    }
  }

  let attributeCount = 0;
  if (result.attributes.color) attributeCount++;
  if (result.attributes.style) attributeCount++;
  if (result.attributes.material) attributeCount++;
  if (result.attributes.size) attributeCount++;

  score += Math.min(0.20, attributeCount * 0.10);

  if (result.keywords.length > 0) score += 0.05;

  // Bound score between 0 and 0.98 for heuristic safety
  result.confidence = Math.min(0.98, Math.max(0.1, Math.round(score * 100) / 100));

  return result;
}

module.exports = {
  parseQuery,
  ATTRIBUTE_VALUES,
  STOP_WORDS
};
