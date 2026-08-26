const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidationRules,
  loginValidationRules,
  validate
} = require('../validators/authValidator');

// POST /api/auth/register
router.post('/register', registerValidationRules, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginValidationRules, validate, authController.login);

// GET /api/auth/me
router.get('/me', protect, authController.getMe);

module.exports = router;
