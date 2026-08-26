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

describe('Phase 4 Product Foundation APIs', () => {
  let ownerToken;
  let ownerUser;
  let ownerShopId;

  let owner2Token;
  let owner2User;
  let owner2ShopId;

  let customerToken;
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Create Owner 1 & Shop 1
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Owner One',
        email: 'owner1@example.com',
        password: 'password123',
        role: 'owner'
      });
    ownerToken = ownerRes.body.token;
    ownerUser = ownerRes.body.user;

    const shop1Res = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        shopName: 'Owner 1 Store',
        shopType: 'Footwear',
        latitude: 19.57,
        longitude: 74.21
      });
    ownerShopId = shop1Res.body.id;

    // Create Owner 2 & Shop 2
    const owner2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Owner Two',
        email: 'owner2@example.com',
        password: 'password123',
        role: 'owner'
      });
    owner2Token = owner2Res.body.token;
    owner2User = owner2Res.body.user;

    const shop2Res = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${owner2Token}`)
      .send({
        shopName: 'Owner 2 Store',
        shopType: 'Electronics',
        latitude: 19.58,
        longitude: 74.22
      });
    owner2ShopId = shop2Res.body.id;

    // Create Customer
    const customerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Customer One',
        email: 'customer@example.com',
        password: 'password123',
        role: 'customer'
      });
    customerToken = customerRes.body.token;

    // Create Admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin One',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });
    adminToken = adminRes.body.token;
    adminUser = adminRes.body.user;
  });

  describe('POST /api/products (Product Creation)', () => {
    it('should successfully create a product for shop owned by the user', async () => {
      const productData = {
        shopId: ownerShopId,
        name: 'Black Running Shoes',
        category: 'Footwear',
        description: 'Lightweight breathable mesh shoes',
        price: 1999,
        image: 'http://example.com/shoes.jpg',
        stock: 20,
        available: true
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(productData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.shopId).toBe(ownerShopId);
      expect(res.body.name).toBe('Black Running Shoes');
      expect(res.body.category).toBe('Footwear');
      expect(res.body.price).toBe(1999);
      expect(res.body.stock).toBe(20);
      expect(res.body.available).toBe(true);
    });

    it('should allow admin user to create a product for any shop', async () => {
      const productData = {
        shopId: ownerShopId,
        name: 'Admin Added Product',
        category: 'Footwear',
        price: 500
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Admin Added Product');
    });

    it('should reject creation without authentication (401)', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          shopId: ownerShopId,
          name: 'No Auth Product',
          category: 'General',
          price: 100
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject product creation by customer role (403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Customer Product',
          category: 'General',
          price: 100
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject product creation for a shop owned by another user (403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${owner2Token}`)
        .send({
          shopId: ownerShopId, // Owned by Owner 1
          name: 'Hijacked Product',
          category: 'Footwear',
          price: 999
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/do not own this shop/i);
    });

    it('should return 404 if shopId does not exist', async () => {
      const fakeShopId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: fakeShopId,
          name: 'Ghost Shop Product',
          category: 'General',
          price: 100
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/shop not found/i);
    });

    it('should return 400 when missing required fields (name, category, price)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          price: 100
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for negative price or invalid stock', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Negative Price Item',
          category: 'General',
          price: -50
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/products and GET /api/products/search (Product Listing & Search)', () => {
    let p1Id;
    let p2Id;

    beforeEach(async () => {
      // Create Product 1 in Shop 1
      const p1 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Black Formal Shoes',
          category: 'Footwear',
          description: 'Classic black leather shoes',
          price: 2500
        });
      p1Id = p1.body.id;

      // Create Product 2 in Shop 1
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Brown Leather Belt',
          category: 'Accessories',
          description: 'Genuine leather belt',
          price: 800
        });

      // Create Product 3 in Shop 2
      const p2 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${owner2Token}`)
        .send({
          shopId: owner2ShopId,
          name: 'Wireless Bluetooth Earbuds',
          category: 'Electronics',
          description: 'Noise cancelling black earbuds',
          price: 3500
        });
      p2Id = p2.body.id;
    });

    it('should retrieve all products when no filters specified', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it('should filter products by shopId', async () => {
      const res = await request(app).get(`/api/products?shopId=${ownerShopId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const names = res.body.map((p) => p.name);
      expect(names).toContain('Black Formal Shoes');
      expect(names).toContain('Brown Leather Belt');
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=Footwear');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Black Formal Shoes');
    });

    it('should filter products by search term', async () => {
      const res = await request(app).get('/api/products?search=leather');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should search products via GET /api/products/search?query=...', async () => {
      const res = await request(app).get('/api/products/search?query=black');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      const names = res.body.map((p) => p.name);
      expect(names).toContain('Black Formal Shoes');
      expect(names).toContain('Wireless Bluetooth Earbuds');
    });

    it('should return 400 when search query is missing from GET /api/products/search', async () => {
      const res = await request(app).get('/api/products/search');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/products/:id (Product Retrieval)', () => {
    let createdProdId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Single Product Test',
          category: 'Sample',
          price: 150
        });
      createdProdId = res.body.id;
    });

    it('should retrieve product by valid ID', async () => {
      const res = await request(app).get(`/api/products/${createdProdId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdProdId);
      expect(res.body.name).toBe('Single Product Test');
    });

    it('should return 404 for non-existent product ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/product not found/i);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/products/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/products/:id (Product Update)', () => {
    let prodId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Original Product Name',
          category: 'Stationery',
          price: 200
        });
      prodId = res.body.id;
    });

    it('should allow shop owner to update product details', async () => {
      const res = await request(app)
        .put(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Updated Product Name',
          price: 250,
          stock: 50
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Product Name');
      expect(res.body.price).toBe(250);
      expect(res.body.stock).toBe(50);
    });

    it('should allow admin user to update any product', async () => {
      const res = await request(app)
        .put(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Updated Product'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Admin Updated Product');
    });

    it('should prevent non-owner user from updating product (403)', async () => {
      const res = await request(app)
        .put(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${owner2Token}`)
        .send({
          name: 'Hijacked Product Name'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/do not own this shop/i);
    });

    it('should reject attempts to update protected fields such as shopId (400)', async () => {
      const res = await request(app)
        .put(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: owner2ShopId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/updating field 'shopId' is not allowed/i);
    });
  });

  describe('DELETE /api/products/:id (Product Deletion)', () => {
    let prodId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId: ownerShopId,
          name: 'Product To Delete',
          category: 'Disposable',
          price: 50
        });
      prodId = res.body.id;
    });

    it('should allow shop owner to delete their product', async () => {
      const res = await request(app)
        .delete(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      const checkRes = await request(app).get(`/api/products/${prodId}`);
      expect(checkRes.statusCode).toBe(404);
    });

    it('should allow admin user to delete any product', async () => {
      const res = await request(app)
        .delete(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should prevent non-owner user from deleting product (403)', async () => {
      const res = await request(app)
        .delete(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${owner2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');

      const checkRes = await request(app).get(`/api/products/${prodId}`);
      expect(checkRes.statusCode).toBe(200);
    });

    it('should prevent customer role from deleting product (403)', async () => {
      const res = await request(app)
        .delete(`/api/products/${prodId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for deleting non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
