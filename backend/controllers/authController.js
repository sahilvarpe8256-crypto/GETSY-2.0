const authService = require('../services/authService');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user or shop owner account
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, shopData } = req.body;
    const result = await authService.registerUser({ name, email, password, role, shopData });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate existing user and return token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.loginUser({ email, password, role });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user details
 * @access  Private (Bearer token)
 */
const getMe = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
