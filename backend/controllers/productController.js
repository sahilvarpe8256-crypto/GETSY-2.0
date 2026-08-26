const productService = require('../services/productService');

/**
 * @route   GET /api/products
 * @desc    Retrieve products with optional filtering (shopId, category, search)
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { shopId, category, search } = req.query;
    const products = await productService.getProducts({ shopId, category, search });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/search
 * @desc    Search products by query parameter
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    const products = await productService.searchProducts({ query });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Retrieve single product by ID
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Shop owner / Admin required)
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct({
      userId: req.user._id,
      userRole: req.user.role,
      productData: req.body
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product details
 * @access  Private (Shop owner / Admin required)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct({
      productId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role,
      updateData: req.body
    });
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Shop owner / Admin required)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct({
      productId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
