const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');

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
  await Wishlist.deleteMany({});
});

describe('Wishlist API (/api/wishlist)', () => {
  let customerToken;
  let customerId;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Wishlist User',
        email: 'wishlist.user@example.com',
        password: 'password123',
        role: 'customer'
      });

    customerToken = regRes.body.token;
    customerId = regRes.body.user.id;
  });

  describe('GET /api/wishlist', () => {
    it('should return empty wishlist for newly registered user', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/wishlist');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/wishlist/toggle', () => {
    it('should add item if not in wishlist, and remove item if already in wishlist', async () => {
      // 1. Add product to wishlist
      const addRes = await request(app)
        .post('/api/wishlist/toggle')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 'prod-1' });

      expect(addRes.statusCode).toBe(200);
      expect(addRes.body.products).toContain('prod-1');
      expect(addRes.body.count).toBe(1);

      // Verify in MongoDB
      const dbWishlist = await Wishlist.findOne({ userId: customerId });
      expect(dbWishlist.products).toContain('prod-1');

      // 2. Toggle same product again -> removes it
      const removeRes = await request(app)
        .post('/api/wishlist/toggle')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 'prod-1' });

      expect(removeRes.statusCode).toBe(200);
      expect(removeRes.body.products).not.toContain('prod-1');
      expect(removeRes.body.count).toBe(0);
    });

    it('should return 400 if productId is missing', async () => {
      const res = await request(app)
        .post('/api/wishlist/toggle')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Product Deletion & Shop Cascade Cleanup on Wishlist', () => {
    it('should accurately update count when products and entire shop are deleted', async () => {
      // 1. Create an owner, shop, and 2 products
      const ownerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Store Owner',
          email: 'storeowner@example.com',
          password: 'password123',
          role: 'owner',
          shopData: {
            shopName: 'Owner Hardware & Living',
            shopCategory: 'hardware',
            shopAddress: '10 Market Street',
            coordinates: { lat: 18.5204, lng: 73.8567 }
          }
        });

      const ownerToken = ownerRes.body.token;
      const shopId = ownerRes.body.user.shopId;

      const p1Res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId,
          name: 'Kent Grand Star RO',
          category: 'hardware',
          price: 15500,
          stock: 10
        });

      const p2Res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId,
          name: 'Kent Pearl Water Purifier',
          category: 'hardware',
          price: 18000,
          stock: 5
        });

      const prod1Id = p1Res.body.id;
      const prod2Id = p2Res.body.id;

      // 2. Customer adds both products to wishlist
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: prod1Id });

      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: prod2Id });

      const wlRes1 = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(wlRes1.statusCode).toBe(200);
      expect(wlRes1.body.products).toHaveLength(2);
      expect(wlRes1.body.count).toBe(2);

      // 3. Owner deletes product 1
      const delProd1 = await request(app)
        .delete(`/api/products/${prod1Id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(delProd1.statusCode).toBe(200);

      // 4. Customer fetches wishlist -> count must be exactly 1
      const wlRes2 = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(wlRes2.statusCode).toBe(200);
      expect(wlRes2.body.products).toEqual([prod2Id]);
      expect(wlRes2.body.count).toBe(1);

      // 5. Create product 3 and add to wishlist -> count must be 2 (not 3)
      const p3Res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopId,
          name: 'Home & Living Luxury Cushion',
          category: 'home',
          price: 899,
          stock: 20
        });

      const prod3Id = p3Res.body.id;

      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: prod3Id });

      const wlRes3 = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(wlRes3.statusCode).toBe(200);
      expect(wlRes3.body.products).toHaveLength(2);
      expect(wlRes3.body.count).toBe(2);

      // 6. Owner deletes entire shop -> all shop products pulled from wishlist
      const delShop = await request(app)
        .delete(`/api/shops/${shopId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(delShop.statusCode).toBe(200);

      // 7. Customer fetches wishlist -> count must be 0
      const wlRes4 = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(wlRes4.statusCode).toBe(200);
      expect(wlRes4.body.products).toHaveLength(0);
      expect(wlRes4.body.count).toBe(0);
    });
  });
});
