const aiService = require('../services/aiService');

/**
 * @route   POST /api/search/ai
 * @desc    Intelligent AI-powered product search using natural language query
 * @access  Public
 */
const intelligentSearch = async (req, res, next) => {
  try {
    const { query, latitude, longitude } = req.body;
    const result = await aiService.intelligentSearch({ query, latitude, longitude });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  intelligentSearch
};
