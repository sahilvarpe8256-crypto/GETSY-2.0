/**
 * GETSY 2.0 — AI Module Entry Point
 * =================================
 * Standalone natural language understanding and intelligent search module.
 * Provides ₹0 deterministic rule-based query parsing and search provider abstractions.
 */

const { parseQuery, ATTRIBUTE_VALUES, STOP_WORDS } = require('./parser/queryParser');
const BaseAIProvider = require('./providers/base');
const RuleBasedProvider = require('./providers/ruleBasedProvider');
const { CATEGORIES } = require('./data/categories');
const { LOCATIONS } = require('./data/locations');
const { MOCK_PRODUCTS, MOCK_SHOPS } = require('./data/mockData');

// Default standalone provider instance
const defaultProvider = new RuleBasedProvider();

module.exports = {
  // Primary Parser API
  parseQuery,

  // Provider Classes
  BaseAIProvider,
  RuleBasedProvider,

  // Default Provider Instance
  defaultProvider,

  // Data & Metadata
  CATEGORIES,
  LOCATIONS,
  MOCK_PRODUCTS,
  MOCK_SHOPS,
  ATTRIBUTE_VALUES,
  STOP_WORDS
};
