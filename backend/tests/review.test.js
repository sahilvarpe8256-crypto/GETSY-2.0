const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Review = require('../models/Review');

let mongoServer;
let customerToken;
let customerId;
let otherCustomerToken;
let otherCustomerId;
let testShopId;
let testProductId;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create primary customer
  const customerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'password123',
      role: 'customer'
    });
  customerToken = customerRes.body.token;
  customerId = customerRes.body.user.id;

  // Create second customer
  const otherRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Rahul Varma',
      email: 'rahul@example.com',
      password: 'password123',
      role: 'customer'
    });
  otherCustomerToken = otherRes.body.token;
  otherCustomerId = otherRes.body.user.id;

  // Create owner & shop
  const ownerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Owner Ramesh',
      email: 'ramesh@example.com',
      password: 'password123',
      role: 'owner',
      shopData: {
        shopName: 'Ramesh Footwear & Leather',
        shopCategory: 'footwear',
        shopAddress: 'MG Road, Kopargaon',
        shopLandmark: 'Near Clock Tower'
      }
    });
  const ownerToken = ownerRes.body.token;
  testShopId = ownerRes.body.user.shopId;

  // Create a product
  const prodRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      shopId: testShopId,
      name: 'Classic Black Oxford Shoes',
      category: 'footwear',
      price: 1999,
      stock: 20,
      sizes: ['UK 7', 'UK 8', 'UK 9'],
      description: 'Handcrafted leather shoes.'
    });
  testProductId = prodRes.body.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Customer Reviews API', () => {
  let createdReviewId;

  it('should reject unauthenticated review submission with 401', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        shopId: testShopId,
        rating: 5,
        comment: 'Great store!'
      });

    expect(res.status).toBe(401);
  });

  it('should reject review with invalid rating (< 1 or > 5)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shopId: testShopId,
        rating: 6,
        comment: 'Too high rating'
      });

    expect(res.status).toBe(400);
  });

  it('should successfully submit review for a shop', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shopId: testShopId,
        rating: 5,
        comment: 'Excellent customer service and quality products!'
      });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toBe('Excellent customer service and quality products!');
    expect(res.body.userName).toBe('Priya Sharma');
    createdReviewId = res.body.id;
  });

  it('should successfully submit review for a product', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({
        productId: testProductId,
        rating: 4,
        comment: 'Very comfortable shoes for daily wear.'
      });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(4);
    expect(res.body.productId).toBe(testProductId);
  });

  it('should retrieve reviews for a shop', async () => {
    const res = await request(app)
      .get(`/api/reviews?shopId=${testShopId}`);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toBeInstanceOf(Array);
    expect(res.body.reviews.length).toBeGreaterThanOrEqual(1);
    expect(res.body.reviewsCount).toBeGreaterThanOrEqual(1);
  });

  it('should retrieve reviews for a product', async () => {
    const res = await request(app)
      .get(`/api/reviews?productId=${testProductId}`);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toBeInstanceOf(Array);
    expect(res.body.reviews.length).toBe(1);
    expect(res.body.reviews[0].comment).toBe('Very comfortable shoes for daily wear.');
  });

  it('should allow author to update their own review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rating: 4,
        comment: 'Updated review: Still great quality!'
      });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(4);
    expect(res.body.comment).toBe('Updated review: Still great quality!');
  });

  it('should prevent another user from updating review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({
        rating: 1,
        comment: 'Malicious modification'
      });

    expect(res.status).toBe(403);
  });

  it('should prevent another user from deleting review', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow author to delete their own review', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});
