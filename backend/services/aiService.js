const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { parseQuery: coreParseQuery } = require('../../ai/src');

/**
 * Parses a natural language search query using the standalone /ai NLP engine.
 * Ensures backward-compatibility by mapping top-level shortcut fields (maxPrice, minPrice, latitude, longitude)
 * alongside the rich structured query.
 *
 * @param {string} query - Natural language search query
 * @param {number|undefined} latitude - Optional latitude from request body
 * @param {number|undefined} longitude - Optional longitude from request body
 * @returns {object} Normalized structuredQuery object
 */
const parseQuery = (query, latitude, longitude) => {
  const options = {};
  if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
    options.latitude = parseFloat(latitude);
  }
  if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
    options.longitude = parseFloat(longitude);
  }

  const structured = coreParseQuery(query, options);

  // Backward-compatibility mappings for frontend & legacy API consumers
  if (structured.price.max !== null) {
    structured.maxPrice = structured.price.max;
  }
  if (structured.price.min !== null) {
    structured.minPrice = structured.price.min;
  }
  if (structured.location && structured.location.latitude !== null && structured.location.longitude !== null) {
    structured.latitude = structured.location.latitude;
    structured.longitude = structured.location.longitude;
  }

  return structured;
};

/**
 * Intelligent AI-powered search querying real MongoDB Product and Shop collections.
 *
 * @param {object} params
 * @param {string} params.query - Natural language search query
 * @param {number|undefined} params.latitude - Optional latitude
 * @param {number|undefined} params.longitude - Optional longitude
 * @returns {Promise<{ structuredQuery: object, products: Array, shops?: Array }>}
 */
const intelligentSearch = async ({ query, latitude, longitude }) => {
  // Step 1: Parse the natural language query using the standalone /ai module
  const structuredQuery = parseQuery(query, latitude, longitude);

  // Step 2: Handle Shop Search Intent
  if (structuredQuery.intent === 'shop_search') {
    let shopFilter = {};
    if (structuredQuery.category) {
      shopFilter.shopType = new RegExp(structuredQuery.category.trim(), 'i');
    }

    let shops = [];
    if (structuredQuery.location && structuredQuery.location.latitude !== null && structuredQuery.location.longitude !== null) {
      try {
        shops = await Shop.find({
          ...shopFilter,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [structuredQuery.location.longitude, structuredQuery.location.latitude]
              },
              $maxDistance: 50000 // 50km radius
            }
          }
        });
      } catch {
        shops = await Shop.find(shopFilter);
      }
    } else {
      shops = await Shop.find(shopFilter);
    }

    return {
      structuredQuery,
      products: [],
      shops: shops.map((s) => s.toPublicJSON())
    };
  }

  // Step 3: Handle Product Search & Browse Intents against real MongoDB Product collection
  const filter = {};

  // Category filter (case-insensitive exact match)
  if (structuredQuery.category) {
    filter.category = new RegExp('^' + structuredQuery.category.trim() + '$', 'i');
  }

  // Price constraints (min, max, or range)
  const priceFilter = {};
  if (structuredQuery.price.min !== null) {
    priceFilter.$gte = structuredQuery.price.min;
  }
  if (structuredQuery.price.max !== null) {
    priceFilter.$lte = structuredQuery.price.max;
  }
  if (Object.keys(priceFilter).length > 0) {
    filter.price = priceFilter;
  }

  // Keywords and Product Attributes matching
  // Note: Product schema currently contains name, category, description, price, shopId, stock, available.
  // Attributes (color, style, material) are contained within name/description text in MongoDB.
  const searchTokens = [];
  if (Array.isArray(structuredQuery.keywords) && structuredQuery.keywords.length > 0) {
    searchTokens.push(...structuredQuery.keywords);
  }
  if (structuredQuery.attributes.color && !searchTokens.includes(structuredQuery.attributes.color)) {
    searchTokens.push(structuredQuery.attributes.color);
  }
  if (structuredQuery.attributes.style && !searchTokens.includes(structuredQuery.attributes.style)) {
    searchTokens.push(structuredQuery.attributes.style);
  }
  if (structuredQuery.attributes.material && !searchTokens.includes(structuredQuery.attributes.material)) {
    searchTokens.push(structuredQuery.attributes.material);
  }

  if (searchTokens.length > 0) {
    const tokenRegex = new RegExp(searchTokens.join('|'), 'i');
    filter.$or = [
      { name: tokenRegex },
      { description: tokenRegex }
    ];
  }

  // Step 4: Proximity ranking / filtering if location coordinates are available
  if (structuredQuery.location && structuredQuery.location.latitude !== null && structuredQuery.location.longitude !== null) {
    try {
      const nearbyShops = await Shop.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [structuredQuery.location.longitude, structuredQuery.location.latitude]
            },
            $maxDistance: 50000 // 50km radius
          }
        }
      });

      if (nearbyShops && nearbyShops.length > 0) {
        const shopIds = nearbyShops.map((s) => s._id);
        const geoFilter = { ...filter, shopId: { $in: shopIds } };
        const geoProducts = await Product.find(geoFilter);
        if (geoProducts && geoProducts.length > 0) {
          return {
            structuredQuery,
            products: geoProducts.map((p) => p.toPublicJSON())
          };
        }
      }
    } catch {
      // If geospatial search is unsupported or fails, gracefully proceed with standard query
    }
  }

  // Step 5: Execute MongoDB Product Query
  const products = await Product.find(filter);

  return {
    structuredQuery,
    products: products.map((product) => product.toPublicJSON())
  };
};

module.exports = {
  parseQuery,
  intelligentSearch
};
