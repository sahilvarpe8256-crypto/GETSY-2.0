const User = require('../models/User');
const Shop = require('../models/Shop');
const generateToken = require('../utils/generateToken');

/**
 * Helper to build public user JSON including shop info if user is an owner
 */
const buildUserResponse = async (user) => {
  const publicUser = user.toPublicJSON();
  if (user.role === 'owner') {
    const shop = await Shop.findOne({ ownerId: user._id });
    if (shop) {
      publicUser.shopId = shop._id.toString();
      publicUser.shopName = shop.shopName;
      publicUser.shopCategory = shop.shopType;
    }
  }
  return publicUser;
};

/**
 * Register a new user (Customer or Shop Owner)
 */
const registerUser = async ({ name, email, password, role, shopData }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email already exists. Please log in instead.');
    error.statusCode = 409;
    throw error;
  }

  // Validate role whitelist
  const safeRole = role || 'customer';
  if (!['customer', 'owner'].includes(safeRole)) {
    const error = new Error('Invalid role specified. Only customer and owner roles are allowed.');
    error.statusCode = 400;
    throw error;
  }

  // Create user instance (passwordHash set to plaintext password, pre-save hook will hash it)
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
    role: safeRole
  });

  await user.save();

  // If registering as owner with shopData, create associated Shop document in MongoDB
  if (user.role === 'owner' && shopData) {
    const coords = shopData?.coordinates || { lat: 18.5204, lng: 73.8567 };
    const lng = typeof coords.lng === 'number' ? coords.lng : typeof coords.longitude === 'number' ? coords.longitude : 73.8567;
    const lat = typeof coords.lat === 'number' ? coords.lat : typeof coords.latitude === 'number' ? coords.latitude : 18.5204;

    const shop = new Shop({
      ownerId: user._id,
      shopName: (shopData?.shopName || `${user.name}'s Store`).trim(),
      shopType: (shopData?.shopCategory || 'footwear').trim(),
      description: (shopData?.description || `Welcome to ${shopData?.shopName || user.name + "'s Store"}! Browse verified local stock and reserve in-store.`).trim(),
      phone: (shopData?.phone || '').trim(),
      image: (shopData?.shopImage || shopData?.image || '').trim(),
      address: (shopData?.shopAddress || shopData?.address || 'Local Market, Pune').trim(),
      area: (shopData?.shopLandmark || shopData?.locationName || shopData?.area || 'Pune').trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      verified: true
    });

    await shop.save();
  }

  const token = generateToken(user._id, user.role);
  const publicUser = await buildUserResponse(user);

  return {
    user: publicUser,
    token
  };
};

/**
 * Authenticate existing user
 */
const loginUser = async ({ email, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Authoritative role validation if login role was selected
  if (role) {
    const targetRole = String(role).toLowerCase().trim();
    if (targetRole === 'customer' && user.role === 'owner') {
      const error = new Error('No customer is registered with this email.');
      error.statusCode = 401;
      throw error;
    }
    if (targetRole === 'owner' && user.role === 'customer') {
      const error = new Error('No shop owner is registered with this email.');
      error.statusCode = 401;
      throw error;
    }
    if (user.role !== targetRole && user.role !== 'admin') {
      const error = new Error(`No ${targetRole === 'owner' ? 'shop owner' : 'customer'} is registered with this email.`);
      error.statusCode = 401;
      throw error;
    }
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);
  const publicUser = await buildUserResponse(user);

  return {
    user: publicUser,
    token
  };
};

/**
 * Get current authenticated user profile
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const publicUser = await buildUserResponse(user);

  return {
    user: publicUser
  };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
