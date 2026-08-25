const Product = require('../models/Product');
const Shop = require('../models/Shop');

/**
 * Create a new product associated with a shop owned by the user
 */
const createProduct = async ({ userId, userRole, productData }) => {
  const shop = await Shop.findById(productData.shopId);
  if (!shop) {
    const error = new Error('Shop not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User must own the shop or be an admin
  const isOwner = shop.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied. You do not own this shop.');
    error.statusCode = 403;
    throw error;
  }

  const product = new Product({
    shopId: productData.shopId,
    name: productData.name ? productData.name.trim() : '',
    category: productData.category ? productData.category.trim() : '',
    description: productData.description ? productData.description.trim() : '',
    price: Number(productData.price),
    image: productData.image ? productData.image.trim() : '',
    stock: productData.stock !== undefined ? Number(productData.stock) : 0,
    available: productData.available !== undefined ? Boolean(productData.available) : true
  });

  await product.save();
  return product.toPublicJSON();
};

/**
 * Get products with optional filtering by shopId, category, or search term
 */
const getProducts = async ({ shopId, category, search }) => {
  const filter = {};

  if (shopId) {
    filter.shopId = shopId;
  }

  if (category) {
    filter.category = new RegExp('^' + category.trim() + '$', 'i');
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ];
  }

  const products = await Product.find(filter);
  return products.map((product) => product.toPublicJSON());
};

/**
 * Search products by query term across name, description, and category
 */
const searchProducts = async ({ query }) => {
  if (!query || !query.trim()) {
    return [];
  }

  const searchRegex = new RegExp(query.trim(), 'i');
  const filter = {
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ]
  };

  const products = await Product.find(filter);
  return products.map((product) => product.toPublicJSON());
};

/**
 * Get a single product by ID
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product.toPublicJSON();
};

/**
 * Update product details with ownership authorization check
 */
const updateProduct = async ({ productId, userId, userRole, updateData }) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const shop = await Shop.findById(product.shopId);
  if (!shop) {
    const error = new Error('Associated shop not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User must own the shop or be an admin
  const isOwner = shop.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied. You do not own this shop.');
    error.statusCode = 403;
    throw error;
  }

  // Update permitted fields
  if (updateData.name !== undefined) product.name = updateData.name.trim();
  if (updateData.category !== undefined) product.category = updateData.category.trim();
  if (updateData.description !== undefined) product.description = updateData.description.trim();
  if (updateData.price !== undefined) product.price = Number(updateData.price);
  if (updateData.image !== undefined) product.image = updateData.image.trim();
  if (updateData.stock !== undefined) product.stock = Number(updateData.stock);
  if (updateData.available !== undefined) product.available = Boolean(updateData.available);

  await product.save();
  return product.toPublicJSON();
};

/**
 * Delete a product with ownership authorization check
 */
const deleteProduct = async ({ productId, userId, userRole }) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const shop = await Shop.findById(product.shopId);
  if (!shop) {
    const error = new Error('Associated shop not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User must own the shop or be an admin
  const isOwner = shop.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied. You do not own this shop.');
    error.statusCode = 403;
    throw error;
  }

  await Product.findByIdAndDelete(productId);
  return { message: 'Product deleted successfully', id: productId };
};

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
