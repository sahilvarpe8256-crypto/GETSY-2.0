const shopService = require('../services/shopService');

/**
 * @route   GET /api/shops
 * @desc    Retrieve all shops
 * @access  Public
 */
const getShops = async (req, res, next) => {
  try {
    const shops = await shopService.getAllShops();
    res.status(200).json(shops);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/shops/nearby
 * @desc    Retrieve shops near specified coordinates
 * @access  Public
 */
const getNearbyShops = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const shops = await shopService.getNearbyShops({ latitude, longitude, radius });
    res.status(200).json(shops);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/shops/:id
 * @desc    Retrieve a single shop by ID
 * @access  Public
 */
const getShop = async (req, res, next) => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/shops
 * @desc    Create a new shop
 * @access  Private (Owner / Admin required)
 */
const createShop = async (req, res, next) => {
  try {
    const shop = await shopService.createShop({
      ownerId: req.user._id,
      shopData: req.body
    });
    res.status(201).json(shop);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/shops/:id
 * @desc    Update shop details
 * @access  Private (Shop owner / Admin required)
 */
const updateShop = async (req, res, next) => {
  try {
    const shop = await shopService.updateShop({
      shopId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role,
      updateData: req.body
    });
    res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/shops/:id
 * @desc    Delete shop and cascade associated products and reviews
 * @access  Private (Shop owner / Admin required)
 */
const deleteShop = async (req, res, next) => {
  try {
    const result = await shopService.deleteShop({
      shopId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShops,
  getNearbyShops,
  getShop,
  createShop,
  updateShop,
  deleteShop
};
