import { Sparkles, ArrowRight } from 'lucide-react';
import './AiSearchSuggestions.css';

const DEFAULT_SUGGESTIONS = [
  'Black shoes under ₹2000',
  'Casual sneakers under ₹2500',
  'Cotton shirts for summer',
  'Leather wallet under ₹1000',
  'Jewellery for a special occasion',
  'Hardware tools near me'
];

/**
 * Component to present interactive natural-language search query suggestions
 * to guide users in conversational hyperlocal product discovery.
 *
 * @param {object} props
 * @param {function} props.onSelect - Callback (suggestionText) => void
 * @param {string[]} [props.suggestions] - Optional custom list of suggestions
 * @param {string} [props.title] - Optional section title
 */
export default function AiSearchSuggestions({
  onSelect,
  suggestions = DEFAULT_SUGGESTIONS,
  title = 'Try AI Search examples:'
}) {
  const items = Array.isArray(suggestions) && suggestions.length > 0
    ? suggestions
    : DEFAULT_SUGGESTIONS;

  const handleClick = (item) => {
    if (onSelect && typeof onSelect === 'function') {
      onSelect(item);
    }
  };

  return (
    <div className="ai-search-suggestions" id="ai-search-suggestions" role="region" aria-label="AI Search Suggestions">
      <div className="ai-suggestions-header">
        <Sparkles size={15} className="ai-suggestions-sparkle-icon" aria-hidden="true" />
        <span className="ai-suggestions-title">{title}</span>
      </div>

      <div className="ai-suggestions-list" role="list">
        {items.map((suggestion, index) => (
          <button
            key={`sug-${index}-${suggestion}`}
            type="button"
            className="ai-suggestion-pill"
            onClick={() => handleClick(suggestion)}
            id={`ai-suggestion-pill-${index}`}
            aria-label={`Search for: ${suggestion}`}
          >
            <span className="ai-suggestion-text">{suggestion}</span>
            <ArrowRight size={12} className="ai-suggestion-arrow" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
