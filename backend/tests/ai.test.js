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

describe('Backend AI Search Integration (POST /api/search/ai)', () => {
  let ownerToken;
  let sangamnerShopId;
  let puneShopId;

  beforeEach(async () => {
    // 1. Create Owner User
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'AI Test Owner',
        email: 'aiowner@example.com',
        password: 'password123',
        role: 'owner'
      });
    ownerToken = ownerRes.body.token;

    // 2. Create Sangamner Shop
    const sangamnerShopRes = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopName: 'Sahil Footwear Sangamner',
        shopType: 'Footwear',
        address: 'Main Road, Sangamner',
        area: 'Sangamner',
        latitude: 19.57,
        longitude: 74.21
      });
    sangamnerShopId = sangamnerShopRes.body.id;

    // 3. Create Pune Shop
    const puneShopRes = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopName: 'Pune Active Tech',
        shopType: 'Electronics',
        address: 'FC Road, Pune',
        area: 'Pune',
        latitude: 18.52,
        longitude: 73.86
      });
    puneShopId = puneShopRes.body.id;

    // 4. Seed Products in MongoDB
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: sangamnerShopId,
        name: 'Black Formal Shoes',
        category: 'Footwear',
        description: 'Classic black leather formal shoes for men',
        price: 1800
      });

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: sangamnerShopId,
        name: 'White Running Shoes',
        category: 'Footwear',
        description: 'Lightweight white sports running sneakers',
        price: 2500
      });

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: sangamnerShopId,
        name: 'Brown Leather Belt',
        category: 'Accessories',
        description: 'Genuine brown leather belt',
        price: 650
      });

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopId: puneShopId,
        name: 'Wireless Earbuds',
        category: 'Electronics',
        description: 'Bluetooth noise cancelling earbuds',
        price: 1500
      });
  });

  describe('A. Exact Target Query Verification', () => {
    it('should parse and match products for: "I need black formal shoes under 2000 near Sangamner"', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'I need black formal shoes under 2000 near Sangamner',
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('structuredQuery');
      expect(res.body).toHaveProperty('products');

      // Verify structured query properties
      const sq = res.body.structuredQuery;
      expect(sq.intent).toBe('product_search');
      expect(sq.category).toBe('footwear');
      expect(sq.attributes.color).toBe('black');
      expect(sq.attributes.style).toBe('formal');
      expect(sq.price.max).toBe(2000);
      expect(sq.maxPrice).toBe(2000);
      expect(sq.location.name).toBe('sangamner');
      expect(sq.location.latitude).toBe(19.57);
      expect(sq.location.longitude).toBe(74.21);

      // Verify real MongoDB matched product
      expect(res.body.products.length).toBeGreaterThan(0);
      const topMatch = res.body.products[0];
      expect(topMatch.name).toBe('Black Formal Shoes');
      expect(topMatch.price).toBe(1800);
      expect(topMatch.price).toBeLessThanOrEqual(2000);
    });
  });

  describe('B. Price Constraints (under / above)', () => {
    it('should filter products under maxPrice: "shoes under 2000"', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes under 2000'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toBe('Black Formal Shoes');
      expect(res.body.products[0].price).toBe(1800);
    });

    it('should filter products above minPrice: "shoes above 2000"', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes above 2000'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toBe('White Running Shoes');
      expect(res.body.products[0].price).toBe(2500);
    });
  });

  describe('C. Price Range Constraints', () => {
    it('should filter products within a range: "shoes between 1000 and 3000"', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes between 1000 and 3000'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(2);
      for (const prod of res.body.products) {
        expect(prod.price).toBeGreaterThanOrEqual(1000);
        expect(prod.price).toBeLessThanOrEqual(3000);
      }
    });
  });

  describe('D. Category Extraction & Browse Intent', () => {
    it('should extract category and return all footwear products for: "show me footwear"', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'show me footwear'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery.category).toBe('footwear');
      expect(res.body.products.length).toBe(2);
      expect(res.body.products.every((p) => p.category.toLowerCase() === 'footwear')).toBe(true);
    });
  });

  describe('E. Location & Shop Search Intent', () => {
    it('should identify shop search intent and return matching shops for: "shops near Pune"', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shops near Pune',
          latitude: 18.52,
          longitude: 73.86
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.structuredQuery.intent).toBe('shop_search');
      expect(res.body.structuredQuery.location.name).toBe('pune');
      expect(res.body.shops).toBeDefined();
      expect(Array.isArray(res.body.shops)).toBe(true);
    });
  });

  describe('F. Validation & Error Handling', () => {
    it('should return 400 when query parameter is missing', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when query is an empty string', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: '   '
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for out-of-bounds coordinates', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'shoes',
          latitude: 95
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('G. Empty Search Results', () => {
    it('should return 200 with empty products array when no products match in MongoDB', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'swimming costume under 500'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('structuredQuery');
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBe(0);
    });
  });

  describe('H. Public Endpoint Access', () => {
    it('should not require auth token to execute AI search', async () => {
      const res = await request(app)
        .post('/api/search/ai')
        .send({
          query: 'leather belt'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toBe('Brown Leather Belt');
    });
  });
});
