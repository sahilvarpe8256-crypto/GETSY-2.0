import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { categories } from '../../data/categories';
import { getProducts } from '../../services/productService';
import CategoryPill from '../../components/common/CategoryPill';
import ProductGrid from '../../components/product/ProductGrid';
import './Categories.css';

const LEGACY_CATEGORY_ALIASES = {
  ornaments: 'accessories',
  hardware: 'home',
  furniture: 'home'
};

function normalizeCategoryParam(cat) {
  if (!cat) return 'all';
  const lower = cat.toLowerCase().trim();
  return LEGACY_CATEGORY_ALIASES[lower] || lower;
}

export default function Categories() {
  const { location } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const rawCategoryParam = searchParams.get('cat') || 'all';
  const categoryParam = normalizeCategoryParam(rawCategoryParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProducts({
      category: activeCategory === 'all' ? undefined : activeCategory,
      sortBy: sortBy === 'featured' ? undefined : sortBy
    }).then((data) => {
      if (isMounted) {
        setProducts(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, sortBy]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: catId });
    }
  };

  const handleReset = () => {
    setActiveCategory('all');
    setSortBy('featured');
    searchParams.delete('cat');
    setSearchParams(searchParams);
  };

  return (
    <main className="categories-page" id="categories-page">
      <div className="container">
        {/* Header section matching categories section.png */}
        <div className="categories-header">
          <div className="categories-header-left">
            <h1 className="categories-title">Discover Local Products</h1>
            <p className="categories-subtitle">
              Curated finds available on the shelf near you in{' '}
              <span className="categories-location-highlight">
                {location || 'Sangamner'}
              </span>
              .
            </p>
          </div>

          <div className="categories-header-controls">
            {/* Sort Dropdown */}
            <div className="categories-sort-wrapper">
              <select
                className="categories-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                id="categories-sort-select"
                aria-label="Sort products by"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown size={14} className="categories-sort-icon" />
            </div>

            {/* View Mode Toggle */}
            <div className="categories-view-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                id="view-mode-grid-btn"
              >
                <LayoutGrid size={17} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
                id="view-mode-list-btn"
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="categories-pills-bar" id="categories-pills-bar">
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              isActive={activeCategory === cat.id}
              onClick={() => handleCategorySelect(cat.id)}
            />
          ))}
        </div>

        {/* Product Grid Area */}
        <div className="categories-content">
          {loading ? (
            <div className="categories-loading">
              <div className="categories-skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="product-skeleton-card" />
                ))}
              </div>
            </div>
          ) : (
            <ProductGrid
              products={products}
              viewMode={viewMode}
              emptyTitle={`No products found in ${categories.find((c) => c.id === activeCategory)?.label || 'this category'}`}
              emptySubtitle="Try selecting another category or resetting the active filters to see all available local items."
              onResetFilters={handleReset}
            />
          )}
        </div>
      </div>
    </main>
  );
}
