const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createShopValidationRules,
  updateShopValidationRules,
  nearbyShopValidationRules,
  validate
} = require('../validators/shopValidator');

// GET /api/shops (Retrieve all shops)
router.get('/', shopController.getShops);

// GET /api/shops/nearby (Retrieve nearby shops - MUST come before /:id)
router.get('/nearby', nearbyShopValidationRules, validate, shopController.getNearbyShops);

// GET /api/shops/:id (Retrieve shop by ID)
router.get('/:id', shopController.getShop);

// POST /api/shops (Create new shop - Owner / Admin only)
router.post(
  '/',
  protect,
  requireRole('owner', 'admin'),
  createShopValidationRules,
  validate,
  shopController.createShop
);

// PUT /api/shops/:id (Update shop - Owner / Admin only)
router.put(
  '/:id',
  protect,
  requireRole('owner', 'admin'),
  updateShopValidationRules,
  validate,
  shopController.updateShop
);

// DELETE /api/shops/:id (Delete shop - Owner / Admin only)
router.delete(
  '/:id',
  protect,
  requireRole('owner', 'admin'),
  shopController.deleteShop
);

module.exports = router;
