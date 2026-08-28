const { body, query, validationResult } = require('express-validator');

// Protected fields that clients cannot update directly on a product
const PROTECTED_FIELDS = ['shopId', '_id', 'id', 'createdAt', 'updatedAt'];

const createProductValidationRules = [
  body('shopId')
    .notEmpty()
    .withMessage('Shop ID is required')
    .isMongoId()
    .withMessage('Invalid Shop ID format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer greater than or equal to 0'),
  body('sizes')
    .optional(),
  body('size')
    .optional(),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean')
];

const updateProductValidationRules = [
  body()
    .custom((bodyData) => {
      // Check for attempts to update protected fields
      for (const field of PROTECTED_FIELDS) {
        if (bodyData[field] !== undefined) {
          throw new Error(`Updating field '${field}' is not allowed`);
        }
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer greater than or equal to 0'),
  body('sizes')
    .optional(),
  body('size')
    .optional(),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean')
];

const searchProductValidationRules = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query parameter is required')
];

// Validation result middleware enforcing standard error response format
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({ error: firstError });
  }
  next();
};

module.exports = {
  createProductValidationRules,
  updateProductValidationRules,
  searchProductValidationRules,
  validate
};
