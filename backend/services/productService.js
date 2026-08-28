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

  // Normalize stock and sizes
  const stockVal = productData.stock !== undefined
    ? Number(productData.stock)
    : (productData.quantity !== undefined ? Number(productData.quantity) : 0);

  const rawSizes = Array.isArray(productData.sizes)
    ? productData.sizes
    : (productData.size ? String(productData.size).split(',').map((s) => s.trim()).filter(Boolean) : []);

  const product = new Product({
    shopId: productData.shopId,
    name: productData.name ? productData.name.trim() : '',
    category: productData.category ? productData.category.trim() : '',
    description: productData.description ? productData.description.trim() : '',
    price: Number(productData.price),
    image: productData.image ? productData.image.trim() : '',
    stock: isNaN(stockVal) ? 0 : Math.max(0, stockVal),
    sizes: rawSizes,
    size: productData.size ? String(productData.size).trim() : (rawSizes.join(', ')),
    available: productData.available !== undefined ? Boolean(productData.available) : (stockVal > 0)
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

  if (category && category !== 'all') {
    const trimmed = category.trim().toLowerCase();
    if (trimmed === 'home' || trimmed === 'home & living' || trimmed === 'home_living' || trimmed === 'home-living') {
      filter.category = new RegExp('^(home|home & living|home_living|home-living|furniture)$', 'i');
    } else if (trimmed === 'hardware') {
      filter.category = new RegExp('^(hardware|hardware & tools|tools)$', 'i');
    } else if (trimmed === 'ornaments') {
      filter.category = new RegExp('^(ornaments|jewellery|jewelry)$', 'i');
    } else {
      filter.category = new RegExp('^' + category.trim() + '$', 'i');
    }
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

  if (updateData.stock !== undefined) {
    product.stock = Math.max(0, Number(updateData.stock));
  } else if (updateData.quantity !== undefined) {
    product.stock = Math.max(0, Number(updateData.quantity));
  }

  if (updateData.sizes !== undefined) {
    product.sizes = Array.isArray(updateData.sizes) ? updateData.sizes : String(updateData.sizes).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (updateData.size !== undefined) {
    product.size = String(updateData.size).trim();
  }

  if (updateData.available !== undefined) {
    product.available = Boolean(updateData.available);
  } else if (updateData.stock !== undefined || updateData.quantity !== undefined) {
    product.available = product.stock > 0;
  }

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

  // 1. Delete associated product reviews
  const Review = require('../models/Review');
  await Review.deleteMany({ productId });

  // 2. Cascade delete/pull from all Wishlists in MongoDB
  const Wishlist = require('../models/Wishlist');
  await Wishlist.updateMany(
    { products: productId.toString() },
    { $pull: { products: productId.toString() } }
  );

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
