const { body, query, validationResult } = require('express-validator');

// Protected fields that clients cannot update directly
const PROTECTED_FIELDS = ['ownerId', 'verified', '_id', 'id', 'createdAt', 'updatedAt'];

const createShopValidationRules = [
  body('shopName')
    .trim()
    .notEmpty()
    .withMessage('Shop name is required'),
  body('shopType')
    .trim()
    .notEmpty()
    .withMessage('Shop type is required'),
  body()
    .custom((bodyData) => {
      let lat, lng;
      if (bodyData.location && typeof bodyData.location === 'object') {
        if (Array.isArray(bodyData.location.coordinates) && bodyData.location.coordinates.length === 2) {
          lng = Number(bodyData.location.coordinates[0]);
          lat = Number(bodyData.location.coordinates[1]);
        } else if (bodyData.location.latitude !== undefined && bodyData.location.longitude !== undefined) {
          lat = Number(bodyData.location.latitude);
          lng = Number(bodyData.location.longitude);
        }
      } else if (bodyData.latitude !== undefined && bodyData.longitude !== undefined) {
        lat = Number(bodyData.latitude);
        lng = Number(bodyData.longitude);
      }

      if (lat === undefined || isNaN(lat)) {
        throw new Error('Valid latitude is required');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      if (lng === undefined || isNaN(lng)) {
        throw new Error('Valid longitude is required');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    })
];

const updateShopValidationRules = [
  body()
    .custom((bodyData) => {
      // Check for protected field attempts
      for (const field of PROTECTED_FIELDS) {
        if (bodyData[field] !== undefined) {
          throw new Error(`Updating field '${field}' is not allowed`);
        }
      }

      // Check for location validation if provided
      let lat, lng;
      let hasLocation = false;
      if (bodyData.location && typeof bodyData.location === 'object') {
        if (Array.isArray(bodyData.location.coordinates) && bodyData.location.coordinates.length === 2) {
          lng = Number(bodyData.location.coordinates[0]);
          lat = Number(bodyData.location.coordinates[1]);
          hasLocation = true;
        } else if (bodyData.location.latitude !== undefined && bodyData.location.longitude !== undefined) {
          lat = Number(bodyData.location.latitude);
          lng = Number(bodyData.location.longitude);
          hasLocation = true;
        }
      } else if (bodyData.latitude !== undefined && bodyData.longitude !== undefined) {
        lat = Number(bodyData.latitude);
        lng = Number(bodyData.longitude);
        hasLocation = true;
      }

      if (hasLocation) {
        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          throw new Error('Longitude must be between -180 and 180');
        }
      }

      return true;
    })
];

const nearbyShopValidationRules = [
  query('latitude')
    .notEmpty()
    .withMessage('Latitude query parameter is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .notEmpty()
    .withMessage('Longitude query parameter is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Radius must be greater than 0')
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
  createShopValidationRules,
  updateShopValidationRules,
  nearbyShopValidationRules,
  validate
};
