const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/wishlist
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist/toggle
router.post('/toggle', wishlistController.toggleWishlist);

// POST /api/wishlist
router.post('/', wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
