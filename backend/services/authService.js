const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  // Create user instance (passwordHash set to plaintext password, pre-save hook will hash it)
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
    role: role || 'customer'
  });

  await user.save();

  const token = generateToken(user._id, user.role);

  return {
    user: user.toPublicJSON(),
    token
  };
};

/**
 * Authenticate existing user
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

  return {
    user: user.toPublicJSON(),
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

  return {
    user: user.toPublicJSON()
  };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
