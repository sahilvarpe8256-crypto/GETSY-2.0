import ShopCard from '../common/ShopCard';
import { shops } from '../../data/shops';
import './DiscoverShops.css';

export default function DiscoverShops({ onShopClick }) {
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
        <span className="discover-shops-count">{shops.length} new results</span>
      </div>

      {/* Shop cards grid */}
      <div className="discover-shops-grid">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} onClick={onShopClick} />
        ))}
      </div>
    </section>
  );
}
