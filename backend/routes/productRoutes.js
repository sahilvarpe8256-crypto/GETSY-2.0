const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createProductValidationRules,
  updateProductValidationRules,
  searchProductValidationRules,
  validate
} = require('../validators/productValidator');

// GET /api/products (Retrieve products with optional filtering)
router.get('/', productController.getProducts);

// GET /api/products/search (Search products by query - MUST come before /:id)
router.get('/search', searchProductValidationRules, validate, productController.searchProducts);

// GET /api/products/:id (Retrieve single product by ID)
router.get('/:id', productController.getProduct);

// POST /api/products (Create new product - Owner / Admin only)
router.post(
  '/',
  protect,
  requireRole('owner', 'admin'),
  createProductValidationRules,
  validate,
  productController.createProduct
);

// PUT /api/products/:id (Update product - Owner / Admin only)
router.put(
  '/:id',
  protect,
  requireRole('owner', 'admin'),
  updateProductValidationRules,
  validate,
  productController.updateProduct
);

// DELETE /api/products/:id (Delete product - Owner / Admin only)
router.delete(
  '/:id',
  protect,
  requireRole('owner', 'admin'),
  productController.deleteProduct
);

module.exports = router;
