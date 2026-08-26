/**
 * GETSY 2.0 — Rule-Based Deterministic AI Provider
 * =================================================
 * Deterministic ₹0 implementation of BaseAIProvider.
 * Uses queryParser for natural-language understanding and provides
 * in-memory filtering over mock or supplied product datasets.
 */

const BaseAIProvider = require('./base');
const { parseQuery } = require('../parser/queryParser');
const { MOCK_PRODUCTS, MOCK_SHOPS } = require('../data/mockData');

class RuleBasedProvider extends BaseAIProvider {
  constructor(config = {}) {
    super('rule-based', config);
  }

  /**
   * Parse a natural-language query into structured search parameters.
   *
   * @param {string} query - Natural language search query
   * @param {object} [options={}] - Optional context options (e.g. coordinates)
   * @returns {Promise<object>} Structured query object
   */
  async parse(query, options = {}) {
    return parseQuery(query, options);
  }

  /**
   * Filter and rank products based on natural-language query parsing.
   *
   * @param {string} query - Natural language search query
   * @param {Array<object>} [products=MOCK_PRODUCTS] - Products list to search
   * @param {object} [options={}] - Search configuration
   * @returns {Promise<{ structuredQuery: object, products: Array<object>, total: number }>}
   */
  async search(query, products = MOCK_PRODUCTS, options = {}) {
    const structuredQuery = parseQuery(query, options);
    const candidateProducts = Array.isArray(products) && products.length > 0 ? products : MOCK_PRODUCTS;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        structuredQuery,
        products: candidateProducts,
        total: candidateProducts.length
      };
    }

    const filtered = candidateProducts.filter((product) => {
      // 1. Category Filter
      if (structuredQuery.category) {
        const prodCat = (product.category || '').toLowerCase().trim();
        const targetCat = structuredQuery.category.toLowerCase().trim();
        if (prodCat !== targetCat) {
          return false;
        }
      }

      // 2. Price Max Filter
      if (structuredQuery.price.max !== null && structuredQuery.price.max !== undefined) {
        const price = Number(product.price);
        if (isNaN(price) || price > structuredQuery.price.max) {
          return false;
        }
      }

      // 3. Price Min Filter
      if (structuredQuery.price.min !== null && structuredQuery.price.min !== undefined) {
        const price = Number(product.price);
        if (isNaN(price) || price < structuredQuery.price.min) {
          return false;
        }
      }

      // 4. Color Attribute Filter
      if (structuredQuery.attributes.color) {
        const targetColor = structuredQuery.attributes.color.toLowerCase();
        const prodColor = product.attributes?.color?.toLowerCase();
        const inNameOrDesc = (product.name || '').toLowerCase().includes(targetColor) ||
          (product.description || '').toLowerCase().includes(targetColor);
        if (prodColor !== targetColor && !inNameOrDesc) {
          return false;
        }
      }

      // 5. Style Attribute Filter
      if (structuredQuery.attributes.style) {
        const targetStyle = structuredQuery.attributes.style.toLowerCase();
        const prodStyle = product.attributes?.style?.toLowerCase();
        const inNameOrDesc = (product.name || '').toLowerCase().includes(targetStyle) ||
          (product.description || '').toLowerCase().includes(targetStyle);
        if (prodStyle !== targetStyle && !inNameOrDesc) {
          return false;
        }
      }

      // 6. Material Attribute Filter
      if (structuredQuery.attributes.material) {
        const targetMat = structuredQuery.attributes.material.toLowerCase();
        const prodMat = product.attributes?.material?.toLowerCase();
        const inNameOrDesc = (product.name || '').toLowerCase().includes(targetMat) ||
          (product.description || '').toLowerCase().includes(targetMat);
        if (prodMat !== targetMat && !inNameOrDesc) {
          return false;
        }
      }

      // 7. Size Attribute Filter
      if (structuredQuery.attributes.size) {
        const targetSize = structuredQuery.attributes.size.toUpperCase();
        const prodSize = (product.attributes?.size || '').toUpperCase();
        const inNameOrDesc = (product.name || '').toUpperCase().includes(targetSize);
        if (prodSize !== targetSize && !inNameOrDesc) {
          return false;
        }
      }

      // 8. General Keyword matching (matches product name, description, or shopName)
      if (structuredQuery.keywords && structuredQuery.keywords.length > 0) {
        const name = (product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const shop = (product.shopName || '').toLowerCase();

        // At least one keyword should be reflected in the product
        const hasKeywordMatch = structuredQuery.keywords.some((kw) => {
          const cleanKw = kw.toLowerCase().trim();
          return name.includes(cleanKw) || desc.includes(cleanKw) || shop.includes(cleanKw);
        });

        if (!hasKeywordMatch) {
          return false;
        }
      }

      return true;
    });

    return {
      structuredQuery,
      products: filtered,
      total: filtered.length
    };
  }

  /**
   * Search shops matching intent and location.
   *
   * @param {string} query - Natural language search query
   * @param {Array<object>} [shops=MOCK_SHOPS] - Shops list
   * @param {object} [options={}] - Search configuration
   * @returns {Promise<{ structuredQuery: object, shops: Array<object>, total: number }>}
   */
  async searchShops(query, shops = MOCK_SHOPS, options = {}) {
    const structuredQuery = parseQuery(query, options);
    const candidateShops = Array.isArray(shops) && shops.length > 0 ? shops : MOCK_SHOPS;

    const filtered = candidateShops.filter((shop) => {
      if (structuredQuery.location?.name) {
        const targetCity = structuredQuery.location.name.toLowerCase();
        const shopCity = (shop.city || '').toLowerCase();
        if (shopCity !== targetCity && !shopCity.includes(targetCity)) {
          return false;
        }
      }

      if (structuredQuery.category) {
        const targetCat = structuredQuery.category.toLowerCase();
        const shopCat = (shop.category || '').toLowerCase();
        if (shopCat !== targetCat) {
          return false;
        }
      }

      return true;
    });

    return {
      structuredQuery,
      shops: filtered,
      total: filtered.length
    };
  }
}

module.exports = RuleBasedProvider;
