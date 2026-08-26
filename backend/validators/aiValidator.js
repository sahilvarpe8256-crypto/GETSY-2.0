const { body, validationResult } = require('express-validator');

// Validation rules for AI intelligent search
const aiSearchValidationRules = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
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
  aiSearchValidationRules,
  validate
};
