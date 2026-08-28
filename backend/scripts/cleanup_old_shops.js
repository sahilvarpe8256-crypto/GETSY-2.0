const mongoose = require('mongoose');

async function inspectAndCleanup() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/getsy';
  console.log('Connecting to', uri);
  await mongoose.connect(uri);

  const Shop = mongoose.models.Shop || mongoose.model('Shop', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Review = mongoose.models.Review || mongoose.model('Review', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const allShops = await Shop.find({});
  console.log(`Total shops in DB: ${allShops.length}`);
  allShops.forEach(s => console.log(`- Shop: "${s.shopName}" (ID: ${s._id})`));

  const targetShops = await Shop.find({
    shopName: { $in: ['Vikram Heritage Footwear & Shoes', 'Sandeep Luxury Footwear'] }
  });

  console.log(`Target shops found for deletion: ${targetShops.length}`);

  for (const shop of targetShops) {
    console.log(`\nInspecting target shop: "${shop.shopName}" (ID: ${shop._id})`);
    const prods = await Product.find({ shopId: shop._id });
    console.log(`  Products count: ${prods.length}`);
    prods.forEach(p => console.log(`    - Product: "${p.name}" (ID: ${p._id})`));

    const shopRevs = await Review.find({ shopId: shop._id });
    console.log(`  Shop reviews count: ${shopRevs.length}`);

    const prodIds = prods.map(p => p._id);
    const prodRevs = await Review.find({ productId: { $in: prodIds } });
    console.log(`  Product reviews count: ${prodRevs.length}`);

    const owner = await User.findById(shop.ownerId);
    console.log(`  Owner:`, owner ? { id: owner._id, name: owner.name, email: owner.email, role: owner.role } : 'None');

    // Perform safe deletion
    console.log(`  Deleting product reviews...`);
    await Review.deleteMany({ productId: { $in: prodIds } });

    console.log(`  Deleting shop reviews...`);
    await Review.deleteMany({ shopId: shop._id });

    console.log(`  Deleting products...`);
    await Product.deleteMany({ shopId: shop._id });

    console.log(`  Deleting shop document...`);
    await Shop.findByIdAndDelete(shop._id);

    console.log(`  Cleaned up shop "${shop.shopName}" successfully.`);
  }

  console.log('\nRemaining shops in DB:');
  const remainingShops = await Shop.find({});
  remainingShops.forEach(s => console.log(`- Shop: "${s.shopName}" (ID: ${s._id})`));

  await mongoose.disconnect();
  console.log('Done.');
}

inspectAndCleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
