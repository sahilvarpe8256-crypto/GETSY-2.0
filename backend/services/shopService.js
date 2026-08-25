const Shop = require('../models/Shop');

/**
 * Helper to parse input location data into standard GeoJSON Point format
 */
const parseGeoJSONLocation = (data) => {
  let lat, lng;
  if (data.location && typeof data.location === 'object') {
    if (Array.isArray(data.location.coordinates) && data.location.coordinates.length === 2) {
      lng = Number(data.location.coordinates[0]);
      lat = Number(data.location.coordinates[1]);
    } else if (data.location.latitude !== undefined && data.location.longitude !== undefined) {
      lat = Number(data.location.latitude);
      lng = Number(data.location.longitude);
    }
  } else if (data.latitude !== undefined && data.longitude !== undefined) {
    lat = Number(data.latitude);
    lng = Number(data.longitude);
  }

  if (lat !== undefined && lng !== undefined) {
    return {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }
  return undefined;
};

/**
 * Create a new shop associated with authenticated owner
 */
const createShop = async ({ ownerId, shopData }) => {
  const location = parseGeoJSONLocation(shopData);
  if (!location) {
    const error = new Error('Valid location coordinates [longitude, latitude] are required');
    error.statusCode = 400;
    throw error;
  }

  const shop = new Shop({
    ownerId,
    shopName: shopData.shopName ? shopData.shopName.trim() : '',
    shopType: shopData.shopType ? shopData.shopType.trim() : '',
    description: shopData.description ? shopData.description.trim() : '',
    phone: shopData.phone ? shopData.phone.trim() : '',
    image: shopData.image ? shopData.image.trim() : '',
    address: shopData.address ? shopData.address.trim() : '',
    area: shopData.area ? shopData.area.trim() : '',
    location
  });

  await shop.save();
  return shop.toPublicJSON();
};

/**
 * Retrieve all shops
 */
const getAllShops = async () => {
  const shops = await Shop.find({});
  return shops.map((shop) => shop.toPublicJSON());
};

/**
 * Get shop by ID
 */
const getShopById = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    const error = new Error('Shop not found');
    error.statusCode = 404;
    throw error;
  }
  return shop.toPublicJSON();
};

/**
 * Query shops near given coordinates within optional radius (km)
 */
const getNearbyShops = async ({ latitude, longitude, radius }) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const radInKm = radius !== undefined ? parseFloat(radius) : 5;
  const maxDistanceInMeters = radInKm * 1000;

  const shops = await Shop.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceInMeters
      }
    }
  });

  return shops.map((shop) => shop.toPublicJSON());
};

/**
 * Update shop details with ownership authorization check
 */
const updateShop = async ({ shopId, userId, userRole, updateData }) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    const error = new Error('Shop not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User must be the owner of the shop or an admin
  const isOwner = shop.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied. You do not own this shop.');
    error.statusCode = 403;
    throw error;
  }

  // Permitted updatable fields
  if (updateData.shopName !== undefined) shop.shopName = updateData.shopName.trim();
  if (updateData.shopType !== undefined) shop.shopType = updateData.shopType.trim();
  if (updateData.description !== undefined) shop.description = updateData.description.trim();
  if (updateData.phone !== undefined) shop.phone = updateData.phone.trim();
  if (updateData.image !== undefined) shop.image = updateData.image.trim();
  if (updateData.address !== undefined) shop.address = updateData.address.trim();
  if (updateData.area !== undefined) shop.area = updateData.area.trim();

  // Handle location update if present
  const updatedLocation = parseGeoJSONLocation(updateData);
  if (updatedLocation) {
    shop.location = updatedLocation;
  }

  await shop.save();
  return shop.toPublicJSON();
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  getNearbyShops,
  updateShop
};
