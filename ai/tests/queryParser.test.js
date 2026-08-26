/**
 * GETSY 2.0 — Query Parser Unit Tests
 * ====================================
 * Comprehensive unit tests for the pure, deterministic query parser.
 * Runs completely offline without MongoDB, Express, or external APIs.
 */

const { parseQuery } = require('../src/parser/queryParser');

describe('Query Parser — GETSY 2.0 Deterministic NLP', () => {

  describe('1. Exact Target Query Verification', () => {
    it('should correctly parse the exact target query: "I need black formal shoes under 2000 near Sangamner"', () => {
      const result = parseQuery('I need black formal shoes under 2000 near Sangamner');

      expect(result.intent).toBe('product_search');
      expect(result.category).toBe('footwear');
      expect(result.attributes.color).toBe('black');
      expect(result.attributes.style).toBe('formal');
      expect(result.attributes.material).toBeNull();
      expect(result.attributes.size).toBeNull();
      expect(result.price.min).toBeNull();
      expect(result.price.max).toBe(2000);
      expect(result.location).not.toBeNull();
      expect(result.location.name).toBe('sangamner');
      expect(result.location.latitude).toBe(19.57);
      expect(result.location.longitude).toBe(74.21);
      expect(result.keywords).toContain('black');
      expect(result.keywords).toContain('formal');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.originalQuery).toBe('I need black formal shoes under 2000 near Sangamner');
    });
  });

  describe('2. Empty, Null, and Malformed Queries', () => {
    it('should gracefully handle empty string', () => {
      const result = parseQuery('');
      expect(result.intent).toBe('browse');
      expect(result.category).toBeNull();
      expect(result.keywords).toEqual([]);
      expect(result.confidence).toBe(0);
    });

    it('should gracefully handle whitespace-only query', () => {
      const result = parseQuery('    ');
      expect(result.intent).toBe('browse');
      expect(result.category).toBeNull();
      expect(result.keywords).toEqual([]);
      expect(result.confidence).toBe(0);
    });

    it('should gracefully handle null input', () => {
      const result = parseQuery(null);
      expect(result.intent).toBe('browse');
      expect(result.category).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should gracefully handle undefined input', () => {
      const result = parseQuery(undefined);
      expect(result.intent).toBe('browse');
      expect(result.category).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should gracefully pass through options coordinates on empty query', () => {
      const result = parseQuery('', { latitude: 19.57, longitude: 74.21 });
      expect(result.location).toEqual({
        name: null,
        latitude: 19.57,
        longitude: 74.21
      });
    });
  });

  describe('3. Category Extraction and Extended Synonyms', () => {
    it('should map "shoes" -> "footwear"', () => {
      const result = parseQuery('shoes');
      expect(result.category).toBe('footwear');
    });

    it('should map "sneakers" -> "footwear"', () => {
      const result = parseQuery('sneakers');
      expect(result.category).toBe('footwear');
    });

    it('should map "sandals" -> "footwear"', () => {
      const result = parseQuery('sandals');
      expect(result.category).toBe('footwear');
    });

    it('should map "chappals" -> "footwear"', () => {
      const result = parseQuery('chappals');
      expect(result.category).toBe('footwear');
    });

    it('should map "shirt" -> "clothing"', () => {
      const result = parseQuery('shirt');
      expect(result.category).toBe('clothing');
    });

    it('should map "jeans" -> "clothing"', () => {
      const result = parseQuery('blue jeans');
      expect(result.category).toBe('clothing');
    });

    it('should map "kurta" -> "clothing"', () => {
      const result = parseQuery('cotton kurta');
      expect(result.category).toBe('clothing');
    });

    it('should map "laptop" -> "electronics"', () => {
      const result = parseQuery('laptop');
      expect(result.category).toBe('electronics');
    });

    it('should map "earbuds" -> "electronics"', () => {
      const result = parseQuery('wireless earbuds');
      expect(result.category).toBe('electronics');
    });

    it('should map "wallet" -> "accessories"', () => {
      const result = parseQuery('wallet');
      expect(result.category).toBe('accessories');
    });

    it('should map "sunglasses" -> "accessories"', () => {
      const result = parseQuery('sunglasses');
      expect(result.category).toBe('accessories');
    });
  });

  describe('4. Price Extraction', () => {
    it('should extract max price from "under 2000"', () => {
      const result = parseQuery('shoes under 2000');
      expect(result.price.max).toBe(2000);
      expect(result.price.min).toBeNull();
    });

    it('should extract max price from "below 500"', () => {
      const result = parseQuery('shirt below 500');
      expect(result.price.max).toBe(500);
      expect(result.price.min).toBeNull();
    });

    it('should extract max price from "upto 1500"', () => {
      const result = parseQuery('bag upto 1500');
      expect(result.price.max).toBe(1500);
      expect(result.price.min).toBeNull();
    });

    it('should extract min price from "above 1000"', () => {
      const result = parseQuery('shoes above 1000');
      expect(result.price.min).toBe(1000);
      expect(result.price.max).toBeNull();
    });

    it('should extract min price from "more than 800"', () => {
      const result = parseQuery('watch more than 800');
      expect(result.price.min).toBe(800);
      expect(result.price.max).toBeNull();
    });

    it('should extract price range from "between 500 and 2000"', () => {
      const result = parseQuery('shoes between 500 and 2000');
      expect(result.price.min).toBe(500);
      expect(result.price.max).toBe(2000);
    });

    it('should extract price range from "from 500 to 2000"', () => {
      const result = parseQuery('shoes from 500 to 2000');
      expect(result.price.min).toBe(500);
      expect(result.price.max).toBe(2000);
    });
  });

  describe('5. Location Extraction & Resolution', () => {
    it('should extract and resolve known location: "near Sangamner"', () => {
      const result = parseQuery('shoes near Sangamner');
      expect(result.location).toEqual({
        name: 'sangamner',
        latitude: 19.57,
        longitude: 74.21
      });
    });

    it('should extract and resolve known location: "in Pune"', () => {
      const result = parseQuery('electronics in Pune');
      expect(result.location).toEqual({
        name: 'pune',
        latitude: 18.52,
        longitude: 73.86
      });
    });

    it('should extract and resolve known location: "around Mumbai"', () => {
      const result = parseQuery('clothes around Mumbai');
      expect(result.location).toEqual({
        name: 'mumbai',
        latitude: 19.08,
        longitude: 72.88
      });
    });

    it('should extract unknown location without fabricating coordinates', () => {
      const result = parseQuery('shoes near Atlantis');
      expect(result.location).toEqual({
        name: 'atlantis',
        latitude: null,
        longitude: null
      });
    });
  });

  describe('6. Product Attributes Extraction', () => {
    it('should extract color: black, white, red, blue, etc.', () => {
      expect(parseQuery('black shoes').attributes.color).toBe('black');
      expect(parseQuery('white sneakers').attributes.color).toBe('white');
      expect(parseQuery('red shirt').attributes.color).toBe('red');
      expect(parseQuery('blue jeans').attributes.color).toBe('blue');
    });

    it('should extract style: formal, casual, sports, party, ethnic', () => {
      expect(parseQuery('formal shoes').attributes.style).toBe('formal');
      expect(parseQuery('casual shirt').attributes.style).toBe('casual');
      expect(parseQuery('sports shoes').attributes.style).toBe('sports');
      expect(parseQuery('party dress').attributes.style).toBe('party');
    });

    it('should extract material: leather, cotton, denim, silk', () => {
      expect(parseQuery('leather wallet').attributes.material).toBe('leather');
      expect(parseQuery('cotton shirt').attributes.material).toBe('cotton');
      expect(parseQuery('denim jacket').attributes.material).toBe('denim');
      expect(parseQuery('silk saree').attributes.material).toBe('silk');
    });

    it('should extract size: S, M, L, XL, XXL, and numeric sizes', () => {
      expect(parseQuery('shirt size L').attributes.size).toBe('L');
      expect(parseQuery('red shirt size XL').attributes.size).toBe('XL');
      expect(parseQuery('shoes size 9').attributes.size).toBe('9');
    });

    it('should extract multiple attributes simultaneously', () => {
      const result = parseQuery('find me a red cotton shirt size L under 1000');
      expect(result.category).toBe('clothing');
      expect(result.attributes.color).toBe('red');
      expect(result.attributes.material).toBe('cotton');
      expect(result.attributes.size).toBe('L');
      expect(result.price.max).toBe(1000);
    });
  });

  describe('7. Intent Classification', () => {
    it('should classify product searches as "product_search"', () => {
      expect(parseQuery('black shoes under 2000').intent).toBe('product_search');
      expect(parseQuery('leather wallet').intent).toBe('product_search');
      expect(parseQuery('smartphone').intent).toBe('product_search');
    });

    it('should classify shop searches as "shop_search"', () => {
      expect(parseQuery('shops near Sangamner').intent).toBe('shop_search');
      expect(parseQuery('shoe stores in Pune').intent).toBe('shop_search');
      expect(parseQuery('electronics shops').intent).toBe('shop_search');
    });

    it('should classify browse queries as "browse"', () => {
      expect(parseQuery('browse footwear').intent).toBe('browse');
      expect(parseQuery('show me electronics').intent).toBe('browse');
      expect(parseQuery('explore clothing').intent).toBe('browse');
    });
  });

  describe('8. Filler Word Removal and Keyword Extraction', () => {
    it('should strip filler phrases and stop words from keywords', () => {
      const result = parseQuery('I need black formal shoes under 2000 near Sangamner');
      expect(result.keywords).not.toContain('i');
      expect(result.keywords).not.toContain('need');
      expect(result.keywords).not.toContain('under');
      expect(result.keywords).not.toContain('near');
      expect(result.keywords).not.toContain('sangamner');
      expect(result.keywords).not.toContain('2000');
    });
  });

  describe('9. Confidence Scoring', () => {
    it('should return 0 for empty query', () => {
      expect(parseQuery('').confidence).toBe(0);
    });

    it('should increase score as more meaningful structure is extracted', () => {
      const singleWord = parseQuery('shoes');
      const withPrice = parseQuery('shoes under 2000');
      const fullQuery = parseQuery('I need black formal shoes under 2000 near Sangamner');

      expect(fullQuery.confidence).toBeGreaterThan(withPrice.confidence);
      expect(withPrice.confidence).toBeGreaterThan(singleWord.confidence);
      expect(fullQuery.confidence).toBeLessThanOrEqual(1.0);
    });
  });

});
