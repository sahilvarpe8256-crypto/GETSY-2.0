import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';
import './ProductGrid.css';

export default function ProductGrid({
  products = [],
  viewMode = 'grid', // 'grid' | 'list'
  emptyTitle = 'No products found',
  emptySubtitle = 'Try selecting another category or adjusting your search filters.',
  onResetFilters
}) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty" id="product-grid-empty">
        <div className="product-grid-empty-icon">
          <PackageOpen size={48} />
        </div>
        <h3 className="product-grid-empty-title">{emptyTitle}</h3>
        <p className="product-grid-empty-subtitle">{emptySubtitle}</p>
        {onResetFilters && (
          <button
            type="button"
            className="product-grid-reset-btn"
            onClick={onResetFilters}
            id="reset-filters-btn"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`product-grid product-grid--${viewMode}`} id="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id || product._id}
          product={product}
        />
      ))}
    </div>
  );
}
