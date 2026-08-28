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

describe('POST /api/auth/register', () => {
  it('should successfully register a new customer user', async () => {
    const userData = {
      name: 'Sahil',
      email: 'sahil@example.com',
      password: 'password123',
      role: 'customer'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.name).toBe('Sahil');
    expect(res.body.user.email).toBe('sahil@example.com');
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('passwordHash');

    // Verify password is encrypted in database
    const dbUser = await User.findOne({ email: 'sahil@example.com' }).select('+passwordHash');
    expect(dbUser).not.toBeNull();
    expect(dbUser.passwordHash).not.toBe('password123');
    expect(dbUser.passwordHash.startsWith('$2')).toBe(true);
  });

  it('should default role to customer if not specified', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Default Role User',
        email: 'default@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('customer');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'No Email User',
        password: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email User',
        email: 'invalid-email-format',
        password: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/email/i);
  });

  it('should return 400 for password under 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass User',
        email: 'shortpass@example.com',
        password: '123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/6 characters/i);
  });

  it('should return 409 when registering with a duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password456'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('should reject registration with role=admin returning 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Attempter',
        email: 'adminhack@example.com',
        password: 'password123',
        role: 'admin'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Invalid role/i);
  });

  it('should reject registration with arbitrary invalid role returning 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker User',
        email: 'hacker@example.com',
        password: 'password123',
        role: 'superadmin'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject existing owner email registering as customer with 409 conflict', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Real Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 'owner',
        shopData: { shopName: 'Owner Shop' }
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Imposter Customer',
        email: 'owner@example.com',
        password: 'password123',
        role: 'customer'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'correctpassword',
        role: 'owner'
      });
  });

  it('should successfully log in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'correctpassword'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@example.com');
    expect(res.body.user.role).toBe('owner');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('should handle email in case-insensitive manner during login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'LOGIN@EXAMPLE.COM',
        password: 'correctpassword'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should return 401 for non-existent user email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'somepassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should reject owner email when customer role is selected during login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'correctpassword',
        role: 'customer'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('No customer is registered with this email.');
  });

  it('should reject customer email when owner role is selected during login', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular Customer',
        email: 'customer@example.com',
        password: 'correctpassword',
        role: 'customer'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'correctpassword',
        role: 'owner'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('No shop owner is registered with this email.');
  });

  it('should succeed when owner logs in selecting owner role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'correctpassword',
        role: 'owner'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('owner');
  });

  it('should succeed when customer logs in selecting customer role', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Customer 2',
        email: 'customer2@example.com',
        password: 'correctpassword',
        role: 'customer'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer2@example.com',
        password: 'correctpassword',
        role: 'customer'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('customer');
  });

  it('should return 400 when missing email or password field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/auth/me', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Me User',
        email: 'me@example.com',
        password: 'password123',
        role: 'customer'
      });

    authToken = regRes.body.token;
    userId = regRes.body.user.id;
  });

  it('should return current user profile when valid Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.id).toBe(userId);
    expect(res.body.user.email).toBe('me@example.com');
    expect(res.body.user.name).toBe('Me User');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('should return 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 when Bearer token is invalid or malformed', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid authentication token');
  });

  it('should return real shopId and shopName for an authenticated owner', async () => {
    const ownerReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Shop Owner User',
        email: 'owner-me@example.com',
        password: 'password123',
        role: 'owner',
        shopData: {
          shopName: 'Pune Electronics Store',
          shopCategory: 'electronics',
          shopAddress: 'FC Road, Pune',
          coordinates: { lat: 18.5204, lng: 73.8567 }
        }
      });

    expect(ownerReg.statusCode).toBe(201);
    expect(ownerReg.body.user).toHaveProperty('shopId');
    expect(ownerReg.body.user.shopName).toBe('Pune Electronics Store');

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${ownerReg.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('shopId');
    expect(res.body.user.shopId).toBe(ownerReg.body.user.shopId);
    expect(res.body.user.shopName).toBe('Pune Electronics Store');
  });
});

describe('Owner registration with Shop creation', () => {
  it('should create a real Shop document in MongoDB on owner registration', async () => {
    const ownerPayload = {
      name: 'Ramesh Patel',
      email: 'ramesh.shoes@example.com',
      password: 'password123',
      role: 'owner',
      shopData: {
        shopName: 'Ramesh Footwear & Leather',
        shopCategory: 'footwear',
        shopAddress: '12 Paud Road, Kothrud',
        shopLandmark: 'Near Metro Station',
        shopGst: '27AAAAA0000A1Z5',
        coordinates: { lat: 18.5074, lng: 73.8077 }
      }
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(ownerPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('owner');
    expect(res.body.user).toHaveProperty('shopId');
    expect(res.body.user.shopName).toBe('Ramesh Footwear & Leather');

    // Verify Shop document in MongoDB
    const shopInDb = await Shop.findById(res.body.user.shopId);
    expect(shopInDb).not.toBeNull();
    expect(shopInDb.shopName).toBe('Ramesh Footwear & Leather');
    expect(shopInDb.shopType).toBe('footwear');
    expect(shopInDb.ownerId.toString()).toBe(res.body.user.id);
    expect(shopInDb.location.coordinates).toEqual([73.8077, 18.5074]);

    // Verify owner can log in and receive the same real shopId
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ramesh.shoes@example.com',
        password: 'password123'
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.user.shopId).toBe(res.body.user.shopId);
    expect(loginRes.body.user.shopName).toBe('Ramesh Footwear & Leather');
  });
});
