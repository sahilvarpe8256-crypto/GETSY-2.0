const { body, validationResult } = require('express-validator');

// Validation rules for registration
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['customer', 'owner'])
    .withMessage('Invalid role specified. Only customer and owner roles are allowed.')
];

// Validation rules for login
const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['customer', 'owner']).withMessage('Role must be either customer or owner')
];

// Middleware to check validation results and return standard error format
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({ error: firstError });
  }
  next();
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
  validate
};
