const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

let mongoServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
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

describe('Database model validation', () => {
  describe('User model', () => {
    it('should hash password before saving and verify the password', async () => {
      const user = await User.create({
        name: 'Test Owner',
        email: 'owner@test.com',
        passwordHash: 'password123',
        role: 'owner'
      });

      expect(user.passwordHash).not.toBe('password123');

      const isHashValid = await bcrypt.compare(
        'password123',
        user.passwordHash
      );

      expect(isHashValid).toBe(true);
      expect(await user.matchPassword('password123')).toBe(true);
      expect(await user.matchPassword('wrong-password')).toBe(false);
    });

    it('should hide passwordHash from normal queries', async () => {
      await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        passwordHash: 'password123',
        role: 'customer'
      });

      const user = await User.findOne({
        email: 'customer@test.com'
      });

      expect(user).not.toBeNull();
      expect(user.passwordHash).toBeUndefined();
    });

    it('should format public user JSON without the password', async () => {
      const user = await User.create({
        name: 'Public User',
        email: 'public@test.com',
        passwordHash: 'password123',
        role: 'customer'
      });

      const publicUser = user.toPublicJSON();

      expect(publicUser).toEqual({
        id: user._id.toString(),
        name: 'Public User',
        email: 'public@test.com',
        role: 'customer'
      });

      expect(publicUser.passwordHash).toBeUndefined();
    });

    it('should reject an invalid user role', async () => {
      const user = new User({
        name: 'Invalid Role User',
        email: 'invalid-role@test.com',
        passwordHash: 'password123',
        role: 'seller'
      });

      await expect(user.validate()).rejects.toThrow(/role/i);
    });
  });

  describe('Shop model', () => {
    let owner;

    beforeEach(async () => {
      owner = await User.create({
        name: 'Shop Owner',
        email: 'shop-owner@test.com',
        passwordHash: 'password123',
        role: 'owner'
      });
    });

    it('should create a shop with GeoJSON Point coordinates', async () => {
      const shop = await Shop.create({
        ownerId: owner._id,
        shopName: 'Test Fashion Shop',
        shopType: 'Fashion',
        location: {
          type: 'Point',
          coordinates: [73.8567, 18.5204]
        }
      });

      expect(shop.location.type).toBe('Point');
      expect(shop.location.coordinates).toEqual([73.8567, 18.5204]);
    });

    it('should default verified to false', async () => {
      const shop = await Shop.create({
        ownerId: owner._id,
        shopName: 'Unverified Shop',
        shopType: 'General',
        location: {
          type: 'Point',
          coordinates: [73.8567, 18.5204]
        }
      });

      expect(shop.verified).toBe(false);
    });

    it('should reject a shop without required fields', async () => {
      const shop = new Shop({
        location: {
          type: 'Point',
          coordinates: [73.8567, 18.5204]
        }
      });

      await expect(shop.validate()).rejects.toThrow();
    });

    it('should format public shop JSON correctly', async () => {
      const shop = await Shop.create({
        ownerId: owner._id,
        shopName: 'Public Shop',
        shopType: 'Electronics',
        location: {
          type: 'Point',
          coordinates: [73.8567, 18.5204]
        }
      });

      const publicShop = shop.toPublicJSON();

      expect(publicShop.id).toBe(shop._id.toString());
      expect(publicShop.ownerId).toBe(owner._id.toString());
      expect(publicShop.shopName).toBe('Public Shop');
      expect(publicShop.shopType).toBe('Electronics');
      expect(publicShop.location).toEqual({
        type: 'Point',
        coordinates: [73.8567, 18.5204]
      });
      expect(publicShop.verified).toBe(false);
    });
  });

  describe('Product model', () => {
    let shop;

    beforeEach(async () => {
      const owner = await User.create({
        name: 'Product Owner',
        email: 'product-owner@test.com',
        passwordHash: 'password123',
        role: 'owner'
      });

      shop = await Shop.create({
        ownerId: owner._id,
        shopName: 'Product Test Shop',
        shopType: 'General',
        location: {
          type: 'Point',
          coordinates: [73.8567, 18.5204]
        }
      });
    });

    it('should create a product with default stock and availability', async () => {
      const product = await Product.create({
        shopId: shop._id,
        name: 'Test Product',
        category: 'General',
        price: 500
      });

      expect(product.stock).toBe(0);
      expect(product.available).toBe(true);
    });

    it('should reject a negative price', async () => {
      const product = new Product({
        shopId: shop._id,
        name: 'Invalid Price Product',
        category: 'General',
        price: -100
      });

      await expect(product.validate()).rejects.toThrow(/price/i);
    });

    it('should reject negative stock', async () => {
      const product = new Product({
        shopId: shop._id,
        name: 'Invalid Stock Product',
        category: 'General',
        price: 100,
        stock: -1
      });

      await expect(product.validate()).rejects.toThrow(/stock/i);
    });

    it('should reject fractional stock', async () => {
      const product = new Product({
        shopId: shop._id,
        name: 'Fractional Stock Product',
        category: 'General',
        price: 100,
        stock: 2.5
      });

      await expect(product.validate()).rejects.toThrow(/stock must be an integer/i);
    });

    it('should format public product JSON correctly', async () => {
      const product = await Product.create({
        shopId: shop._id,
        name: 'Public Product',
        category: 'Electronics',
        price: 999,
        stock: 10
      });

      const publicProduct = product.toPublicJSON();

      expect(publicProduct.id).toBe(product._id.toString());
      expect(publicProduct.shopId).toBe(shop._id.toString());
      expect(publicProduct.name).toBe('Public Product');
      expect(publicProduct.category).toBe('Electronics');
      expect(publicProduct.price).toBe(999);
      expect(publicProduct.stock).toBe(10);
      expect(publicProduct.available).toBe(true);
    });
  });
});
