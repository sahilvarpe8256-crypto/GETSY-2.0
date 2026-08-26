import { Sparkles, X, RotateCcw, MapPin, Tag, IndianRupee } from 'lucide-react';
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
    groceries: 'Groceries',
    grocery: 'Groceries',
    beauty: 'Beauty',
    sports: 'Sports',
    books: 'Books',
    home: 'Home'
  };
  const lower = cat.toLowerCase().trim();
  return map[lower] || lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Format price values (min, max, or range) to user-friendly currency string
 */
function formatPriceLabel(priceObj, maxPriceFallback, minPriceFallback) {
  const min = priceObj?.min !== undefined && priceObj?.min !== null ? Number(priceObj.min) : (minPriceFallback !== undefined && minPriceFallback !== null ? Number(minPriceFallback) : null);
  const max = priceObj?.max !== undefined && priceObj?.max !== null ? Number(priceObj.max) : (maxPriceFallback !== undefined && maxPriceFallback !== null ? Number(maxPriceFallback) : null);

  if (min !== null && !isNaN(min) && max !== null && !isNaN(max)) {
    return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  }
  if (max !== null && !isNaN(max)) {
    return `Under ₹${max.toLocaleString('en-IN')}`;
  }
  if (min !== null && !isNaN(min)) {
    return `Above ₹${min.toLocaleString('en-IN')}`;
  }
  return '';
}

/**
 * Component to display structured natural-language query insights
 * as interactive, removable filter chips with polished accessibility and transitions.
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

  const { category, maxPrice, minPrice, price, keywords, location, attributes, latitude, longitude } = structuredQuery;

  const hasCategory = Boolean(category && typeof category === 'string');

  const priceLabel = formatPriceLabel(price, maxPrice, minPrice);
  const hasPrice = Boolean(priceLabel);

  // Location handling
  const locName = location?.name ? location.name.charAt(0).toUpperCase() + location.name.slice(1) : null;
  const hasLocation = Boolean(
    locName ||
    (latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) && longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) ||
    (location?.latitude !== undefined && location?.latitude !== null && location?.longitude !== undefined && location?.longitude !== null)
  );
  const locationLabel = locName ? `Near ${locName}` : 'Nearby Location';

  // Attributes handling
  const color = attributes?.color || null;
  const style = attributes?.style || null;
  const material = attributes?.material || null;
  const size = attributes?.size || null;

  // Filter keywords to not duplicate recognized attributes
  const attrTokens = new Set([
    (color || '').toLowerCase(),
    (style || '').toLowerCase(),
    (material || '').toLowerCase(),
    (size || '').toLowerCase()
  ]);

  const validKeywords = Array.isArray(keywords)
    ? keywords.filter((k) => k && typeof k === 'string' && k.trim().length > 0 && !attrTokens.has(k.toLowerCase().trim()))
    : [];

  const totalChips =
    (hasCategory ? 1 : 0) +
    (hasPrice ? 1 : 0) +
    (hasLocation ? 1 : 0) +
    (color ? 1 : 0) +
    (style ? 1 : 0) +
    (material ? 1 : 0) +
    (size ? 1 : 0) +
    validKeywords.length;

  if (totalChips === 0) {
    return null;
  }

  const handleRemove = (type, value) => {
    if (onRemoveFilter) {
      onRemoveFilter({ type, ...(value !== undefined ? { value } : {}) });
    }
  };

  return (
    <div
      className="ai-search-insights"
      id="ai-search-insights"
      role="region"
      aria-label="AI Search Interpretation"
    >
      <div className="ai-search-insights-header">
        <div className="ai-search-insights-label">
          <div className="ai-search-insights-sparkle-wrap">
            <Sparkles size={15} className="ai-search-insights-sparkle-icon" aria-hidden="true" />
          </div>
          <span className="ai-search-insights-title">AI understood your search:</span>
        </div>

        {onReset && (
          <button
            type="button"
            className="ai-search-insights-reset-btn"
            onClick={onReset}
            aria-label="Reset all AI filter criteria"
            id="ai-clear-filters-btn"
          >
            <RotateCcw size={12} aria-hidden="true" />
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
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Price / Price Range Chip */}
        {hasPrice && (
          <div className="ai-insight-chip ai-insight-chip--price" id="ai-chip-price">
            <IndianRupee size={12} className="ai-insight-chip-icon" aria-hidden="true" />
            <span className="ai-insight-chip-text">{priceLabel}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('price')}
              aria-label={`Remove price filter: ${priceLabel}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Location Chip */}
        {hasLocation && (
          <div className="ai-insight-chip ai-insight-chip--location" id="ai-chip-location">
            <MapPin size={13} className="ai-insight-chip-icon" aria-hidden="true" />
            <span className="ai-insight-chip-text">{locationLabel}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('location')}
              aria-label={`Remove location filter: ${locationLabel}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Color Attribute Chip */}
        {color && (
          <div className="ai-insight-chip ai-insight-chip--keyword" id="ai-chip-color">
            <span className="ai-insight-chip-hash">●</span>
            <span className="ai-insight-chip-text">Color: {color.charAt(0).toUpperCase() + color.slice(1)}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('color')}
              aria-label={`Remove color filter: ${color}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Style Attribute Chip */}
        {style && (
          <div className="ai-insight-chip ai-insight-chip--keyword" id="ai-chip-style">
            <span className="ai-insight-chip-hash">★</span>
            <span className="ai-insight-chip-text">Style: {style.charAt(0).toUpperCase() + style.slice(1)}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('style')}
              aria-label={`Remove style filter: ${style}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Material Attribute Chip */}
        {material && (
          <div className="ai-insight-chip ai-insight-chip--keyword" id="ai-chip-material">
            <span className="ai-insight-chip-hash">◈</span>
            <span className="ai-insight-chip-text">Material: {material.charAt(0).toUpperCase() + material.slice(1)}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('material')}
              aria-label={`Remove material filter: ${material}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Size Attribute Chip */}
        {size && (
          <div className="ai-insight-chip ai-insight-chip--keyword" id="ai-chip-size">
            <span className="ai-insight-chip-hash">⬚</span>
            <span className="ai-insight-chip-text">Size: {size.toUpperCase()}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('size')}
              aria-label={`Remove size filter: ${size}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* General Keyword Chips */}
        {validKeywords.map((keyword) => (
          <div
            key={`kw-${keyword}`}
            className="ai-insight-chip ai-insight-chip--keyword"
            id={`ai-chip-keyword-${keyword}`}
          >
            <span className="ai-insight-chip-hash">#</span>
            <span className="ai-insight-chip-text">{keyword}</span>
            <button
              type="button"
              className="ai-insight-chip-remove"
              onClick={() => handleRemove('keyword', keyword)}
              aria-label={`Remove keyword filter: ${keyword}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
