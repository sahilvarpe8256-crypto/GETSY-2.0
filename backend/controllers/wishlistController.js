const wishlistService = require('../services/wishlistService');

/**
 * @route   GET /api/wishlist
 * @desc    Get current authenticated user's wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.getWishlist(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/wishlist/toggle
 * @desc    Toggle product in user's wishlist
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await wishlistService.toggleWishlist(req.user._id, productId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/wishlist
 * @desc    Add product to user's wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await wishlistService.addToWishlist(req.user._id, productId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove product from user's wishlist
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await wishlistService.removeFromWishlist(req.user._id, productId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist
};
