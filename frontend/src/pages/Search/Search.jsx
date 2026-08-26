import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { categories } from '../../data/categories';
import { searchProducts } from '../../services/productService';
import SearchBar from '../../components/common/SearchBar';
import CategoryPill from '../../components/common/CategoryPill';
import ProductGrid from '../../components/product/ProductGrid';
import LocationModal from '../../components/common/LocationModal';
import './Search.css';

export default function Search() {
  const { location } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');

  // Synchronize state with URL parameters
  useEffect(() => {
    setSearchQuery(queryParam);
    setActiveCategory(categoryParam);
  }, [queryParam, categoryParam]);

  // Execute search
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    searchProducts(queryParam, location).then((allResults) => {
      if (!isMounted) return;

      let filtered = allResults;
      if (activeCategory && activeCategory !== 'all') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );
      }

      setResults(filtered);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [queryParam, activeCategory, location]);

  const handleSearchSubmit = (newQuery) => {
    if (!location) {
      setPendingSearchQuery(newQuery);
      setLocationModalOpen(true);
      return;
    }

    const params = {};
    if (newQuery && newQuery.trim()) params.q = newQuery.trim();
    if (activeCategory && activeCategory !== 'all') params.cat = activeCategory;
    setSearchParams(params);
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

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    const params = {};
    if (queryParam) params.q = queryParam;
    if (catId !== 'all') params.cat = catId;
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSearchParams({});
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
            <SearchBar onSearch={handleSearchSubmit} />
          </div>
        </div>

        {/* Location Banner */}
        <div className="search-location-bar">
          <div className="search-location-info">
            <MapPin size={15} className="search-location-pin" />
            <span>Searching in: <strong>{location || 'All Locations (Click to set)'}</strong></span>
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

        {/* Results Info */}
        <div className="search-results-summary">
          <h1 className="search-results-title">
            {queryParam
              ? `Results for "${queryParam}"`
              : activeCategory !== 'all'
              ? `${categories.find((c) => c.id === activeCategory)?.label} Products`
              : 'All Local Products'}
          </h1>
          <span className="search-results-count">
            {results.length} {results.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {/* Results Grid */}
        <div className="search-results-grid">
          {loading ? (
            <div className="search-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton-card" />
              ))}
            </div>
          ) : (
            <ProductGrid
              products={results}
              emptyTitle={`No results matching "${queryParam || activeCategory}"`}
              emptySubtitle="Try searching for items like shoes, necklace, shirt, apples, headphones, or change the category."
              onResetFilters={handleClearSearch}
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
