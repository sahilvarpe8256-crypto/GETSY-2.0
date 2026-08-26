require('../backend/node_modules/dotenv').config({
 path: require('path').resolve(__dirname, '../backend/.env') 
});
const mongoose = require('../backend/node_modules/mongoose');
const User = require('../backend/models/User');
const Shop = require('../backend/models/Shop');
const Product = require('../backend/models/Product');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/getsy';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB connected for seeding.');

    // Clear existing seed data
    const existingUsers = await User.find({
      email: {
        $in: [
          'demo.owner@getsy.com',
          'demo.customer@getsy.com'
        ]
      }
    }).select('_id');

    const existingUserIds = existingUsers.map(user => user._id);

    if (existingUserIds.length > 0) {
      const existingShops = await Shop.find({
        ownerId: { $in: existingUserIds }
      }).select('_id');

      const existingShopIds = existingShops.map(shop => shop._id);

      if (existingShopIds.length > 0) {
        await Product.deleteMany({
          shopId: { $in: existingShopIds }
        });

        await Shop.deleteMany({
          _id: { $in: existingShopIds }
        });
      }

      await User.deleteMany({
        _id: { $in: existingUserIds }
      });

      console.log('Previous demo data removed.');
    }

    // Create demo users
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

    // Create demo shops
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

    // Create demo products
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

    console.log('Demo users created: 2');
    console.log('Demo shops created: 2');
    console.log('Demo products created: 4');

    console.log('\nSeed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();