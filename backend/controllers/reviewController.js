const reviewService = require('../services/reviewService');

/**
 * GET /api/reviews
 * Fetch reviews by shopId or productId
 */
const getReviews = async (req, res, next) => {
  try {
    const { shopId, productId } = req.query;
    const result = await reviewService.getReviews({ shopId, productId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews
 * Submit a customer review (Authenticated)
 */
const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview({
      userId: req.user.id,
      userRole: req.user.role,
      reviewData: req.body
    });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/reviews/:id
 * Update an existing review (Authenticated, owner only)
 */
const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview({
      reviewId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role,
      updateData: req.body
    });
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete a review (Authenticated, owner only)
 */
const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview({
      reviewId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview
};
