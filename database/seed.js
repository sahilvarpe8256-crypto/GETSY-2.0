// ============================================================================
// GETSY 2.0 — Database Seed Script
//
// Populates the development database with demo data.
//
// SAFETY:
//   This script removes ONLY its own previously seeded demo records
//   identified by known demo email addresses. It NEVER uses
//   deleteMany({}) or any equivalent that would wipe entire collections.
//
// Usage:
//   node database/seed.js
//
// The script loads backend/.env when available. If MONGO_URI is not set,
// it falls back to the local development default.
// ============================================================================

const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Environment setup
// ---------------------------------------------------------------------------
const envPath = path.resolve(__dirname, '../backend/.env');

if (fs.existsSync(envPath)) {
  require('../backend/node_modules/dotenv').config({ path: envPath });
  console.log('Loaded environment from backend/.env');
} else {
  console.log('No backend/.env found — using defaults.');
}

const mongoose = require('../backend/node_modules/mongoose');
const User = require('../backend/models/User');
const Shop = require('../backend/models/Shop');
const Product = require('../backend/models/Product');

// ---------------------------------------------------------------------------
// Resolve MongoDB URI
// ---------------------------------------------------------------------------
const LOCAL_FALLBACK = 'mongodb://localhost:27017/getsy';
const MONGO_URI = process.env.MONGO_URI || LOCAL_FALLBACK;

if (MONGO_URI === LOCAL_FALLBACK) {
  console.log('MONGO_URI not set — using local fallback: localhost:27017/getsy');
} else {
  // Log connection mode without exposing credentials
  console.log('Using MONGO_URI from environment.');
}

// Validate that the resolved URI looks like a MongoDB connection string
if (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
  console.error('ERROR: Resolved MONGO_URI does not look like a valid MongoDB connection string.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Known demo identifiers — used for selective cleanup and seeding
// ---------------------------------------------------------------------------
const DEMO_EMAILS = [
  'demo.owner@getsy.com',
  'demo.customer@getsy.com'
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\nMongoDB connected for seeding.');

    // -----------------------------------------------------------------------
    // Phase 1 — Selective cleanup of previous demo data ONLY
    //
    // IMPORTANT: Never use User.deleteMany({}), Shop.deleteMany({}),
    // or Product.deleteMany({}) without a filter. The seed script must
    // only remove records it previously created.
    // -----------------------------------------------------------------------
    let removedUsers = 0;
    let removedShops = 0;
    let removedProducts = 0;

    const existingUsers = await User.find({
      email: { $in: DEMO_EMAILS }
    }).select('_id');

    const existingUserIds = existingUsers.map(user => user._id);

    if (existingUserIds.length > 0) {
      const existingShops = await Shop.find({
        ownerId: { $in: existingUserIds }
      }).select('_id');

      const existingShopIds = existingShops.map(shop => shop._id);

      if (existingShopIds.length > 0) {
        const productResult = await Product.deleteMany({
          shopId: { $in: existingShopIds }
        });
        removedProducts = productResult.deletedCount;

        const shopResult = await Shop.deleteMany({
          _id: { $in: existingShopIds }
        });
        removedShops = shopResult.deletedCount;
      }

      const userResult = await User.deleteMany({
        _id: { $in: existingUserIds }
      });
      removedUsers = userResult.deletedCount;

      console.log(`Removed previous demo data: ${removedUsers} users, ${removedShops} shops, ${removedProducts} products.`);
    } else {
      console.log('No previous demo data found to remove.');
    }

    // -----------------------------------------------------------------------
    // Phase 2 — Create demo users
    // -----------------------------------------------------------------------
    const owner = await User.create({
      name: 'GETSY Demo Owner',
      email: 'demo.owner@getsy.com',
      passwordHash: 'DemoOwner123!',
      role: 'owner'
    });

    const customer = await User.create({
      name: 'GETSY Demo Customer',
      email: 'demo.customer@getsy.com',
      passwordHash: 'DemoCustomer123!',
      role: 'customer'
    });

    // -----------------------------------------------------------------------
    // Phase 3 — Create demo shops
    // -----------------------------------------------------------------------
    const fashionShop = await Shop.create({
      ownerId: owner._id,
      shopName: 'Urban Style Fashion',
      shopType: 'Fashion',
      description: 'Local fashion store with trendy clothing.',
      phone: '9876543210',
      image: '',
      address: 'Main Market Road',
      area: 'Local Market',
      location: {
        type: 'Point',
        coordinates: [73.8567, 18.5204]
      },
      verified: true
    });

    const electronicsShop = await Shop.create({
      ownerId: owner._id,
      shopName: 'Tech Corner',
      shopType: 'Electronics',
      description: 'Local electronics and accessories store.',
      phone: '9876543211',
      image: '',
      address: 'Station Road',
      area: 'Local Market',
      location: {
        type: 'Point',
        coordinates: [73.8575, 18.5210]
      },
      verified: true
    });

    // -----------------------------------------------------------------------
    // Phase 4 — Create demo products
    // -----------------------------------------------------------------------
    await Product.insertMany([
      {
        shopId: fashionShop._id,
        name: 'Black Casual Shirt',
        category: 'Shirts',
        description: 'Comfortable black casual shirt.',
        price: 799,
        image: '',
        stock: 15,
        available: true
      },
      {
        shopId: fashionShop._id,
        name: 'Blue Denim Jeans',
        category: 'Jeans',
        description: 'Classic blue denim jeans.',
        price: 1299,
        image: '',
        stock: 10,
        available: true
      },
      {
        shopId: electronicsShop._id,
        name: 'Wireless Earbuds',
        category: 'Audio',
        description: 'Compact wireless Bluetooth earbuds.',
        price: 1499,
        image: '',
        stock: 20,
        available: true
      },
      {
        shopId: electronicsShop._id,
        name: 'USB-C Charging Cable',
        category: 'Accessories',
        description: 'Durable USB-C charging cable.',
        price: 299,
        image: '',
        stock: 30,
        available: true
      }
    ]);

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------
    console.log('\n--- Seed Summary ---');
    console.log('Demo users created:    2');
    console.log('Demo shops created:    2');
    console.log('Demo products created: 4');
    console.log('\nSeed completed successfully.');
  } catch (error) {
    console.error('\nSeed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();