const Review = require('../models/Review');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Recalculate and update aggregate rating & reviewsCount on target Shop or Product
 */
const syncAggregateRating = async (shopId, productId) => {
  try {
    if (shopId) {
      const shopReviews = await Review.find({ shopId, productId: null });
      const count = shopReviews.length;
      const avg = count > 0
        ? Number((shopReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
        : 4.8;

      await Shop.findByIdAndUpdate(shopId, {
        rating: avg,
        reviewsCount: count
      });
    }

    if (productId) {
      const productReviews = await Review.find({ productId });
      const count = productReviews.length;
      const avg = count > 0
        ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
        : 4.8;

      await Product.findByIdAndUpdate(productId, {
        rating: avg,
        reviewsCount: count
      });
    }
  } catch (err) {
    // Non-fatal logging for rating recalculation
    console.error('Error syncing aggregate rating:', err.message);
  }
};

/**
 * Create or update a customer review
 */
const createReview = async ({ userId, userRole, reviewData }) => {
  const { shopId, productId, rating, comment } = reviewData;

  if (!shopId && !productId) {
    const error = new Error('Either shopId or productId is required to submit a review');
    error.statusCode = 400;
    throw error;
  }

  // Fetch author details for safe display name
  const user = await User.findById(userId);
  const authorName = user ? user.name : 'Verified Buyer';

  // Target query
  const queryFilter = {
    userId,
    shopId: shopId || null,
    productId: productId || null
  };

  let review = await Review.findOne(queryFilter);

  if (review) {
    // Customer updates their existing review
    review.rating = Number(rating);
    review.comment = comment.trim();
    review.userName = authorName;
    await review.save();
  } else {
    review = new Review({
      userId,
      shopId: shopId || null,
      productId: productId || null,
      rating: Number(rating),
      comment: comment.trim(),
      userName: authorName
    });
    await review.save();
  }

  await syncAggregateRating(shopId, productId);
  await review.populate('userId', 'name');

  return review.toPublicJSON();
};

/**
 * Get all reviews for a shop or product
 */
const getReviews = async ({ shopId, productId }) => {
  const filter = {};
  if (shopId) filter.shopId = shopId;
  if (productId) filter.productId = productId;

  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'name');

  const count = reviews.length;
  const avgRating = count > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
    : 4.8;

  return {
    reviews: reviews.map((r) => r.toPublicJSON()),
    reviewsCount: count,
    averageRating: avgRating
  };
};

/**
 * Update an existing review with ownership check
 */
const updateReview = async ({ reviewId, userId, userRole, updateData }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User must own the review or be admin
  const isOwner = review.userId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied. You can only modify your own review.');
    error.statusCode = 403;
    throw error;
  }

  if (updateData.rating !== undefined) review.rating = Number(updateData.rating);
  if (updateData.comment !== undefined) review.comment = updateData.comment.trim();

  await review.save();
  await syncAggregateRating(review.shopId, review.productId);
  await review.populate('userId', 'name');

  return review.toPublicJSON();
};

/**
 * Delete a review with ownership check
 */
const deleteReview = async ({ reviewId, userId, userRole }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User must own the review or be admin
  const isOwner = review.userId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied. You can only delete your own review.');
    error.statusCode = 403;
    throw error;
  }

  const { shopId, productId } = review;
  await Review.findByIdAndDelete(reviewId);
  await syncAggregateRating(shopId, productId);

  return { message: 'Review deleted successfully', id: reviewId };
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview
};
