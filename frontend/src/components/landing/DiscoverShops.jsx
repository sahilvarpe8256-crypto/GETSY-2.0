import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ShopCard from '../common/ShopCard';
import { getShops } from '../../services/shopService';
import { shops as staticShops } from '../../data/shops';
import './DiscoverShops.css';

export default function DiscoverShops({ onShopClick }) {
  const [shopList, setShopList] = useState(() => staticShops.slice(0, 4));
  const [totalCount, setTotalCount] = useState(staticShops.length);

  useEffect(() => {
    let isMounted = true;

    getShops().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setShopList(data.slice(0, 4));
        setTotalCount(data.length);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
          <span className="discover-shops-count">{totalCount} results</span>
          <Link to="/shops" className="discover-shops-view-all">
            <span>View All</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* Shop cards grid */}
      <div className="discover-shops-grid">
        {shopList.map((shop) => (
          <ShopCard key={shop.id || shop._id} shop={shop} onClick={onShopClick} />
        ))}
      </div>
    </section>
  );
}
