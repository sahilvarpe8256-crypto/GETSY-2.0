/**
 * GETSY 2.0 — Base AI Provider Abstract Interface
 * ===============================================
 * Defines the standard contract that all AI search providers must implement.
 * Allows switching between deterministic rule-based NLP and future LLM providers
 * without modifying consumers.
 */

class BaseAIProvider {
  /**
   * @param {string} name - Identifier name of the provider
   * @param {object} [config={}] - Optional configuration options
   */
  constructor(name = 'base-provider', config = {}) {
    if (this.constructor === BaseAIProvider) {
      throw new Error('BaseAIProvider is an abstract class and cannot be instantiated directly.');
    }
    this.name = name;
    this.config = config;
  }

  /**
   * Parse a natural-language query into structured search parameters.
   *
   * @param {string} query - Natural language search query
   * @param {object} [options={}] - Additional context options (e.g. coordinates)
   * @returns {Promise<object>} Parsed structured query
   */
  async parse(query, options = {}) {
    throw new Error(`Method 'parse()' must be implemented by provider [${this.name}].`);
  }

  /**
   * Execute intelligent search over a collection of products.
   *
   * @param {string} query - Natural language search query
   * @param {Array<object>} [products=[]] - List of candidate products to filter/rank
   * @param {object} [options={}] - Search options (e.g. limit, radius, coordinates)
   * @returns {Promise<{ structuredQuery: object, products: Array<object>, total: number }>}
   */
  async search(query, products = [], options = {}) {
    throw new Error(`Method 'search()' must be implemented by provider [${this.name}].`);
  }
}

module.exports = BaseAIProvider;
