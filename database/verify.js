// ============================================================================
// GETSY 2.0 — Database Verification Script (READ-ONLY)
//
// This script verifies database integrity and the presence of expected
// demo seed data. It NEVER inserts, updates, or deletes any records.
//
// Verification is split into two sections:
//   A. Database integrity — structural and data-quality checks on ALL records
//   B. Demo seed verification — confirms known demo records exist
//
// Usage:
//   node database/verify.js
//
// Exit codes:
//   0 = all checks passed
//   1 = one or more checks failed
// ============================================================================

const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Environment setup
// ---------------------------------------------------------------------------
const envPath = path.resolve(__dirname, '../backend/.env');

if (fs.existsSync(envPath)) {
  require('../backend/node_modules/dotenv').config({ path: envPath });
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

if (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
  console.error('ERROR: Resolved MONGO_URI does not look like a valid MongoDB connection string.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PASS = '\u2713'; // ✓
const FAIL = '\u2717'; // ✗

let failures = 0;

function check(label, passed) {
  if (passed) {
    console.log(`  ${PASS} ${label}`);
  } else {
    console.log(`  ${FAIL} ${label}`);
    failures++;
  }
}

// ---------------------------------------------------------------------------
// Main verification
// ---------------------------------------------------------------------------
const verify = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for verification.\n');

    // =====================================================================
    // SECTION A — DATABASE INTEGRITY CHECKS
    // =====================================================================
    console.log('=== A. Database Integrity ===\n');

    // --- A1. Collections accessible ---
    console.log('[Collections]');
    const userCount = await User.countDocuments();
    check(`Users collection accessible (${userCount} documents)`, userCount >= 0);

    const shopCount = await Shop.countDocuments();
    check(`Shops collection accessible (${shopCount} documents)`, shopCount >= 0);

    const productCount = await Product.countDocuments();
    check(`Products collection accessible (${productCount} documents)`, productCount >= 0);

    // --- A2. User integrity ---
    console.log('\n[User integrity]');
    const allUsers = await User.find({}).select('+passwordHash');
    const validRoles = ['customer', 'owner', 'admin'];

    let userRolesValid = true;
    let userEmailsValid = true;
    let userHashesValid = true;

    for (const user of allUsers) {
      if (!validRoles.includes(user.role)) {
        userRolesValid = false;
      }
      if (!user.email || typeof user.email !== 'string' || user.email.trim().length === 0) {
        userEmailsValid = false;
      }
      if (!user.passwordHash || typeof user.passwordHash !== 'string') {
        userHashesValid = false;
      } else if (!user.passwordHash.startsWith('$2')) {
        // bcrypt hashes start with $2a$, $2b$, or $2y$
        userHashesValid = false;
      }
    }

    check('All user roles are valid (customer | owner | admin)', userRolesValid);
    check('All users have a non-empty email', userEmailsValid);
    check('All passwordHash values are bcrypt hashes', userHashesValid);

    // --- A3. Shop integrity ---
    console.log('\n[Shop integrity]');
    const allShops = await Shop.find({});

    let shopOwnerRefsValid = true;
    let shopLocationTypeValid = true;
    let shopCoordsValid = true;

    for (const shop of allShops) {
      // ownerId references an existing User
      if (!shop.ownerId) {
        shopOwnerRefsValid = false;
      } else {
        const ownerExists = await User.exists({ _id: shop.ownerId });
        if (!ownerExists) {
          shopOwnerRefsValid = false;
        }
      }

      // location.type === 'Point'
      if (!shop.location || shop.location.type !== 'Point') {
        shopLocationTypeValid = false;
      }

      // coordinates validation
      if (!shop.location || !Array.isArray(shop.location.coordinates) || shop.location.coordinates.length !== 2) {
        shopCoordsValid = false;
      } else {
        const [lng, lat] = shop.location.coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          shopCoordsValid = false;
        } else if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          shopCoordsValid = false;
        }
      }
    }

    check('All shops have ownerId referencing an existing User', shopOwnerRefsValid);
    check('All shop locations have type "Point"', shopLocationTypeValid);
    check('All shop coordinates are valid [longitude, latitude]', shopCoordsValid);

    // --- A4. Geospatial index ---
    console.log('\n[Geospatial index]');
    const shopIndexes = await Shop.collection.indexes();
    const has2dsphere = shopIndexes.some(idx =>
      Object.values(idx.key || {}).includes('2dsphere')
    );
    check('2dsphere index exists on shops collection', has2dsphere);

    // --- A5. Product integrity ---
    console.log('\n[Product integrity]');
    const allProducts = await Product.find({});

    let productShopRefsValid = true;
    let productPriceValid = true;
    let productStockValid = true;
    let productAvailableValid = true;

    for (const product of allProducts) {
      // shopId references an existing Shop
      if (!product.shopId) {
        productShopRefsValid = false;
      } else {
        const shopExists = await Shop.exists({ _id: product.shopId });
        if (!shopExists) {
          productShopRefsValid = false;
        }
      }

      // price >= 0
      if (typeof product.price !== 'number' || product.price < 0) {
        productPriceValid = false;
      }

      // stock >= 0 and integer
      if (typeof product.stock !== 'number' || product.stock < 0 || !Number.isInteger(product.stock)) {
        productStockValid = false;
      }

      // available is boolean
      if (typeof product.available !== 'boolean') {
        productAvailableValid = false;
      }
    }

    check('All products have shopId referencing an existing Shop', productShopRefsValid);
    check('All product prices are >= 0', productPriceValid);
    check('All product stock values are >= 0 and integers', productStockValid);
    check('All product available fields are booleans', productAvailableValid);

    // =====================================================================
    // SECTION B — DEMO SEED VERIFICATION
    // =====================================================================
    console.log('\n=== B. Demo Seed Verification ===\n');

    // --- B1. Demo users ---
    console.log('[Demo users]');
    const demoOwner = await User.findOne({ email: 'demo.owner@getsy.com' }).select('+passwordHash');
    check('demo.owner@getsy.com exists', !!demoOwner);
    if (demoOwner) {
      check('  role is "owner"', demoOwner.role === 'owner');
      check('  passwordHash is not plaintext "DemoOwner123!"', demoOwner.passwordHash !== 'DemoOwner123!');
    }

    const demoCustomer = await User.findOne({ email: 'demo.customer@getsy.com' }).select('+passwordHash');
    check('demo.customer@getsy.com exists', !!demoCustomer);
    if (demoCustomer) {
      check('  role is "customer"', demoCustomer.role === 'customer');
      check('  passwordHash is not plaintext "DemoCustomer123!"', demoCustomer.passwordHash !== 'DemoCustomer123!');
    }

    // --- B2. Demo shops ---
    console.log('\n[Demo shops]');
    const urbanShop = await Shop.findOne({ shopName: 'Urban Style Fashion' });
    check('Shop "Urban Style Fashion" exists', !!urbanShop);
    if (urbanShop && demoOwner) {
      check('  owned by demo.owner@getsy.com', String(urbanShop.ownerId) === String(demoOwner._id));
    }

    const techShop = await Shop.findOne({ shopName: 'Tech Corner' });
    check('Shop "Tech Corner" exists', !!techShop);
    if (techShop && demoOwner) {
      check('  owned by demo.owner@getsy.com', String(techShop.ownerId) === String(demoOwner._id));
    }

    // --- B3. Demo products ---
    console.log('\n[Demo products]');
    const expectedProducts = [
      'Black Casual Shirt',
      'Blue Denim Jeans',
      'Wireless Earbuds',
      'USB-C Charging Cable'
    ];

    for (const productName of expectedProducts) {
      const product = await Product.findOne({ name: productName });
      check(`Product "${productName}" exists`, !!product);
    }

    // =====================================================================
    // COUNTS & SUMMARY
    // =====================================================================
    console.log('\n=== Counts ===\n');
    console.log(`  Users:    ${userCount}`);
    console.log(`  Shops:    ${shopCount}`);
    console.log(`  Products: ${productCount}`);

    console.log('');
    if (failures === 0) {
      console.log('ALL CHECKS PASSED.');
    } else {
      console.log(`VERIFICATION FAILED: ${failures} check(s) did not pass.`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('\nVerification error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

verify();
