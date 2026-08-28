const express = require('express');
const reviewController = require('../controllers/reviewController');
const {
  createReviewValidationRules,
  updateReviewValidationRules,
  validate
} = require('../validators/reviewValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Public routes
 */
router.get('/', reviewController.getReviews);

/**
 * Protected routes (Requires Customer / Authenticated User)
 */
router.post(
  '/',
  protect,
  createReviewValidationRules,
  validate,
  reviewController.createReview
);

router.put(
  '/:id',
  protect,
  updateReviewValidationRules,
  validate,
  reviewController.updateReview
);

router.delete(
  '/:id',
  protect,
  reviewController.deleteReview
);

module.exports = router;
