const { body, query, validationResult } = require('express-validator');

const createReviewValidationRules = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 2, max: 1000 })
    .withMessage('Review comment must be between 2 and 1000 characters'),
  body('shopId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Shop ID format'),
  body('productId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Product ID format')
];

const updateReviewValidationRules = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 2, max: 1000 })
    .withMessage('Review comment must be between 2 and 1000 characters')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({ error: firstError });
  }
  next();
};

module.exports = {
  createReviewValidationRules,
  updateReviewValidationRules,
  validate
};
