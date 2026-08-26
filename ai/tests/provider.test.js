/**
 * GETSY 2.0 — Provider Unit Tests
 * ================================
 * Tests the BaseAIProvider interface contract and the RuleBasedProvider search functionality.
 * Runs completely offline using in-memory mock data.
 */

const BaseAIProvider = require('../src/providers/base');
const RuleBasedProvider = require('../src/providers/ruleBasedProvider');
const { MOCK_PRODUCTS, MOCK_SHOPS } = require('../src/data/mockData');

describe('AI Provider Architecture & RuleBasedProvider', () => {

  describe('1. BaseAIProvider Interface Contract', () => {
    it('should throw an error if BaseAIProvider is instantiated directly', () => {
      expect(() => new BaseAIProvider()).toThrow(
        'BaseAIProvider is an abstract class and cannot be instantiated directly.'
      );
    });

    it('should enforce subclass to implement parse() and search()', async () => {
      class IncompleteProvider extends BaseAIProvider {
        constructor() {
          super('incomplete');
        }
      }

      const provider = new IncompleteProvider();
      await expect(provider.parse('shoes')).rejects.toThrow("Method 'parse()' must be implemented");
      await expect(provider.search('shoes')).rejects.toThrow("Method 'search()' must be implemented");
    });
  });

  describe('2. RuleBasedProvider Implementation', () => {
    let provider;

    beforeEach(() => {
      provider = new RuleBasedProvider();
    });

    it('should instantiate correctly with name "rule-based"', () => {
      expect(provider.name).toBe('rule-based');
    });

    it('should parse natural-language queries via provider.parse()', async () => {
      const parsed = await provider.parse('black formal shoes under 2000 near Sangamner');
      expect(parsed.category).toBe('footwear');
      expect(parsed.attributes.color).toBe('black');
      expect(parsed.attributes.style).toBe('formal');
      expect(parsed.price.max).toBe(2000);
      expect(parsed.location.name).toBe('sangamner');
    });

    it('should correctly search and match products for the exact target query', async () => {
      const result = await provider.search('I need black formal shoes under 2000 near Sangamner', MOCK_PRODUCTS);

      expect(result.structuredQuery).toBeDefined();
      expect(result.structuredQuery.category).toBe('footwear');
      expect(result.products.length).toBeGreaterThan(0);

      // Verify the top matched product is prod_001
      const topMatch = result.products.find((p) => p.id === 'prod_001');
      expect(topMatch).toBeDefined();
      expect(topMatch.name).toBe('Black Formal Shoes');
      expect(topMatch.price).toBe(1800);
      expect(topMatch.price).toBeLessThanOrEqual(2000);
      expect(topMatch.attributes.color).toBe('black');
      expect(topMatch.attributes.style).toBe('formal');
    });

    it('should filter products by price constraints', async () => {
      const resultUnder1000 = await provider.search('clothing under 1000', MOCK_PRODUCTS);
      expect(resultUnder1000.products.every((p) => p.price <= 1000)).toBe(true);

      const resultOver2000 = await provider.search('footwear above 2000', MOCK_PRODUCTS);
      expect(resultOver2000.products.every((p) => p.price >= 2000)).toBe(true);
    });

    it('should filter products by category', async () => {
      const result = await provider.search('wireless earbuds', MOCK_PRODUCTS);
      expect(result.products.some((p) => p.id === 'prod_006')).toBe(true);
      expect(result.products.every((p) => p.category === 'electronics')).toBe(true);
    });

    it('should return empty list when no products match criteria', async () => {
      const result = await provider.search('footwear under 100', MOCK_PRODUCTS);
      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter shops by location in searchShops()', async () => {
      const result = await provider.searchShops('shops near Sangamner', MOCK_SHOPS);
      expect(result.shops.length).toBeGreaterThan(0);
      expect(result.shops.every((s) => s.city.toLowerCase() === 'sangamner')).toBe(true);
    });

    it('should return all products when query is empty', async () => {
      const result = await provider.search('', MOCK_PRODUCTS);
      expect(result.products.length).toBe(MOCK_PRODUCTS.length);
    });
  });

});
