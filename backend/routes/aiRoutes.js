const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const {
  aiSearchValidationRules,
  validate
} = require('../validators/aiValidator');

// POST /api/search/ai (Intelligent AI-powered search - Public)
router.post('/ai', aiSearchValidationRules, validate, aiController.intelligentSearch);

module.exports = router;
