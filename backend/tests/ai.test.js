const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

let mongoServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Shop.deleteMany({});
  await Product.deleteMany({});
});

describe('Phase 5 AI Search Foundation', () => {
  let ownerToken;
  let ownerShopId;

  beforeEach(async () => {
    // Create Owner & Shop
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'AI Test Owner',
        email: 'aiowner@example.com',
        password: 'password123',
        role: 'owner'
      });
    ownerToken = ownerRes.body.token;

    const shopRes = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopName: 'AI Test Shop',
        shopType: 'Footwear',
        latitude: 19.57,
        longitude: 74.21
      });
    ownerShopId = shopRes.body.id;

    // Seed products for AI search testing
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: ownerShopId,
        name: 'Black Formal Shoes',
        category: 'Footwear',
        description: 'Classic black leather formal shoes',
        price: 1500
      });

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: ownerShopId,
        name: 'White Running Shoes',
        category: 'Footwear',
        description: 'Lightweight white running shoes',
        price: 2500
      });

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: ownerShopId,
        name: 'Brown Leather Belt',
        category: 'Accessories',
        description: 'Genuine brown leather belt',
        price: 800
      });

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: ownerShopId,
        name: 'Black Digital Watch',
        category: 'Accessories',
        description: 'Smart black digital watch',
        price: 3000
      });
  });

  describe('POST /api/search/ai (Intelligent Search)', () => {
    it('should return 200 with structuredQuery and products for a valid query', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'I need black formal shoes under 2000 near me',
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('structuredQuery');
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('should return 400 when query is missing', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when query is empty string', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: '   '
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should extract category from natural language query', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery).toHaveProperty('category', 'footwear');
    });

    it('should extract keywords from natural language query', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'black formal shoes'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery).toHaveProperty('keywords');
      expect(res.body.structuredQuery.keywords).toContain('black');
      expect(res.body.structuredQuery.keywords).toContain('formal');
    });

    it('should extract maxPrice from price patterns in query', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes under 2000'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery).toHaveProperty('maxPrice', 2000);
    });

    it('should pass through latitude and longitude to structuredQuery', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes',
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery).toHaveProperty('latitude', 19.57);
      expect(res.body.structuredQuery).toHaveProperty('longitude', 74.21);
    });

    it('should work without latitude and longitude (coordinates are optional)', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'black shoes'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('structuredQuery');
      expect(res.body).toHaveProperty('products');
      expect(res.body.structuredQuery).not.toHaveProperty('latitude');
      expect(res.body.structuredQuery).not.toHaveProperty('longitude');
    });

    it('should return 400 for invalid latitude (out of range)', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes',
          latitude: 100,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for invalid longitude (out of range)', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes',
          latitude: 19.57,
          longitude: 200
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 200 with empty products array when no products match', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'gaming keyboard'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBe(0);
    });

    it('should exclude products above maxPrice from results', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes under 2000'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);

      // All returned products should have price <= 2000
      for (const product of res.body.products) {
        expect(product.price).toBeLessThanOrEqual(2000);
      }

      // Black Formal Shoes (1500) should be included, White Running Shoes (2500) excluded
      const names = res.body.products.map((p) => p.name);
      expect(names).toContain('Black Formal Shoes');
      expect(names).not.toContain('White Running Shoes');
    });

    it('should handle full natural language query with category, keywords, price and location', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'I need black formal shoes under 2000 near me',
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery).toHaveProperty('category', 'footwear');
      expect(res.body.structuredQuery).toHaveProperty('keywords');
      expect(res.body.structuredQuery.keywords).toContain('black');
      expect(res.body.structuredQuery.keywords).toContain('formal');
      expect(res.body.structuredQuery).toHaveProperty('maxPrice', 2000);
      expect(res.body.structuredQuery).toHaveProperty('latitude', 19.57);
      expect(res.body.structuredQuery).toHaveProperty('longitude', 74.21);

      // Should return matching products under the price limit
      expect(res.body.products.length).toBeGreaterThan(0);
      for (const product of res.body.products) {
        expect(product.price).toBeLessThanOrEqual(2000);
      }
    });

    it('should not require authentication (public endpoint)', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes'
        });

      // No Authorization header provided — should still work
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('structuredQuery');
      expect(res.body).toHaveProperty('products');
    });
  });
});
