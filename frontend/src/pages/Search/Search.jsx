import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Sparkles } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { categories } from '../../data/categories';
import { intelligentSearch, filterProductsByStructuredQuery } from '../../services/aiSearchService';
import { getAllMergedProducts } from '../../services/productService';
import SearchBar from '../../components/common/SearchBar';
import CategoryPill from '../../components/common/CategoryPill';
import ProductGrid from '../../components/product/ProductGrid';
import LocationModal from '../../components/common/LocationModal';
import AiSearchInsights from '../../components/search/AiSearchInsights';
import AiSearchSuggestions from '../../components/search/AiSearchSuggestions';
import './Search.css';

export default function Search() {
  const { location, coordinates } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [results, setResults] = useState([]);
  const [structuredQuery, setStructuredQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchSource, setSearchSource] = useState('local');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');

  // Request counter ref to prevent race conditions and stale promise overwrites
  const activeRequestIdRef = useRef(0);

  // Synchronize input & category state with URL parameters
  useEffect(() => {
    setSearchQuery(queryParam);
    setActiveCategory(categoryParam);
  }, [queryParam, categoryParam]);

  // Execute Search on parameter or location change
  useEffect(() => {
    const currentRequestId = ++activeRequestIdRef.current;
    setLoading(true);

    if (queryParam && queryParam.trim()) {
      // Natural-language AI Search execution
      intelligentSearch(queryParam, coordinates)
        .then((response) => {
          if (currentRequestId !== activeRequestIdRef.current) return;

          let products = response.products || [];
          const parsed = response.structuredQuery || {};

          // If URL specifies a category and AI didn't override, apply category filter
          if (categoryParam && categoryParam !== 'all' && !parsed.category) {
            products = products.filter(
              (p) => (p.category || '').toLowerCase() === categoryParam.toLowerCase()
            );
          }

          setStructuredQuery(parsed);
          setResults(products);
          setSearchSource(response.source || 'fallback');
          setLoading(false);
        })
        .catch(() => {
          if (currentRequestId !== activeRequestIdRef.current) return;
          setStructuredQuery(null);
          setResults([]);
          setLoading(false);
        });
    } else {
      // Standard browse/category view
      setStructuredQuery(null);
      const all = getAllMergedProducts();
      let filtered = all;

      if (categoryParam && categoryParam !== 'all') {
        filtered = filtered.filter(
          (p) => (p.category || '').toLowerCase() === categoryParam.toLowerCase()
        );
      }

      setResults(filtered);
      setSearchSource('local');
      setLoading(false);
    }

    return () => {
      // Component unmount or dependency update
    };
  }, [queryParam, categoryParam, coordinates]);

  const handleSearchSubmit = (newQuery) => {
    const trimmed = (newQuery || '').trim();
    const params = {};
    if (trimmed) params.q = trimmed;
    if (activeCategory && activeCategory !== 'all') params.cat = activeCategory;
    setSearchParams(params);
  };

  const handleSearchSuggestion = (suggestionText) => {
    const trimmed = (suggestionText || '').trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setSearchParams({ q: trimmed });
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    const params = {};
    if (queryParam) params.q = queryParam;
    if (catId !== 'all') params.cat = catId;
    setSearchParams(params);
  };

  const handleRemoveFilter = ({ type, value }) => {
    if (!structuredQuery) return;

    const updated = { ...structuredQuery };

    if (type === 'category') {
      delete updated.category;
      if (activeCategory !== 'all') {
        setActiveCategory('all');
      }
    } else if (type === 'maxPrice') {
      delete updated.maxPrice;
    } else if (type === 'keyword' && value) {
      if (Array.isArray(updated.keywords)) {
        updated.keywords = updated.keywords.filter(
          (kw) => kw.toLowerCase() !== String(value).toLowerCase()
        );
      }
    } else if (type === 'location') {
      delete updated.latitude;
      delete updated.longitude;
    }

    setStructuredQuery(updated);

    // Recalculate results based on updated structured criteria
    const recalculated = filterProductsByStructuredQuery(updated);
    setResults(recalculated);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setStructuredQuery(null);
    setSearchParams({});
  };

  const handleLocationSelected = () => {
    if (pendingSearchQuery) {
      const params = {};
      if (pendingSearchQuery.trim()) params.q = pendingSearchQuery.trim();
      if (activeCategory && activeCategory !== 'all') params.cat = activeCategory;
      setSearchParams(params);
      setPendingSearchQuery('');
    }
  };

  // Human-friendly empty state subtitle builder
  const getEmptySubtitle = () => {
    if (structuredQuery && Object.keys(structuredQuery).length > 0) {
      const parts = [];
      if (structuredQuery.category) parts.push(structuredQuery.category);
      if (structuredQuery.maxPrice) parts.push(`under ₹${structuredQuery.maxPrice.toLocaleString('en-IN')}`);
      if (structuredQuery.keywords?.length) parts.push(`matching "${structuredQuery.keywords.join(', ')}"`);
      if (parts.length > 0) {
        return `No products found ${parts.join(' ')}. Try resetting some filters or adjusting your search.`;
      }
    }
    return 'Try searching for items like shoes, necklace, shirts, tools, headphones, or browse all categories.';
  };

  return (
    <main className="search-page" id="search-page">
      <div className="container">
        {/* Search Bar section */}
        <div className="search-page-header">
          <button
            type="button"
            className="search-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="search-bar-container">
            <SearchBar
              value={searchQuery}
              onSearch={handleSearchSubmit}
            />
          </div>
        </div>

        {/* Location Banner */}
        <div className="search-location-bar">
          <div className="search-location-info">
            <MapPin size={15} className="search-location-pin" />
            <span>
              Searching in: <strong>{location || 'All Locations (Click to set)'}</strong>
            </span>
          </div>
          {!location && (
            <button
              type="button"
              className="search-set-location-btn"
              onClick={() => setLocationModalOpen(true)}
            >
              Set Location
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="search-categories-bar">
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              isActive={activeCategory === cat.id}
              onClick={() => handleCategorySelect(cat.id)}
            />
          ))}
        </div>

        {/* AI Search Suggestions — shown on initial/empty state */}
        {!queryParam && (
          <AiSearchSuggestions onSelect={handleSearchSuggestion} />
        )}

        {/* AI Search Insights — displayed when structured filters exist */}
        {queryParam && structuredQuery && (
          <AiSearchInsights
            structuredQuery={structuredQuery}
            onRemoveFilter={handleRemoveFilter}
            onReset={handleResetFilters}
          />
        )}

        {/* Results Info Summary Header */}
        <div className="search-results-summary">
          <div className="search-results-title-group">
            <h1 className="search-results-title">
              {queryParam
                ? `Results for "${queryParam}"`
                : activeCategory !== 'all'
                ? `${categories.find((c) => c.id === activeCategory)?.label || ''} Products`
                : 'All Local Products'}
            </h1>
            {queryParam && (
              <span className="search-ai-badge" id="search-ai-badge">
                <Sparkles size={13} className="search-ai-badge-icon" />
                <span>AI Search</span>
              </span>
            )}
          </div>

          <span className="search-results-count">
            {results.length} {results.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {/* Results Grid */}
        <div className="search-results-grid">
          {loading ? (
            <div className="search-skeleton-grid" id="search-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton-card" />
              ))}
            </div>
          ) : (
            <ProductGrid
              products={results}
              emptyTitle={queryParam ? `No results matching "${queryParam}"` : 'No products found'}
              emptySubtitle={getEmptySubtitle()}
              onResetFilters={handleResetFilters}
            />
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => {
          setLocationModalOpen(false);
          setPendingSearchQuery('');
        }}
        onLocationSelected={handleLocationSelected}
      />
    </main>
  );
}
