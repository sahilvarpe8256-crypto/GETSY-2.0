import { Sparkles, X, RotateCcw, MapPin, Tag } from 'lucide-react';
import './AiSearchInsights.css';

/**
 * Format category identifier to user-friendly display name
 */
function formatCategory(cat) {
  if (!cat || typeof cat !== 'string') return '';
  const map = {
    footwear: 'Footwear',
    clothing: 'Clothing',
    accessories: 'Accessories',
    ornaments: 'Ornaments',
    hardware: 'Hardware',
    electronics: 'Electronics',
    groceries: 'Groceries'
  };
  const lower = cat.toLowerCase().trim();
  return map[lower] || lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Format maxPrice to currency string
 */
function formatPrice(price) {
  const num = Number(price);
  if (isNaN(num)) return '';
  return `Under ₹${num.toLocaleString('en-IN')}`;
}

/**
 * Component to display structured natural-language query insights
 * as interactive, removable filter chips.
 *
 * @param {object} props
 * @param {object} props.structuredQuery - Parsed query data
 * @param {function} props.onRemoveFilter - Callback ({ type, value }) => void
 * @param {function} props.onReset - Callback () => void
 */
export default function AiSearchInsights({
  structuredQuery,
  onRemoveFilter,
  onReset
}) {
  if (!structuredQuery || typeof structuredQuery !== 'object') {
    return null;
  }

  const { category, maxPrice, keywords, latitude, longitude } = structuredQuery;

  const hasCategory = Boolean(category && typeof category === 'string');
  const hasPrice = maxPrice !== undefined && maxPrice !== null && !isNaN(Number(maxPrice));
  const validKeywords = Array.isArray(keywords)
    ? keywords.filter((k) => k && typeof k === 'string' && k.trim().length > 0)
    : [];
  const hasLocation =
    latitude !== undefined &&
    latitude !== null &&
    !isNaN(Number(latitude)) &&
    longitude !== undefined &&
    longitude !== null &&
    !isNaN(Number(longitude));

  const totalChips =
    (hasCategory ? 1 : 0) +
    (hasPrice ? 1 : 0) +
    validKeywords.length +
    (hasLocation ? 1 : 0);

  if (totalChips === 0) {
    return null;
  }

  const handleRemove = (type, value) => {
    if (onRemoveFilter) {
      onRemoveFilter({ type, ...(value !== undefined ? { value } : {}) });
    }
  };

  return (
    <div className="ai-search-insights" id="ai-search-insights" role="region" aria-label="AI Search Filters">
      <div className="ai-search-insights-header">
        <div className="ai-search-insights-label">
          <Sparkles size={16} className="ai-search-insights-sparkle-icon" aria-hidden="true" />
          <span className="ai-search-insights-title">AI understood:</span>
        </div>

        {onReset && (
          <button
            type="button"
            className="ai-search-insights-reset-btn"
            onClick={onReset}
            aria-label="Clear all AI filters"
            id="ai-clear-filters-btn"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      <div className="ai-search-insights-chips">
        {/* Category Chip */}
        {hasCategory && (
          <div className="ai-insight-chip ai-insight-chip--category" id="ai-chip-category">
            <Tag size={13} className="ai-insight-chip-icon" aria-hidden="true" />
            <span className="ai-insight-chip-text">{formatCategory(category)}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('category')}
              aria-label={`Remove category filter: ${category}`}
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Max Price Chip */}
        {hasPrice && (
          <div className="ai-insight-chip ai-insight-chip--price" id="ai-chip-price">
            <span className="ai-insight-chip-text">{formatPrice(maxPrice)}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('maxPrice')}
              aria-label={`Remove price filter: under ₹${maxPrice}`}
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Keyword Chips */}
        {validKeywords.map((keyword) => (
          <div
            key={`kw-${keyword}`}
            className="ai-insight-chip ai-insight-chip--keyword"
            id={`ai-chip-keyword-${keyword}`}
          >
            <span className="ai-insight-chip-text">{keyword}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('keyword', keyword)}
              aria-label={`Remove keyword filter: ${keyword}`}
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        ))}

        {/* Location Chip */}
        {hasLocation && (
          <div className="ai-insight-chip ai-insight-chip--location" id="ai-chip-location">
            <MapPin size={13} className="ai-insight-chip-icon" aria-hidden="true" />
            <span className="ai-insight-chip-text">Nearby</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('location')}
              aria-label="Remove nearby location filter"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
