import { useState, useCallback } from 'react';
import { useLocation } from '../../context/LocationContext';
import HeroSection from '../../components/landing/HeroSection';
import SearchBar from '../../components/common/SearchBar';
import CategoryPill from '../../components/common/CategoryPill';
import DiscoverShops from '../../components/landing/DiscoverShops';
import LocationModal from '../../components/common/LocationModal';
import { categories } from '../../data/categories';
import './Home.css';

export default function Home() {
  const { location } = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  /**
   * If no location is set, open the modal and store the intended action.
   * After location is selected, the pending action fires.
   */
  const requireLocation = useCallback(
    (action) => {
      if (!location) {
        setPendingAction(() => action);
        setLocationModalOpen(true);
      } else {
        action();
      }
    },
    [location]
  );

  const handleExploreShops = () => {
    requireLocation(() => {
      /* Phase 1: scroll to discover shops section */
      const el = document.getElementById('discover-shops');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleBrowseCategories = () => {
    requireLocation(() => {
      /* Phase 1: scroll to categories area */
      const el = document.getElementById('categories-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleSearch = (query) => {
    requireLocation(() => {
      /* Phase 1: no real search — visual only */
      console.log('Search:', query, 'Location:', location);
    });
  };

  const handleShopClick = (shop) => {
    requireLocation(() => {
      /* Phase 1: visual confirmation only */
      console.log('Shop clicked:', shop.name, 'Location:', location);
    });
  };

  const handleLocationSelected = () => {
    /* Execute the pending action now that location is set */
    if (pendingAction) {
      /* Small delay so modal close animation completes */
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 200);
    }
  };

  return (
    <main className="home">
      {/* Hero */}
      <HeroSection
        onExploreShops={handleExploreShops}
        onBrowseCategories={handleBrowseCategories}
      />

      {/* Search + Category pills */}
      <div className="home-search-section" id="categories-section">
        <SearchBar onSearch={handleSearch} />

        <div className="home-categories">
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Discover Local Shops */}
      <DiscoverShops onShopClick={handleShopClick} />

      {/* Location modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => {
          setLocationModalOpen(false);
          setPendingAction(null);
        }}
        onLocationSelected={handleLocationSelected}
      />
    </main>
  );
}
