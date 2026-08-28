const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * Get wishlist for a user (or create empty if not exists), sanitizing orphaned items
 */
const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = new Wishlist({ userId, products: [] });
    await wishlist.save();
    return wishlist.toPublicJSON();
  }

  // Sanitize wishlist against existing database products
  if (wishlist.products && wishlist.products.length > 0) {
    const validMongoIds = wishlist.products
      .filter((p) => mongoose.Types.ObjectId.isValid(p))
      .map((p) => new mongoose.Types.ObjectId(p));

    const existingProducts = await Product.find({ _id: { $in: validMongoIds } }).select('_id');
    const existingIdSet = new Set(existingProducts.map((p) => p._id.toString()));

    const sanitizedProducts = wishlist.products.filter((p) => {
      if (mongoose.Types.ObjectId.isValid(p)) {
        return existingIdSet.has(p.toString());
      }
      return p && String(p).startsWith('prod-');
    });

    if (sanitizedProducts.length !== wishlist.products.length) {
      wishlist.products = sanitizedProducts;
      await wishlist.save();
    }
  }

  return wishlist.toPublicJSON();
};

/**
 * Toggle product in user wishlist
 */
const toggleWishlist = async (userId, productId) => {
  if (!productId) {
    const error = new Error('Product ID is required');
    error.statusCode = 400;
    throw error;
  }

  const strId = String(productId).trim();
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = new Wishlist({ userId, products: [strId] });
  } else {
    const index = wishlist.products.findIndex((p) => String(p) === strId);
    if (index >= 0) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(strId);
    }
  }

  await wishlist.save();
  return wishlist.toPublicJSON();
};

/**
 * Add product to user wishlist
 */
const addToWishlist = async (userId, productId) => {
  if (!productId) {
    const error = new Error('Product ID is required');
    error.statusCode = 400;
    throw error;
  }

  const strId = String(productId).trim();
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = new Wishlist({ userId, products: [strId] });
  } else if (!wishlist.products.some((p) => String(p) === strId)) {
    wishlist.products.push(strId);
  }

  await wishlist.save();
  return wishlist.toPublicJSON();
};

/**
 * Remove product from user wishlist
 */
const removeFromWishlist = async (userId, productId) => {
  if (!productId) {
    const error = new Error('Product ID is required');
    error.statusCode = 400;
    throw error;
  }

  const strId = String(productId).trim();
  let wishlist = await Wishlist.findOne({ userId });
  if (wishlist) {
    wishlist.products = wishlist.products.filter((p) => String(p) !== strId);
    await wishlist.save();
    return wishlist.toPublicJSON();
  }

  return { userId: String(userId), products: [], count: 0 };
};

module.exports = {
  getWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist
};
