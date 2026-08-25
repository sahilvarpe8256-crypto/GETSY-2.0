const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Shop = require('../models/Shop');

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
});

describe('Phase 3 Shop Foundation APIs', () => {
  let ownerToken;
  let ownerUser;
  let owner2Token;
  let owner2User;
  let customerToken;
  let customerUser;
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Create Owner 1
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

    // Create Owner 2
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
    customerUser = customerRes.body.user;

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

  describe('POST /api/shops (Shop Creation)', () => {
    it('should successfully create a shop when requested by an owner', async () => {
      const shopData = {
        shopName: 'Metro Footwear',
        shopType: 'Shoes',
        description: 'Quality leather footwear',
        phone: '+919876543210',
        address: '123 Main Street',
        area: 'Downtown',
        latitude: 19.57,
        longitude: 74.21
      };

      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(shopData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.shopName).toBe('Metro Footwear');
      expect(res.body.shopType).toBe('Shoes');
      expect(res.body.ownerId).toBe(ownerUser.id);
      expect(res.body.location).toEqual({
        type: 'Point',
        coordinates: [74.21, 19.57]
      });
      expect(res.body.verified).toBe(false);
    });

    it('should allow admin role to create a shop', async () => {
      const shopData = {
        shopName: 'Admin Mart',
        shopType: 'General',
        latitude: 19.57,
        longitude: 74.21
      };

      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(shopData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ownerId).toBe(adminUser.id);
    });

    it('should reject shop creation without authentication (401)', async () => {
      const shopData = {
        shopName: 'No Auth Shop',
        shopType: 'General',
        latitude: 19.57,
        longitude: 74.21
      };

      const res = await request(app)
        .post('/api/shops')
        .send(shopData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject shop creation by a customer role (403)', async () => {
      const shopData = {
        shopName: 'Customer Shop',
        shopType: 'General',
        latitude: 19.57,
        longitude: 74.21
      };

      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(shopData);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/role required/i);
    });

    it('should return 400 when missing required field shopName', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopType: 'Shoes',
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/shop name is required/i);
    });

    it('should return 400 when missing required field shopType', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopName: 'No Type Shop',
          latitude: 19.57,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/shop type is required/i);
    });

    it('should return 400 for invalid latitude (out of bounds)', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopName: 'Bad Lat Shop',
          shopType: 'General',
          latitude: 105.0,
          longitude: 74.21
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/latitude/i);
    });

    it('should return 400 for invalid longitude (out of bounds)', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopName: 'Bad Lng Shop',
          shopType: 'General',
          latitude: 19.57,
          longitude: 210.0
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/longitude/i);
    });
  });

  describe('GET /api/shops and GET /api/shops/:id (Shop Retrieval)', () => {
    let createdShopId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopName: 'Sample Shop',
          shopType: 'Bakery',
          description: 'Fresh cakes & breads',
          latitude: 19.57,
          longitude: 74.21
        });
      createdShopId = res.body.id;
    });

    it('should retrieve list of all shops', async () => {
      const res = await request(app).get('/api/shops');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].shopName).toBe('Sample Shop');
    });

    it('should retrieve a single shop by valid ID', async () => {
      const res = await request(app).get(`/api/shops/${createdShopId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdShopId);
      expect(res.body.shopName).toBe('Sample Shop');
      expect(res.body.shopType).toBe('Bakery');
    });

    it('should return 404 for a non-existent shop ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/shops/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/shop not found/i);
    });

    it('should return 400 for an invalid ObjectId format', async () => {
      const res = await request(app).get('/api/shops/invalid-id-string');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/shops/:id (Shop Update)', () => {
    let shopId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopName: 'Original Shop Name',
          shopType: 'Clothing',
          latitude: 19.57,
          longitude: 74.21
        });
      shopId = res.body.id;
    });

    it('should allow shop owner to update shop details', async () => {
      const updateData = {
        shopName: 'Updated Shop Name',
        description: 'New updated description',
        latitude: 19.58,
        longitude: 74.22
      };

      const res = await request(app)
        .put(`/api/shops/${shopId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.shopName).toBe('Updated Shop Name');
      expect(res.body.description).toBe('New updated description');
      expect(res.body.location).toEqual({
        type: 'Point',
        coordinates: [74.22, 19.58]
      });
    });

    it('should allow admin user to update any shop', async () => {
      const res = await request(app)
        .put(`/api/shops/${shopId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shopName: 'Admin Modified Name'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.shopName).toBe('Admin Modified Name');
    });

    it('should prevent non-owner user (another owner) from updating shop (403)', async () => {
      const res = await request(app)
        .put(`/api/shops/${shopId}`)
        .set('Authorization', `Bearer ${owner2Token}`)
        .send({
          shopName: 'Hijacked Name'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/do not own this shop/i);
    });

    it('should prevent customer role from updating shop (403)', async () => {
      const res = await request(app)
        .put(`/api/shops/${shopId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shopName: 'Customer Modified Name'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject attempts to update protected fields such as ownerId or verified (400)', async () => {
      const res = await request(app)
        .put(`/api/shops/${shopId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          ownerId: owner2User.id,
          verified: true
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/updating field 'ownerId' is not allowed/i);
    });
  });

  describe('GET /api/shops/nearby (Geospatial Nearby Search)', () => {
    beforeEach(async () => {
      // Ensure 2dsphere index is built
      await Shop.syncIndexes();

      // Create Shop 1 at Sangamner center (19.57, 74.21)
      await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          shopName: 'Nearby Central Shop',
          shopType: 'Grocery',
          latitude: 19.57,
          longitude: 74.21
        });

      // Create Shop 2 approx 3 km away (19.59, 74.22)
      await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${owner2Token}`)
        .send({
          shopName: 'Nearby Suburb Shop',
          shopType: 'Electronics',
          latitude: 19.59,
          longitude: 74.22
        });

      // Create Shop 3 distant (~150 km away in Pune, 18.52, 73.85)
      await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shopName: 'Distant Pune Shop',
          shopType: 'Books',
          latitude: 18.52,
          longitude: 73.85
        });
    });

    it('should return nearby shops within default radius (5 km)', async () => {
      const res = await request(app)
        .get('/api/shops/nearby?latitude=19.57&longitude=74.21');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      const names = res.body.map((s) => s.shopName);
      expect(names).toContain('Nearby Central Shop');
      expect(names).toContain('Nearby Suburb Shop');
      expect(names).not.toContain('Distant Pune Shop');
    });

    it('should filter out shops outside a smaller radius (1 km)', async () => {
      const res = await request(app)
        .get('/api/shops/nearby?latitude=19.57&longitude=74.21&radius=1');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].shopName).toBe('Nearby Central Shop');
    });

    it('should return 400 if latitude parameter is missing or out of bounds', async () => {
      const res = await request(app)
        .get('/api/shops/nearby?longitude=74.21');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');

      const resOob = await request(app)
        .get('/api/shops/nearby?latitude=100&longitude=74.21');

      expect(resOob.statusCode).toBe(400);
      expect(resOob.body).toHaveProperty('error');
    });

    it('should return 400 if longitude parameter is missing or out of bounds', async () => {
      const res = await request(app)
        .get('/api/shops/nearby?latitude=19.57');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');

      const resOob = await request(app)
        .get('/api/shops/nearby?latitude=19.57&longitude=200');

      expect(resOob.statusCode).toBe(400);
      expect(resOob.body).toHaveProperty('error');
    });

    it('should return 400 if radius parameter is negative or zero', async () => {
      const res = await request(app)
        .get('/api/shops/nearby?latitude=19.57&longitude=74.21&radius=-5');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
