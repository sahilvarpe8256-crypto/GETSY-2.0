import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ShopCard from '../common/ShopCard';
import { shops } from '../../data/shops';
import './DiscoverShops.css';

export default function DiscoverShops({ onShopClick }) {
  const displayShops = shops.slice(0, 4);

  return (
    <section className="discover-shops" id="discover-shops">
      {/* Header row */}
      <div className="discover-shops-header">
        <div>
          <h2 className="discover-shops-title">Discover Local Shops</h2>
          <p className="discover-shops-subtitle">
            Verified merchants around your area
          </p>
        </div>
        <div className="discover-shops-header-actions">
          <span className="discover-shops-count">{shops.length} new results</span>
          <Link to="/shops" className="discover-shops-view-all">
            <span>View All</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* Shop cards grid */}
      <div className="discover-shops-grid">
        {displayShops.map((shop) => (
          <ShopCard key={shop.id || shop._id} shop={shop} onClick={onShopClick} />
        ))}
      </div>
    </section>
  );
}
