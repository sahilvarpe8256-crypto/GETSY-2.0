import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      const el = document.getElementById('discover-shops');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleBrowseCategories = () => {
    requireLocation(() => {
      navigate('/categories');
    });
  };

  const handleSearch = (query) => {
    requireLocation(() => {
      navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    });
  };

  const handleCategoryClick = (catId) => {
    requireLocation(() => {
      setActiveCategory(catId);
      navigate(catId === 'all' ? '/categories' : `/categories?cat=${catId}`);
    });
  };

  const handleShopClick = (shop) => {
    requireLocation(() => {
      navigate(`/shops/${shop.id || shop._id}`);
    });
  };

  const handleLocationSelected = () => {
    if (pendingAction) {
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
              onClick={() => handleCategoryClick(cat.id)}
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
